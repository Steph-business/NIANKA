"""
Suite d'intégration NIANKA — chaîne complète de traçabilité.

Agent (bord champ) -> Coopérative (bordereau + QR) -> Entrepôt (arbitrage IA)
-> Usinier / Exportateur (lot certifié).

Ces tests s'exécutent sur la base SQLite en mémoire fournie par `conftest.py`.
Ils n'écrivent JAMAIS dans la base Supabase de production.
"""

import io

import pytest
from PIL import Image

MOT_DE_PASSE = "TestPassword123!"


# --------------------------------------------------------------------- #
# Utilitaires                                                            #
# --------------------------------------------------------------------- #

def _echantillon_jpeg(rgb=(190, 170, 110)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (224, 224), color=rgb).save(buf, format="JPEG")
    return buf.getvalue()


def _inscrire(client, role, nom, telephone, cooperative_id=None) -> str:
    payload = {
        "nom_complet": nom,
        "pseudo": nom.lower().replace(" ", "").replace("'", ""),
        "email": f"{nom.lower().replace(' ', '').replace(chr(39), '')}@nianka.ci",
        "password": MOT_DE_PASSE,
        "role": role,
        "telephone": telephone,
    }
    if cooperative_id:
        payload["cooperative_id"] = cooperative_id

    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code in (200, 201), f"Inscription échouée ({role}) : {res.text}"
    return res.json()["id"]


def _entetes(client, telephone) -> dict:
    """Connexion par téléphone + mot de passe, sans vérification OTP."""
    res = client.post("/api/v1/auth/login", json={
        "login_input": telephone,
        "password": MOT_DE_PASSE,
    })
    assert res.status_code == 200, f"Connexion échouée : {res.text}"
    return {"Authorization": f"Bearer {res.json()['token']}"}


@pytest.fixture
def filiere(client):
    """Jeu d'acteurs complet, avec agents rattachés à leur coopérative."""
    coop = _inscrire(client, "cooperative", "Coop ANADER Bouake", "+2250202000001")
    coop_rivale = _inscrire(client, "cooperative", "Coop Korhogo", "+2250202000002")
    agent = _inscrire(client, "agent", "Sarah Kone", "+2250101000001", cooperative_id=coop)
    entrepot = _inscrire(client, "entrepot", "Entrepot Abidjan Port", "+2250303000001")
    usine = _inscrire(client, "usine", "Usine Cajou SA", "+2250404000001")
    exportateur = _inscrire(client, "exportateur", "Export Ivoire", "+2250505000001")

    return {
        "ids": {
            "coop": coop, "coop_rivale": coop_rivale, "agent": agent,
            "entrepot": entrepot, "usine": usine, "exportateur": exportateur,
        },
        "h": {
            "coop": _entetes(client, "+2250202000001"),
            "coop_rivale": _entetes(client, "+2250202000002"),
            "agent": _entetes(client, "+2250101000001"),
            "entrepot": _entetes(client, "+2250303000001"),
            "usine": _entetes(client, "+2250404000001"),
            "exportateur": _entetes(client, "+2250505000001"),
        },
    }


@pytest.fixture
def scan_terrain(client, filiere):
    """Étape 1 : l'agent analyse un échantillon bord champ."""
    res = client.post(
        "/api/v1/etapes/predict-quality",
        files={"file": ("echantillon.jpg", _echantillon_jpeg(), "image/jpeg")},
        data={
            "producer": "Yao Patrice",
            "cooperative": "Coop ANADER Bouake",
            "weight_kg": "500",
            "sample_weight_kg": "1.0",
            "gps": "7.6938 N, 5.0303 W",
        },
        headers=filiere["h"]["agent"],
    )
    assert res.status_code == 200, res.text
    return res.json()


@pytest.fixture
def bordereau(client, filiere, scan_terrain):
    """Étape 2 : la coopérative émet le bordereau de livraison."""
    res = client.post("/api/v1/etapes/transfert", json={
        "scan_initial_id": scan_terrain["scan_id"],
        "entrepot_id": filiere["ids"]["entrepot"],
        "immatriculation_camion": "CI-482-AB",
        "nom_chauffeur": "Koffi B.",
        "volume_tonnes": 20.0,
        "grade_lot": "Grade A",
    }, headers=filiere["h"]["coop"])
    assert res.status_code in (200, 201), res.text
    return res.json()


