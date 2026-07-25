"""
Suite de tests complète d'intégration de la plateforme NIANKA (FastAPI & IA MobileNetV3)
"""

import sys
import io
import json
from pathlib import Path
from PIL import Image

# Add root directory to sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_01_health_check():
    """1. Vérification du Health Check de l'API"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    print("[TEST 1/8] Health Check FastAPI: OK")

import time

def test_02_authentication_flow():
    """2. Test Inscription et Connexion Utilisateur JWT"""
    phone_id = int(time.time() * 1000) % 1000000
    email = f"agent{phone_id}@nianka.ci"
    password = "TestPassword123!"
    
    # Inscription
    reg_payload = {
        "nom_complet": f"Agent Test Qualité {phone_id}",
        "pseudo": f"agent{phone_id}",
        "email": email,
        "password": password,
        "role": "cooperative",
        "telephone": f"+22507{phone_id:08d}"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code in [200, 201], f"Register failed: {reg_res.text}"
    
    # Get actual OTP code from DB for test verification
    from backend.database import get_db
    from backend.modules.authentification.models import OTP, User
    db = next(get_db())
    u = db.query(User).filter(User.email == email.lower()).first()
    otp_rec = db.query(OTP).filter(OTP.user_id == u.id, OTP.used == False).first() if u else None
    otp_code = otp_rec.otp_code if otp_rec else "123456"

    # Verify OTP
    v_res = client.post("/api/v1/auth/verify-otp", json={"email": email, "otp": otp_code})
    assert v_res.status_code == 200, f"Verify OTP failed: {v_res.text}"

    # Connexion
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["token"]
    if isinstance(token, dict):
        token = token.get("access_token")

    print(f"[TEST 2/8] Authentification JWT (Token: {str(token)[:20]}...): OK")
    return token

def test_03_ai_prediction_model():
    """3. Inférence IA sur 4 échantillons d'Anacarde (Grade A, B, C, Rejeté)"""
    colors = [
        ("Grade A (Haute Qualité)", (190, 170, 110)),
        ("Grade B (Standard)", (140, 120, 80)),
        ("Grade C (Second Choix)", (100, 80, 50)),
        ("Rejeté (Défectueux)", (40, 30, 20))
    ]

    for label, rgb in colors:
        img = Image.new("RGB", (224, 224), color=rgb)
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)

        files = {"file": (f"sample_{label}.jpg", buf.getvalue(), "image/jpeg")}
        data = {
            "producer": "Kouassi Jean",
            "cooperative": "Coop Anacarde Korhogo",
            "weight_kg": "250.0",
            "gps": "9.4580° N, 5.6296° W"
        }

        res = client.post("/api/v1/etapes/predict-quality", files=files, data=data)
        assert res.status_code == 200
        result = res.json()
        assert "predicted_grade" in result
        assert "metrics" in result
        assert "kor_lbs" in result["metrics"]
        print(f"   -> Image {label} => Prédit: {result['predicted_grade']} ({result['confidence_pct']}%, KOR: {result['metrics']['kor_lbs']} lbs)")

    print("[TEST 3/8] Modèle d'Inférence IA model_anacarde.keras: OK")

def test_04_traceability_lots(token):
    """4. Création et consultation des Lots de Cajou"""
    headers = {"Authorization": f"Bearer {token}"}
    
    lot_payload = {
        "nom_producteur": "Yao Patrice",
        "nom_cooperative": "Coop ANADER Bouaké",
        "poids_tonnes": 15.5,
        "grade_qualite": "Grade A",
        "kor_score": 53.8,
        "coord_gps": "7.6938° N, 5.0303° W"
    }
    create_res = client.post("/api/v1/etapes/lots", json=lot_payload, headers=headers)
    assert create_res.status_code in [200, 201]

    list_res = client.get("/api/v1/etapes/lots", headers=headers)
    assert list_res.status_code == 200
    lots = list_res.json()
    assert len(lots) >= 1
    print(f"[TEST 4/8] Gestion des Lots de Traçabilité ({len(lots)} lots enregistrés): OK")

