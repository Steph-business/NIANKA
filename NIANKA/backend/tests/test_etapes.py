import pytest

def test_workflow_etapes_traçabilite(client):
    # 1. Inscription Agent Terrain
    client.post("/api/v1/auth/register", json={
        "nom_complet": "Agent Pisteur",
        "pseudo": "pisteur_1",
        "email": "agent@nianka.ci",
        "telephone": "+2250700000002",
        "password": "Password123!",
        "role": "agent"
    })

    from backend.tests.test_auth import app_db_gen
    from backend.modules.authentification.models import OTP, User
    db = next(app_db_gen(client))

    otp_record = db.query(OTP).join(User).filter(User.telephone == "+2250700000002").first()
    client.post("/api/v1/auth/verify-otp", json={"telephone": "+2250700000002", "otp": otp_record.otp_code})

    login_resp = client.post("/api/v1/auth/login", json={"telephone": "+2250700000002", "password": "Password123!"})
    token = login_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Agent fait un scan d'analyse sur le terrain
    scan_payload = {
        "image_url": "https://storage.nianka.ci/scans/sample_001.jpg",
        "grade_ia": "A",
        "score_confiance": 0.96,
        "score_kor": 54.2,
        "humidite": 6.8,
        "gps_lat": 7.6938,
        "gps_long": -5.0303
    }
    scan_resp = client.post("/api/v1/etapes/scan", json=scan_payload, headers=headers)
    assert scan_resp.status_code == 201
    scan_id = scan_resp.json()["id"]

    # 3. Émission d'un Ordre de Transfert (Bordereau avec QR Code)
    transfer_payload = {
        "scan_initial_id": scan_id,
        "immatriculation_camion": "CI-482-AB",
        "nom_chauffeur": "Koffi B.",
        "volume_tonnes": 25.0,
        "grade_lot": "Grade A"
    }
    transfer_resp = client.post("/api/v1/etapes/transfert", json=transfer_payload, headers=headers)
    assert transfer_resp.status_code == 201
    bordereau_id = transfer_resp.json()["id"]
    numero_bordereau = transfer_resp.json()["numero_bordereau"]
    assert "TRF-" in numero_bordereau

    # 4. Lecture du bordereau par numéro ou QR Code
    get_trf = client.get(f"/api/v1/etapes/transfert/{numero_bordereau}", headers=headers)
    assert get_trf.status_code == 200
    assert get_trf.json()["immatriculation_camion"] == "CI-482-AB"

    # 5. L'arbitrage est un acte d'entrepôt : un agent ne peut pas sceller la vente.
    arbitrage_payload = {
        "bordereau_id": bordereau_id,
        "scan_entrepot_image_url": "https://storage.nianka.ci/scans/entrepot_001.jpg",
        "scan_entrepot_grade": "A",
        "scan_entrepot_kor": 54.0,
        "scan_entrepot_humidite": 6.8
    }
    refus = client.post("/api/v1/etapes/arbitrage", json=arbitrage_payload, headers=headers)
    assert refus.status_code == 403

    # 6. Le même arbitrage, réalisé par l'inspecteur d'entrepôt, scelle la vente.
    client.post("/api/v1/auth/register", json={
        "nom_complet": "Inspecteur Entrepot",
        "pseudo": "inspecteur_1",
        "email": "entrepot@nianka.ci",
        "telephone": "+2250700000003",
        "password": "Password123!",
        "role": "entrepot"
    })
    login_entrepot = client.post("/api/v1/auth/login", json={
        "telephone": "+2250700000003", "password": "Password123!"
    })
    headers_entrepot = {"Authorization": f"Bearer {login_entrepot.json()['token']}"}

    arbitrage_resp = client.post("/api/v1/etapes/arbitrage", json=arbitrage_payload, headers=headers_entrepot)
    assert arbitrage_resp.status_code == 201, arbitrage_resp.text
    res = arbitrage_resp.json()
    assert res["verdict_conforme"] is True
    assert res["statut_vente"] == "VENTE_SCELLEE"
    # Le KOR de référence provient du scan bord champ réel, pas d'une valeur en dur.
    assert res["scan_initial_kor"] == 54.2
