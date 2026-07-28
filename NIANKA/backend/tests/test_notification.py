import pytest

def test_notification_flow(client):
    # Register & Verify User
    reg_payload = {
        "nom_complet": "Coopérative Test",
        "pseudo": "coop_test",
        "email": "coop@nianka.ci",
        "password": "Password123!",  # nosec B105
        "role": "cooperative"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    # Get DB session from override
    from backend.tests.test_auth import app_db_gen
    from backend.modules.authentification.models import OTP, User
    db = next(app_db_gen(client))

    otp_record = db.query(OTP).join(User).filter(User.email == "coop@nianka.ci").first()
    client.post("/api/v1/auth/verify-otp", json={
        "email": "coop@nianka.ci",
        "otp": otp_record.otp_code
    })

    # Login
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "coop@nianka.ci",
        "password": "Password123!"  # nosec B105
    })
    token = login_resp.json()["token"]
    user_id = login_resp.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create notification
    notif_payload = {
        "utilisateur_id": user_id,
        "type": "transit",
        "contenu": "Nouveau camion en transit #TRF-2024-01",
        "reference_id": "TRF-2024-01"
    }
    create_resp = client.post("/api/v1/notifications/", json=notif_payload, headers=headers)
    assert create_resp.status_code == 201
    notif_id = create_resp.json()["id"]

    # List notifications
    list_resp = client.get("/api/v1/notifications/", headers=headers)
    assert list_resp.status_code == 200
    notifs = list_resp.json()
    assert len(notifs) == 1
    assert notifs[0]["lu"] is False

    # Mark as read
    read_resp = client.patch(f"/api/v1/notifications/{notif_id}/read", headers=headers)
    assert read_resp.status_code == 200

    # List unread notifications (should be 0)
    unread_resp = client.get("/api/v1/notifications/?unread_only=true", headers=headers)
    assert unread_resp.status_code == 200
    assert len(unread_resp.json()) == 0