# --------------------------------------------------------------------- #
# 1. Socle                                                               #
# --------------------------------------------------------------------- #

def test_01_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    # L'état réel du moteur d'inférence doit être exposé, jamais masqué.
    assert "ia" in data and "model_loaded" in data["ia"]


def test_02_connexion_par_telephone_sans_otp(client, filiere):
    """La connexion se fait au numéro + mot de passe, sans vérification OTP."""
    for variante in ("+2250101000001", "0101000001", "225 01 01 00 00 01"):
        res = client.post("/api/v1/auth/login", json={
            "login_input": variante, "password": MOT_DE_PASSE,
        })
        assert res.status_code == 200, f"Format « {variante} » rejeté : {res.text}"
        assert res.json()["user"]["id"] == filiere["ids"]["agent"]

    mauvais = client.post("/api/v1/auth/login", json={
        "login_input": "+2250101000001", "password": "mauvais",
    })
    assert mauvais.status_code == 401


def test_03_rattachement_agent_cooperative(client, filiere):
    profil = client.get("/api/v1/auth/me", headers=filiere["h"]["agent"]).json()
    assert profil["cooperative_id"] == filiere["ids"]["coop"]

    pisteurs = client.get("/api/v1/auth/pisteurs", headers=filiere["h"]["coop"]).json()
    assert [p["id"] for p in pisteurs] == [filiere["ids"]["agent"]]

    # La coopérative rivale ne voit aucun agent
    assert client.get("/api/v1/auth/pisteurs", headers=filiere["h"]["coop_rivale"]).json() == []


# --------------------------------------------------------------------- #
# 2. Étape 1 — Collecte bord champ                                       #
# --------------------------------------------------------------------- #

def test_04_inference_ia_et_persistance(client, filiere, scan_terrain):
    assert scan_terrain["predicted_grade"] in ("Grade A", "Grade B", "Grade C", "Rejeté")
    assert scan_terrain["metrics"]["kor_lbs"] > 0
    # Le scan est rattaché à l'agent authentifié, jamais deviné
    assert scan_terrain["agent_id"] == filiere["ids"]["agent"]
    # Le GPS saisi sur le terrain est bien décodé et persisté
    assert scan_terrain["gps_lat"] == pytest.approx(7.6938, abs=1e-4)
    assert scan_terrain["gps_long"] == pytest.approx(-5.0303, abs=1e-4)


def test_05_predict_quality_exige_authentification(client):
    res = client.post(
        "/api/v1/etapes/predict-quality",
        files={"file": ("x.jpg", _echantillon_jpeg(), "image/jpeg")},
    )
    assert res.status_code == 401


def test_06_notification_vers_la_bonne_cooperative(client, filiere, scan_terrain):
    coop = client.get("/api/v1/notifications/", headers=filiere["h"]["coop"]).json()
    rivale = client.get("/api/v1/notifications/", headers=filiere["h"]["coop_rivale"]).json()

    assert len(coop) == 1
    assert "Sarah Kone" in coop[0]["contenu"]
    assert rivale == [], "Une coopérative tierce ne doit recevoir aucune notification"


def test_07_cloisonnement_des_scans(client, filiere, scan_terrain):
    assert len(client.get("/api/v1/etapes/scans", headers=filiere["h"]["coop"]).json()) == 1
    assert client.get("/api/v1/etapes/scans", headers=filiere["h"]["coop_rivale"]).json() == []


# --------------------------------------------------------------------- #
# 3. Étape 2 — Bordereau & QR Code                                       #
# --------------------------------------------------------------------- #

def test_08_bordereau_porte_le_vrai_scan(client, filiere, scan_terrain, bordereau):
    import json

    assert bordereau["scan_initial_id"] == scan_terrain["scan_id"]
    assert bordereau["kor_initial"] == scan_terrain["metrics"]["kor_lbs"]
    assert bordereau["nom_agent"] == "Sarah Kone"
    assert bordereau["nom_entrepot"] == "Entrepot Abidjan Port"

    qr = json.loads(bordereau["qr_payload"])
    assert qr["kor_initial"] == scan_terrain["metrics"]["kor_lbs"]
    assert qr["agent_pisteur"] == "Sarah Kone"
    assert qr["gps_collecte"][0] == pytest.approx(7.6938, abs=1e-4)