def test_05_transfer_orders(token):
    """5. Émission et lecture des Bordereaux de Transfert avec QR Code"""
    headers = {"Authorization": f"Bearer {token}"}

    # First submit scan to get scan_initial_id
    scan_res = client.post("/api/v1/etapes/scan", json={
        "image_url": "https://storage.supabase.co/scans/sample.jpg",
        "grade_ia": "Grade A",
        "score_confiance": 0.98,
        "score_kor": 54.2,
        "humidite": 6.8,
        "etape": "reception_cooperative"
    }, headers=headers)
    assert scan_res.status_code in [200, 201], f"Scan failed: {scan_res.text}"
    scan_id = scan_res.json()["id"]

    transfer_payload = {
        "scan_initial_id": scan_id,
        "immatriculation_camion": "CI-482-AB",
        "nom_chauffeur": "Koffi B.",
        "volume_tonnes": 20.0,
        "grade_lot": "Grade A"
    }
    trf_res = client.post("/api/v1/etapes/transfert", json=transfer_payload, headers=headers)
    assert trf_res.status_code in [200, 201], f"Transfer order failed: {trf_res.text}"
    trf_data = trf_res.json()
    num_bordereau = trf_data["numero_bordereau"]
    bordereau_uuid = trf_data["id"]

    # Lecture par numéro
    get_res = client.get(f"/api/v1/etapes/transfert/{num_bordereau}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["numero_bordereau"] == num_bordereau
    print(f"[TEST 5/8] Bordereaux de Transfert & QR Code ({num_bordereau}): OK")
    return bordereau_uuid

def test_06_warehouse_arbitrage(token, bordereau_uuid):
    """6. Arbitrage Neutre à l'Entrepôt Central et Scellement de la Vente"""
    headers = {"Authorization": f"Bearer {token}"}

    arbitrage_payload = {
        "bordereau_id": bordereau_uuid,
        "scan_entrepot_image_url": "https://storage.supabase.co/scans/entrepot.jpg",
        "scan_entrepot_grade": "Grade A",
        "scan_entrepot_kor": 53.8,
        "scan_entrepot_humidite": 6.9
    }
    res = client.post("/api/v1/etapes/arbitrage", json=arbitrage_payload, headers=headers)
    assert res.status_code in [200, 201], f"Arbitrage failed: {res.text}"
    arb_data = res.json()
    assert arb_data["verdict_conforme"] is True
    print(f"[TEST 6/8] Arbitrage Neutre Entrepôt (Statut Vente: {arb_data.get('statut_vente')}): OK")

def test_07_traceability_stats(token):
    """7. Statistiques Consolidées & Tableaux de Bord Institutionnels"""
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/v1/etapes/stats", headers=headers)
    assert res.status_code == 200
    stats = res.json()
    assert "tonnage_total_collecte" in stats
    assert "kor_moyen" in stats
    print(f"[TEST 7/8] Stats Traçabilité (Tonnage: {stats['tonnage_total_collecte']} T, KOR Moyen: {stats['kor_moyen']} lbs): OK")

def test_08_notifications_and_reports(token):
    """8. Notifications et Rapports Ministériels"""
    headers = {"Authorization": f"Bearer {token}"}

    notif_res = client.get("/api/v1/notifications/", headers=headers)
    assert notif_res.status_code == 200

    rapport_res = client.get("/api/v1/rapports/", headers=headers)
    assert rapport_res.status_code == 200
    print("[TEST 8/8] Notifications & Rapports Ministériels: OK")

def run_all_tests():
    print("=" * 60)
    print("--- DEMARRAGE DE LA SUITE DE TESTS END-TO-END DE NIANKA ---")
    print("=" * 60)
    
    test_01_health_check()
    token = test_02_authentication_flow()
    test_03_ai_prediction_model()
    test_04_traceability_lots(token)
    bordereau_id = test_05_transfer_orders(token)
    test_06_warehouse_arbitrage(token, bordereau_id)
    test_07_traceability_stats(token)
    test_08_notifications_and_reports(token)

    print("=" * 60)
    print("[SUCCESS TOTAL] LES 8 MODULES TESTES SONT 100% OPERATIONNELS !")
    print("=" * 60)

if __name__ == "__main__":
    run_all_tests()
