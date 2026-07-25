import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base, GUID, JSONColumn

class Lot(Base):
    __tablename__ = "lots"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    numero_lot = Column(String(50), unique=True, nullable=False, index=True) # LOT-2024-XX
    cooperative_id = Column(GUID, ForeignKey("utilisateurs.id"), nullable=False)
    grade = Column(String(20), nullable=False) # Grade A, Grade B, Grade C
    poids_tonnes = Column(Float, nullable=False)
    score_kor = Column(Float, nullable=True)
    humidite = Column(Float, nullable=True)
    gps_lat = Column(Float, nullable=True)
    gps_long = Column(Float, nullable=True)
    statut = Column(String(30), default="EN_STOCK_COOPERATIVE") # EN_STOCK_COOPERATIVE, EN_TRANSIT, VENDU
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    cooperative = relationship("User", foreign_keys=[cooperative_id])


class Scan(Base):
    __tablename__ = "scans"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    agent_id = Column(GUID, ForeignKey("utilisateurs.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(Text, nullable=False)
    grade_ia = Column(String(20), nullable=False) # A, B, C, Rejeté
    score_confiance = Column(Float, nullable=False, default=0.95)
    score_kor = Column(Float, nullable=True) # e.g. 54.2 lbs
    humidite = Column(Float, nullable=True) # e.g. 6.8%
    defauts = Column(JSONColumn, nullable=True) # e.g. {"moisissure": 0.02, "pique": 0.01}
    grade_expert = Column(String(20), nullable=True)
    gps_lat = Column(Float, nullable=True)
    gps_long = Column(Float, nullable=True)
    etape = Column(String(50), default="collecte_terrain") # collecte_terrain, entrepot_arbitrage
    date_scan = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    agent = relationship("User", foreign_keys=[agent_id])


class BordereauTransfert(Base):
    __tablename__ = "bordereaux_transfert"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    numero_bordereau = Column(String(50), unique=True, nullable=False, index=True) # TRF-2024-XX
    cooperative_id = Column(GUID, ForeignKey("utilisateurs.id"), nullable=False)
    entrepot_id = Column(GUID, ForeignKey("utilisateurs.id"), nullable=True)
    scan_initial_id = Column(GUID, ForeignKey("scans.id"), nullable=False)
    
    # Information transporteur & lot
    immatriculation_camion = Column(String(50), nullable=False)
    nom_chauffeur = Column(String(100), nullable=False)
    volume_tonnes = Column(Float, nullable=False)
    grade_lot = Column(String(20), nullable=False)
    statut = Column(String(30), default="EN TRANSIT") # EN TRANSIT, RECU, ARBITRE
    qr_payload = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    scan_initial = relationship("Scan", foreign_keys=[scan_initial_id])
    cooperative = relationship("User", foreign_keys=[cooperative_id])
    entrepot = relationship("User", foreign_keys=[entrepot_id])


class ArbitrageLot(Base):
    __tablename__ = "arbitrages_lots"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    bordereau_id = Column(GUID, ForeignKey("bordereaux_transfert.id"), nullable=False)
    scan_entrepot_id = Column(GUID, ForeignKey("scans.id"), nullable=False)
    inspecteur_id = Column(GUID, ForeignKey("utilisateurs.id"), nullable=False)
    acheteur_id = Column(GUID, ForeignKey("utilisateurs.id"), nullable=True)
    
    verdict_conforme = Column(Boolean, default=True)
    delta_kor = Column(Float, default=0.0)
    statut_vente = Column(String(30), default="VENTE_SCELLEE") # VENTE_SCELLEE, EN_NEGOCIATION
    certificat_pdf_url = Column(Text, nullable=True)
    scelle_a = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    bordereau = relationship("BordereauTransfert", foreign_keys=[bordereau_id])
    scan_entrepot = relationship("Scan", foreign_keys=[scan_entrepot_id])
    inspecteur = relationship("User", foreign_keys=[inspecteur_id])
    acheteur = relationship("User", foreign_keys=[acheteur_id])