def test_09_bordereau_refuse_sans_scan(client, filiere):
    """Aucun scan de la coopérative => refus, plutôt qu'un scan fabriqué."""
    res = client.post("/api/v1/etapes/transfert", json={
        "entrepot_id": filiere["ids"]["entrepot"],
        "immatriculation_camion": "CI-000-AA",
        "nom_chauffeur": "Test",
        "volume_tonnes": 5.0,
    }, headers=filiere["h"]["coop_rivale"])
    assert res.status_code == 400
    assert "scan bord champ" in res.json()["detail"].lower()


def test_10_entrepot_notifie_et_liste_ses_arrivages(client, filiere, bordereau):
    notifs = client.get("/api/v1/notifications/", headers=filiere["h"]["entrepot"]).json()
    assert any(bordereau["numero_bordereau"] in n["contenu"] for n in notifs)

    arrivages = client.get("/api/v1/etapes/transferts", headers=filiere["h"]["entrepot"]).json()
    assert [b["numero_bordereau"] for b in arrivages] == [bordereau["numero_bordereau"]]


def test_11_preremplissage_a_la_reception(client, filiere, bordereau, scan_terrain):
    """L'entrepôt doit tout obtenir en un appel (guide §4 étape 4)."""
    res = client.get(
        f"/api/v1/etapes/transfert/{bordereau['numero_bordereau']}",
        headers=filiere["h"]["entrepot"],
    )
    assert res.status_code == 200
    data = res.json()

    assert data["nom_cooperative"] == "Coop ANADER Bouake"
    assert data["nom_agent"] == "Sarah Kone"
    assert data["immatriculation_camion"] == "CI-482-AB"

    scan = data["scan_initial"]
    assert scan["id"] == scan_terrain["scan_id"]
    assert scan["score_kor"] == scan_terrain["metrics"]["kor_lbs"]
    assert scan["image_url"]


# --------------------------------------------------------------------- #
# 4. Étape 4 — Arbitrage neutre                                          #
# --------------------------------------------------------------------- #

def test_12_arbitrage_reserve_a_l_entrepot(client, filiere, bordereau):
    res = client.post("/api/v1/etapes/arbitrage", json={
        "bordereau_id": bordereau["id"],
        "scan_entrepot_image_url": "/uploads/scans/x.jpg",
        "scan_entrepot_grade": "Grade A",
        "scan_entrepot_kor": 54.0,
        "scan_entrepot_humidite": 6.9,
    }, headers=filiere["h"]["agent"])
    assert res.status_code == 403


def test_13_arbitrage_conforme_et_verdict(client, filiere, bordereau, scan_terrain):
    kor_initial = scan_terrain["metrics"]["kor_lbs"]

    res = client.post("/api/v1/etapes/arbitrage", json={
        "bordereau_id": bordereau["id"],
        "scan_entrepot_image_url": "/uploads/scans/dechargement.jpg",
        "scan_entrepot_grade": "Grade A",
        "scan_entrepot_kor": kor_initial + 0.4,   # écart sous le seuil de 1.5
        "scan_entrepot_humidite": 6.9,
        "acheteur_id": filiere["ids"]["usine"],
    }, headers=filiere["h"]["entrepot"])

    assert res.status_code in (200, 201), res.text
    arb = res.json()
    assert arb["verdict_conforme"] is True
    assert arb["delta_kor"] == pytest.approx(0.4, abs=0.05)
    assert arb["scan_initial_kor"] == kor_initial


def test_14_ecart_important_declare_non_conforme(client, filiere, bordereau, scan_terrain):
    res = client.post("/api/v1/etapes/arbitrage", json={
        "bordereau_id": bordereau["id"],
        "scan_entrepot_image_url": "/uploads/scans/dechargement.jpg",
        "scan_entrepot_grade": "Grade C",
        "scan_entrepot_kor": scan_terrain["metrics"]["kor_lbs"] - 6.0,
        "scan_entrepot_humidite": 12.0,
        "acheteur_id": filiere["ids"]["usine"],
    }, headers=filiere["h"]["entrepot"])
    assert res.status_code in (200, 201)
    assert res.json()["verdict_conforme"] is False


