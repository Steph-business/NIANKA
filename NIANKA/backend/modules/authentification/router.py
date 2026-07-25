from typing import List
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from backend.common.dependencies import get_current_user, require_roles
from backend.database import get_db
from backend.modules.authentification.models import User
from backend.modules.authentification.schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    ProfilResponse,
    RegisterRequest,
    ResetPasswordRequest,
    SendOTPRequest,
    TokenResponse,
    UpdateProfileRequest,
    UserResponse,
    VerificationRequest,
)
from backend.modules.authentification.services import AuthService

router = APIRouter(prefix="/auth", tags=["Authentification & Utilisateurs"])


@router.get("/profiles", response_model=List[ProfilResponse])
def get_profiles(db: Session = Depends(get_db)):
    """Récupère la liste de tous les profils / rôles disponibles."""
    return AuthService.get_profiles(db)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Inscrit un nouvel utilisateur et lui envoie un code OTP par e-mail."""
    user = AuthService.register_user(db, req)
    return user


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Authentifie un utilisateur et retourne un jeton d'accès JWT."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    user, token = AuthService.login_user(db, req, client_ip)
    return TokenResponse(
        message="Connexion réussie",
        user=user,
        token=token
    )


@router.post("/verify-otp", response_model=UserResponse)
def verify_otp(req: VerificationRequest, db: Session = Depends(get_db)):
    """Vérifie l'adresse e-mail d'un utilisateur avec le code OTP reçu."""
    user = AuthService.verify_email_otp(db, req.email, req.otp)
    return user


@router.post("/resend-otp")
def resend_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    """Renvoyer un nouveau code de vérification OTP par e-mail."""
    user = AuthService.forgot_password(db, req.email)
    return {"message": "Si l'adresse email existe, un code OTP a été envoyé."}


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Demande de réinitialisation de mot de passe via code OTP par e-mail."""
    AuthService.forgot_password(db, req.email)
    return {"message": "Si l'adresse email existe, un code OTP a été envoyé."}


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Réinitialise le mot de passe utilisateur avec le code OTP."""
    AuthService.reset_password(db, req)
    return {"message": "Mot de passe réinitialisé avec succès."}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Retourne les informations du profil utilisateur connecté."""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    req: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mise à jour des informations du profil utilisateur connecté."""
    updated_user = AuthService.update_profile(db, current_user, req)
    return updated_user


@router.get("/pisteurs", response_model=List[UserResponse])
def list_pisteurs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["cooperative", "admin"]))
):
    """Liste tous les agents de terrain (pisteurs) rattachés ou disponibles."""
    pisteurs = db.query(User).filter(User.role == "agent").all()
    return pisteurs


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """Déconnexion de l'utilisateur."""
    return {"message": "Déconnexion réussie. Veuillez supprimer le token du stockage client."}
