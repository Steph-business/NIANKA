import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Float, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.database import Base, GUID, JSONColumn

class Profil(Base):
    __tablename__ = "profil"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    libelle = Column(String(50), unique=True, nullable=False)

    users = relationship("User", back_populates="profil")


class User(Base):
    __tablename__ = "utilisateurs"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    profil_id = Column(GUID, ForeignKey("profil.id"), nullable=True)
    cooperative_id = Column(GUID, ForeignKey("utilisateurs.id"), nullable=True)
    nom_complet = Column(String(150), nullable=False)
    pseudo = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    telephone = Column(String(20), nullable=True)
    password_hash = Column(Text, nullable=False)
    biographie = Column(Text, nullable=True)
    profile_photo = Column(Text, nullable=True)
    liens_sociaux = Column(JSONColumn, nullable=True)
    adresse_wallet = Column(String(100), nullable=True)
    genres_preferes = Column(JSONColumn, nullable=True)
    langue_preferee = Column(String(10), default="fr")
    preferences = Column(JSONColumn, nullable=True)
    derniere_connexion = Column(DateTime, nullable=True)
    derniere_ip = Column(String(45), nullable=True)
    tentatives_login = Column(Integer, default=0)
    bloque_jusqu_a = Column(DateTime, nullable=True)
    type_abonnement = Column(String(30), default="gratuit")
    solde_jetons = Column(Float, default=0.00)
    is_verified = Column(Boolean, default=False)
    statut = Column(String(20), default="actif")
    raison_statut = Column(Text, nullable=True)
    role = Column(String(50), default="lecteur")
    date_naissance = Column(DateTime, nullable=True)
    sexe = Column(String(15), nullable=True)
    cgu_acceptees_a = Column(DateTime, nullable=True)
    email_verified = Column(Boolean, default=False)
    profil_complet = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    deleted_at = Column(DateTime, nullable=True)

    profil = relationship("Profil", back_populates="users")
    otps = relationship("OTP", back_populates="user", cascade="all, delete-orphan")


class OTP(Base):
    __tablename__ = "otps"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("utilisateurs.id", ondelete="CASCADE"), nullable=False)
    otp_code = Column(String(6), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="otps")
