import random
import smtplib
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any, Dict, Optional

import bcrypt
import jwt

from backend.config import settings


def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode("utf-8")
    hash_bytes = hashed_password.encode("utf-8")
    try:
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None


def generate_otp_code() -> str:
    """Génère un code OTP aléatoire à 6 chiffres."""
    return f"{random.randint(0, 999999):06d}"


def send_otp_email(to_email: str, otp_code: str) -> bool:
    """Envoie un e-mail contenant le code OTP via SMTP."""
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print(f"[MOCK EMAIL] OTP pour {to_email}: {otp_code}")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Code de vérification NIANKA : {otp_code}"
        msg["From"] = settings.SMTP_USERNAME
        msg["To"] = to_email

        text = f"Votre code de vérification NIANKA est : {otp_code}\nCe code expire dans 10 minutes."
        html = f"""
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2e7d32; text-align: center;">NIANKA Trace & Quality</h2>
            <p>Bonjour,</p>
            <p>Voici votre code de vérification pour votre compte <strong>NIANKA</strong> :</p>
            <div style="text-align: center; margin: 25px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1b5e20; background: #e8f5e9; padding: 10px 20px; border-radius: 8px;">{otp_code}</span>
            </div>
            <p>Ce code est valable pendant <strong>10 minutes</strong>. Ne le partagez avec personne.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #777; text-align: center;">Système d'Authentification Sécurisé NIANKA</p>
        </div>
        """

        msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USERNAME, [to_email], msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"[ERROR] Échec d'envoi d'email SMTP: {e}")
        return False
