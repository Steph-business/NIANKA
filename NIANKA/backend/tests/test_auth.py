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
        "password": "Password123!",
        "role": "agent"
    }
    response = client.post("/api/v1/auth/register", json=reg_payload)
    assert response.status_code == 201
    user_data = response.json()
    assert user_data["email"] == "koffi@nianka.ci"
    assert user_data["email_verified"] is False

    # 2. Login before verification should be forbidden (403)
    login_payload = {
        "email": "koffi@nianka.ci",
        "password": "Password123!"
    }
    login_resp = client.post("/api/v1/auth/login", json=login_payload)
    assert login_resp.status_code == 403

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
    otp_record = db.query(OTP).join(User).filter(User.email == "koffi@nianka.ci").first()
    assert otp_record is not None

    verify_resp = client.post("/api/v1/auth/verify-otp", json={
        "email": "koffi@nianka.ci",
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


def app_db_gen(client):
    from backend.database import get_db
    from backend.main import app
    db_gen = app.dependency_overrides[get_db]()
    return db_gen
