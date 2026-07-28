from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from backend.common.dependencies import get_current_user, require_roles
from backend.database import get_db
from backend.modules.authentification.models import User
from backend.modules.authentification.schemas import (
    EntiteResponse,
    ForgotPasswordRequest,
    LoginRequest,
    ProfilResponse,
    RattachementRequest,
    RegisterRequest,
    ResetPasswordRequest,
    SendOTPRequest,
    TokenResponse,
    UpdateProfileRequest,
    UserResponse,
    VerificationRequest,
)
from backend.modules.authentification.services import AuthService, normalize_role

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
    """Vérifie l'adresse e-mail ou le numéro de téléphone d'un utilisateur avec le code OTP reçu."""
    user = AuthService.verify_email_otp(db, req.email, req.otp, req.telephone)
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


@router.get("/entites", response_model=List[EntiteResponse])
def list_entites(
    role: str = Query(..., description="Rôle recherché: cooperative, entrepot, usine, exportateur, agent"),
    db: Session = Depends(get_db)
):
    """Annuaire public des entités NIANKA par rôle (identité seule, sans contact).

    Sert à alimenter les listes déroulantes : coopérative de rattachement d'un
    agent à l'inscription, entrepôt de destination d'un bordereau, etc.
    """
    normalized = normalize_role(role)
    allowed = ["cooperative", "entrepot", "usine", "exportateur", "agent"]
    if normalized not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rôle invalide. Valeurs acceptées: {', '.join(allowed)}"
        )
    return db.query(User).filter(User.role == normalized).order_by(User.created_at.asc()).all()


@router.get("/pisteurs", response_model=List[UserResponse])
def list_pisteurs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["cooperative", "admin"]))
):
    """Liste les agents de terrain (pisteurs) rattachés à la coopérative connectée."""
    query = db.query(User).filter(User.role == "agent")
    if (current_user.role or "").lower() == "cooperative":
        query = query.filter(User.cooperative_id == current_user.id)
    return query.order_by(User.created_at.asc()).all()


@router.patch("/pisteurs/rattacher", response_model=UserResponse)
def rattacher_pisteur(
    req: RattachementRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["cooperative", "admin"]))
):
    """Rattache un agent de terrain à une coopérative (Agent -> Coopérative)."""
    cooperative_id = req.cooperative_id
    if cooperative_id is None:
        if (current_user.role or "").lower() != "cooperative":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="cooperative_id est requis lorsque l'appelant n'est pas une coopérative."
            )
        cooperative_id = current_user.id
    return AuthService.rattacher_agent(db, req.agent_id, cooperative_id)


@router.get("/acheteurs", response_model=List[UserResponse])
def list_acheteurs(
    role: Optional[str] = Query(None, description="Filtrer par rôle d'acheteur: usine ou exportateur"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["entrepot", "cooperative", "admin"]))
):
    """Liste les acheteurs / partenaires de commercialisation disponibles pour l'entrepôt."""
    allowed_roles = ["usine", "exportateur"]
    if role:
        normalized = role.strip().lower()
        alias_map = {"usineur": "usine", "acheteur": "exportateur", "exporteur": "exportateur"}
        normalized = alias_map.get(normalized, normalized)
        if normalized not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rôle d'acheteur invalide. Utilisez 'usine' ou 'exportateur'.")
        users = db.query(User).filter(User.role == normalized).all()
    else:
        users = db.query(User).filter(User.role.in_(allowed_roles)).all()
    return users


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """Déconnexion de l'utilisateur."""
    return {"message": "Déconnexion réussie. Veuillez supprimer le token du stockage client."}