def test_15_double_arbitrage_bloque(client, filiere, bordereau):
    charge = {
        "bordereau_id": bordereau["id"],
        "scan_entrepot_image_url": "/uploads/scans/x.jpg",
        "scan_entrepot_grade": "Grade A",
        "scan_entrepot_kor": 54.0,
        "scan_entrepot_humidite": 6.9,
    }
    premier = client.post("/api/v1/etapes/arbitrage", json=charge, headers=filiere["h"]["entrepot"])
    assert premier.status_code in (200, 201)

    second = client.post("/api/v1/etapes/arbitrage", json=charge, headers=filiere["h"]["entrepot"])
    assert second.status_code == 409


# --------------------------------------------------------------------- #
# 5. Étape 5 — Transmission au portail acheteur                          #
# --------------------------------------------------------------------- #

def test_16_lot_certifie_transmis_au_bon_acheteur(client, filiere, bordereau, scan_terrain):
    client.post("/api/v1/etapes/arbitrage", json={
        "bordereau_id": bordereau["id"],
        "scan_entrepot_image_url": "/uploads/scans/dechargement.jpg",
        "scan_entrepot_grade": "Grade A",
        "scan_entrepot_kor": scan_terrain["metrics"]["kor_lbs"] + 0.3,
        "scan_entrepot_humidite": 6.9,
        "acheteur_id": filiere["ids"]["usine"],
    }, headers=filiere["h"]["entrepot"])

    usine = client.get("/api/v1/etapes/lots-certifies", headers=filiere["h"]["usine"]).json()
    assert len(usine) == 1
    lot = usine[0]
    assert lot["numero_bordereau"] == bordereau["numero_bordereau"]
    assert lot["nom_cooperative"] == "Coop ANADER Bouake"
    assert lot["nom_agent"] == "Sarah Kone"
    assert lot["kor_initial"] == scan_terrain["metrics"]["kor_lbs"]
    assert lot["verdict_conforme"] is True

    # L'exportateur, non désigné, ne doit rien voir
    assert client.get("/api/v1/etapes/lots-certifies", headers=filiere["h"]["exportateur"]).json() == []

    notifs = client.get("/api/v1/notifications/", headers=filiere["h"]["usine"]).json()
    assert any(bordereau["numero_bordereau"] in n["contenu"] for n in notifs)


def test_17_certificat_avec_qr_code(client, filiere, bordereau):
    res = client.get(f"/api/v1/etapes/certificat/{bordereau['numero_bordereau']}")
    assert res.status_code == 200
    assert "<svg" in res.text, "Le QR Code de traçabilité doit être gravé sur le certificat"
    assert bordereau["numero_bordereau"] in res.text
    assert "Coop ANADER Bouake" in res.text
    assert "Sarah Kone" in res.text


# --------------------------------------------------------------------- #
# 6. Consolidation                                                       #
# --------------------------------------------------------------------- #

def test_18_statistiques_par_perimetre(client, filiere, bordereau):
    coop = client.get("/api/v1/etapes/stats", headers=filiere["h"]["coop"]).json()
    assert coop["total_scans_count"] == 1
    assert coop["total_bordereaux"] == 1
    assert coop["lots_en_transit"] == 1     # calculé, plus codé à zéro
    assert coop["lots_scelles"] == 0

    rivale = client.get("/api/v1/etapes/stats", headers=filiere["h"]["coop_rivale"]).json()
    assert rivale["total_scans_count"] == 0
    assert rivale["total_bordereaux"] == 0


def test_19_rapports(client, filiere):
    res = client.post("/api/v1/rapports/generate",
                      json={"type_rapport": "statistique_kor", "periode": "30d"},
                      headers=filiere["h"]["coop"])
    assert res.status_code in (200, 201), res.text
    assert res.json()["titre"]

    liste = client.get("/api/v1/rapports/", headers=filiere["h"]["coop"])
    assert liste.status_code == 200
    assert len(liste.json()) == 1


def test_20_annuaire_public_sans_donnees_de_contact(client, filiere):
    res = client.get("/api/v1/auth/entites?role=cooperative")
    assert res.status_code == 200
    entites = res.json()
    assert len(entites) == 2
    for e in entites:
        assert set(e.keys()) == {"id", "nom_complet", "role"}, \
            "L'annuaire public ne doit exposer ni téléphone ni e-mail"
