from datetime import datetime, timedelta, timezone
from typing import List, Optional
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from backend.common.security import (
    create_access_token,
    generate_otp_code,
    hash_password,
    send_otp_email,
    verify_password,
)
from backend.modules.authentification.models import OTP, Profil, User
from backend.modules.authentification.schemas import (
    ChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    UpdateProfileRequest,
)

# NIANKA Standard Roles
ROLES_NIANKA = ["agent", "cooperative", "entrepot", "usine", "exportateur", "admin"]


class AuthService:

    @staticmethod
    def get_profiles(db: Session) -> List[Profil]:
        """Récupère tous les profils de la base ou initialise les rôles officiels NIANKA."""
        profiles = db.query(Profil).all()
        existing_names = {p.libelle.lower() for p in profiles}
        
        added = False
        for role_name in ROLES_NIANKA:
            if role_name not in existing_names:
                p = Profil(id=uuid.uuid4(), libelle=role_name)
                db.add(p)
                added = True
        
        if added:
            db.commit()
            profiles = db.query(Profil).all()
        return profiles

    @staticmethod
    def register_user(db: Session, req: RegisterRequest) -> User:
        """Inscrit un utilisateur avec l'un des rôles NIANKA: agent, cooperative, entrepot, usine, exportateur, admin."""
        assigned_role = (req.role or "agent").lower().strip()
        if assigned_role not in ROLES_NIANKA:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Rôle invalide. Rôles autorisés: {', '.join(ROLES_NIANKA)}"
            )

        # Check existing telephone
        if req.telephone:
            digits_tel = "".join([c for c in req.telephone if c.isdigit()])
            existing_tel = db.query(User).filter(
                or_(
                    User.telephone == req.telephone,
                    (func.replace(User.telephone, '+', '') == digits_tel) if digits_tel else False
                )
            ).first()
            if existing_tel:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Ce numéro de téléphone est déjà utilisé par un autre compte NIANKA."
                )

        # Resolve role / profil_id
        profil = db.query(Profil).filter(func.lower(Profil.libelle) == assigned_role).first()
        if not profil:
            profil = Profil(id=uuid.uuid4(), libelle=assigned_role)
            db.add(profil)
            db.flush()
        profil_id = profil.id

        new_user = User(
            id=uuid.uuid4(),
            nom_complet=req.nom_complet,
            pseudo=req.pseudo,
            email=req.email.lower(),
            telephone=req.telephone,
            password_hash=hash_password(req.password),
            profil_id=profil_id,
            role=assigned_role,
            email_verified=True,
            is_verified=True,
            statut="actif",
            profil_complet=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return new_user

    @staticmethod
    def send_verification_otp(db: Session, user: User) -> str:
        # Invalidate previous unexpired OTPs
        db.query(OTP).filter(OTP.user_id == user.id, OTP.used == False).update({"used": True})
        
        otp_code = generate_otp_code()
        expires = datetime.now(timezone.utc) + timedelta(minutes=10)
        
        otp = OTP(
            id=uuid.uuid4(),
            user_id=user.id,
            otp_code=otp_code,
            expires_at=expires,
            used=False
        )
        db.add(otp)
        db.commit()

        send_otp_email(user.email, otp_code)
        return otp_code

    @staticmethod
    def verify_email_otp(db: Session, email: str, otp_code: str) -> User:
        user = db.query(User).filter(func.lower(User.email) == func.lower(email)).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable.")

        now = datetime.now(timezone.utc)
        otp = db.query(OTP).filter(
            OTP.user_id == user.id,
            OTP.otp_code == otp_code,
            OTP.used == False,
            OTP.expires_at >= now
        ).first()

        if not otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Code OTP invalide ou expiré."
            )

        otp.used = True
        user.email_verified = True
        user.is_verified = True
        user.updated_at = now
        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def login_user(db: Session, req: LoginRequest, client_ip: str = "127.0.0.1"):
        input_val = (req.login_input or req.telephone or req.email or "").strip().lower()
        digits_val = "".join([c for c in input_val if c.isdigit()])

        # Find user by telephone OR email OR pseudo
        user = db.query(User).filter(
            or_(
                func.lower(User.telephone) == input_val,
                func.lower(User.email) == input_val,
                func.lower(User.pseudo) == input_val,
                (func.replace(User.telephone, '+', '') == digits_val) if digits_val else False
            )
        ).first()

        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Numéro de téléphone ou mot de passe incorrect."
            )

        # Update last login details
        user.derniere_connexion = datetime.now(timezone.utc)
        user.derniere_ip = client_ip
        user.email_verified = True
        user.is_verified = True
        db.commit()
        db.refresh(user)

        payload = {
            "sub": str(user.id),
            "role": user.role,
            "email": user.email
        }
        token = create_access_token(payload)

        return user, token

        # Generate JWT
        token_data = {
            "user_id": str(user.id),
            "email": user.email,
            "role": user.role,
            "profil_id": str(user.profil_id) if user.profil_id else None,
            "is_profile_complete": user.profil_complet
        }
        token = create_access_token(token_data)

        return user, token

    @staticmethod
    def forgot_password(db: Session, email: str):
        user = db.query(User).filter(func.lower(User.email) == func.lower(email)).first()
        if not user:
            return True
        AuthService.send_verification_otp(db, user)
        return True

    @staticmethod
    def reset_password(db: Session, req: ResetPasswordRequest):
        user = AuthService.verify_email_otp(db, req.email, req.otp)
        user.password_hash = hash_password(req.new_password)
        user.updated_at = datetime.now(timezone.utc)
        db.commit()
        return True

    @staticmethod
    def update_profile(db: Session, user: User, req: UpdateProfileRequest) -> User:
        if req.nom_complet is not None:
            user.nom_complet = req.nom_complet
        if req.telephone is not None:
            user.telephone = req.telephone
        if req.biographie is not None:
            user.biographie = req.biographie
        if req.profile_photo is not None:
            user.profile_photo = req.profile_photo
        if req.social_links is not None:
            user.liens_sociaux = req.social_links
        if req.wallet_address is not None:
            user.adresse_wallet = req.wallet_address
        if req.langue_preferee is not None:
            user.langue_preferee = req.langue_preferee
        if req.date_naissance is not None:
            user.date_naissance = req.date_naissance
        if req.sexe is not None:
            user.sexe = req.sexe

        user.profil_complet = True
        user.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(user)
        return user
