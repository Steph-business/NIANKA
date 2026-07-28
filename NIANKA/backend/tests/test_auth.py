def test_get_profiles(client):
    response = client.get("/api/v1/auth/profiles")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_register_and_verify_and_login(client):
    # 1. Register User
    reg_payload = {
        "nom_complet": "Koffi Agent",
        "pseudo": "koffi_agent",
        "email": "koffi@nianka.ci",
        "telephone": "+2250700000001",
        "password": "Password123!",
        "role": "agent"
    }
    response = client.post("/api/v1/auth/register", json=reg_payload)
    assert response.status_code == 201
    user_data = response.json()
    assert user_data["email"] == "koffi@nianka.ci"
    assert user_data["email_verified"] is False

    # 2. Login with phone works without OTP verification in development mode
    login_payload = {
        "telephone": "+2250700000001",
        "password": "Password123!"
    }
    login_resp = client.post("/api/v1/auth/login", json=login_payload)
    assert login_resp.status_code == 200

    # 3. Fetch OTP code from DB & Verify OTP
    from backend.modules.authentification.models import OTP, User
    from backend.database import SessionLocal

    # Get user and latest OTP from testing DB
    # Note: testing fixture session handles DB, so we query via client's app
    # For quick test verification, we bypass OTP using directly verified flag or verify_otp endpoint
    # Let's test direct verify endpoint
    # We can fetch latest OTP by getting OTP object from session or testing verify
    # In test DB, let's verify via verify endpoint using test OTP
    db = next(app_db_gen(client))
    otp_record = db.query(OTP).join(User).filter(User.telephone == "+2250700000001").first()
    assert otp_record is not None

    verify_resp = client.post("/api/v1/auth/verify-otp", json={
        "telephone": "+2250700000001",
        "otp": otp_record.otp_code
    })
    assert verify_resp.status_code == 200
    assert verify_resp.json()["email_verified"] is True

    # 4. Login after verification
    login_ok = client.post("/api/v1/auth/login", json=login_payload)
    assert login_ok.status_code == 200
    res_data = login_ok.json()
    assert "token" in res_data
    token = res_data["token"]

    # 5. Access /me endpoint
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["pseudo"] == "koffi_agent"


def test_list_acheteurs(client):
    # Crée un compte entrepôt pour accéder à la liste des acheteurs
    client.post("/api/v1/auth/register", json={
        "nom_complet": "Entrepot Central",
        "pseudo": "entrepot_test",
        "email": "entrepot@nianka.ci",
        "telephone": "+2250700000003",
        "password": "Password123!",
        "role": "entrepot"
    })

    client.post("/api/v1/auth/register", json={
        "nom_complet": "Usine de Décorticage",
        "pseudo": "usine_test",
        "email": "usine@nianka.ci",
        "telephone": "+2250700000004",
        "password": "Password123!",
        "role": "usine"
    })

    client.post("/api/v1/auth/register", json={
        "nom_complet": "Exportateur Global",
        "pseudo": "exportateur_test",
        "email": "exportateur@nianka.ci",
        "telephone": "+2250700000005",
        "password": "Password123!",
        "role": "exportateur"
    })

    login_resp = client.post("/api/v1/auth/login", json={
        "telephone": "+2250700000003",
        "password": "Password123!"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/auth/acheteurs", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert any(user["role"] == "usine" for user in data)
    assert any(user["role"] == "exportateur" for user in data)


def app_db_gen(client):
    from backend.database import get_db
    from backend.main import app
    db_gen = app.dependency_overrides[get_db]()
    return db_gen
