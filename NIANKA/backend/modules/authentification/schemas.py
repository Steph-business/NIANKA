from datetime import datetime
from typing import Optional, Any
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class ProfilResponse(BaseModel):
    id: UUID
    libelle: str

    model_config = ConfigDict(from_attributes=True)

class RegisterRequest(BaseModel):
    nom_complet: str = Field(..., min_length=2, max_length=150)
    pseudo: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    profil_id: Optional[UUID] = None
    role: Optional[str] = Field("agent", description="Rôle NIANKA: agent (pisteur), cooperative, entrepot (dépôt), usine (usinier), exportateur, admin")
    telephone: Optional[str] = None

class LoginRequest(BaseModel):
    email: Optional[str] = None
    telephone: Optional[str] = None
    login_input: Optional[str] = None
    password: str

class VerificationRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)

class SendOTPRequest(BaseModel):
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=6)

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

class UpdateProfileRequest(BaseModel):
    nom_complet: Optional[str] = None
    telephone: Optional[str] = None
    biographie: Optional[str] = None
    profile_photo: Optional[str] = None
    social_links: Optional[Any] = None
    wallet_address: Optional[str] = None
    langue_preferee: Optional[str] = None
    date_naissance: Optional[datetime] = None
    sexe: Optional[str] = None

class UserResponse(BaseModel):
    id: UUID
    profil_id: Optional[UUID] = None
    nom_complet: str
    pseudo: str
    email: str
    telephone: Optional[str] = None
    biographie: Optional[str] = None
    profile_photo: Optional[str] = None
    langue_preferee: str = "fr"
    type_abonnement: str = "gratuit"
    solde_jetons: float = 0.0
    is_verified: bool = False
    statut: str = "actif"
    role: str = "lecteur"
    email_verified: bool = False
    profil_complet: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    message: str
    user: UserResponse
    token: str
    token_type: str = "bearer"
