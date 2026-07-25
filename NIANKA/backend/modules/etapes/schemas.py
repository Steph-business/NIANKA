from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict

class LotCreate(BaseModel):
    grade: str = Field("Grade A", description="Grade: Grade A, Grade B, Grade C")
    poids_tonnes: float = Field(..., gt=0)
    score_kor: Optional[float] = Field(54.2, description="Score KOR en lbs")
    humidite: Optional[float] = Field(6.8, description="Taux d'humidité %")
    gps_lat: Optional[float] = None
    gps_long: Optional[float] = None

class LotResponse(BaseModel):
    id: UUID
    numero_lot: str
    cooperative_id: UUID
    grade: str
    poids_tonnes: float
    score_kor: Optional[float] = None
    humidite: Optional[float] = None
    gps_lat: Optional[float] = None
    gps_long: Optional[float] = None
    statut: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ScanCreate(BaseModel):
    image_url: str
    grade_ia: str = Field("A", description="A, B, C, Rejeté")
    score_confiance: float = Field(0.95, ge=0.0, le=1.0)
    score_kor: Optional[float] = Field(54.2, description="Score KOR en lbs")
    humidite: Optional[float] = Field(6.8, description="Taux d'humidité %")
    defauts: Optional[Dict[str, float]] = None
    gps_lat: Optional[float] = None
    gps_long: Optional[float] = None
    etape: Optional[str] = "collecte_terrain"

class ScanResponse(BaseModel):
    id: UUID
    agent_id: UUID
    image_url: str
    grade_ia: str
    score_confiance: float
    score_kor: Optional[float] = None
    humidite: Optional[float] = None
    defauts: Optional[Any] = None
    gps_lat: Optional[float] = None
    gps_long: Optional[float] = None
    etape: str
    date_scan: datetime

    model_config = ConfigDict(from_attributes=True)

class TransferOrderCreate(BaseModel):
    scan_initial_id: UUID
    immatriculation_camion: str = Field(..., min_length=2)
    nom_chauffeur: str = Field(..., min_length=2)
    volume_tonnes: float = Field(..., gt=0)
    grade_lot: str = "Grade A"
    entrepot_id: Optional[UUID] = None

class TransferOrderResponse(BaseModel):
    id: UUID
    numero_bordereau: str
    cooperative_id: UUID
    entrepot_id: Optional[UUID] = None
    scan_initial_id: UUID
    immatriculation_camion: str
    nom_chauffeur: str
    volume_tonnes: float
    grade_lot: str
    statut: str
    qr_payload: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ArbitrageCreate(BaseModel):
    bordereau_id: UUID
    scan_entrepot_image_url: str
    scan_entrepot_grade: str = "A"
    scan_entrepot_kor: float = 54.2
    scan_entrepot_humidite: float = 6.8
    acheteur_id: Optional[UUID] = None

class ArbitrageResponse(BaseModel):
    id: UUID
    bordereau_id: UUID
    verdict_conforme: bool
    delta_kor: float
    statut_vente: str
    certificat_pdf_url: Optional[str] = None
    scelle_a: datetime
    scan_initial_kor: float
    scan_entrepot_kor: float

    model_config = ConfigDict(from_attributes=True)
