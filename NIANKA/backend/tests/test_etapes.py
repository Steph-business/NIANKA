import pytest

def test_workflow_etapes_traçabilite(client):
    # 1. Inscription Agent Terrain
    client.post("/api/v1/auth/register", json={
        "nom_complet": "Agent Pisteur",
        "pseudo": "pisteur_1",
        "email": "agent@nianka.ci",
        "password": "Password123!",
        "role": "agent"
    })

    from backend.tests.test_auth import app_db_gen
    from backend.modules.authentification.models import OTP, User
    db = next(app_db_gen(client))

    otp_record = db.query(OTP).join(User).filter(User.email == "agent@nianka.ci").first()
    client.post("/api/v1/auth/verify-otp", json={"email": "agent@nianka.ci", "otp": otp_record.otp_code})

    login_resp = client.post("/api/v1/auth/login", json={"email": "agent@nianka.ci", "password": "Password123!"})
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

    # 5. Scan d'arbitrage par l'IA à l'Entrepôt et scellement de la vente
    arbitrage_payload = {
        "bordereau_id": bordereau_id,
        "scan_entrepot_image_url": "https://storage.nianka.ci/scans/entrepot_001.jpg",
        "scan_entrepot_grade": "A",
        "scan_entrepot_kor": 54.0,
        "scan_entrepot_humidite": 6.8
    }
    arbitrage_resp = client.post("/api/v1/etapes/arbitrage", json=arbitrage_payload, headers=headers)
    assert arbitrage_resp.status_code == 201
    res = arbitrage_resp.json()
    assert res["verdict_conforme"] is True
    assert res["statut_vente"] == "VENTE_SCELLEE"
