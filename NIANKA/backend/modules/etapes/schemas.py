from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, model_validator

class LotCreate(BaseModel):
    grade: Optional[str] = Field(None, description="Grade: Grade A, Grade B, Grade C")
    poids_tonnes: Optional[float] = Field(None, gt=0)
    score_kor: Optional[float] = Field(None, description="Score KOR en lbs")
    humidite: Optional[float] = Field(None, description="Taux d'humidité %")
    gps_lat: Optional[float] = None
    gps_long: Optional[float] = None
    nom_producteur: Optional[str] = None
    nom_cooperative: Optional[str] = None
    grade_qualite: Optional[str] = None
    kor_score: Optional[float] = None
    coord_gps: Optional[str] = None
    poids_kg: Optional[float] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_payload(cls, data):
        if not isinstance(data, dict):
            return data
        normalized = dict(data)
        if normalized.get("grade") is None and normalized.get("grade_qualite"):
            normalized["grade"] = normalized["grade_qualite"]
        if normalized.get("poids_tonnes") is None and normalized.get("poids_kg") is not None:
            normalized["poids_tonnes"] = normalized["poids_kg"] / 1000.0
        if normalized.get("score_kor") is None and normalized.get("kor_score") is not None:
            normalized["score_kor"] = normalized["kor_score"]
        return normalized

class LotResponse(BaseModel):
    id: UUID
    numero_lot: str
    cooperative_id: UUID
    nom_cooperative: Optional[str] = None
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
    nom_agent: Optional[str] = None
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
    scan_initial_id: Optional[UUID] = None
    immatriculation_camion: Optional[str] = Field(None, min_length=2)
    nom_chauffeur: Optional[str] = Field(None, min_length=2)
    volume_tonnes: Optional[float] = Field(None, gt=0)
    grade_lot: Optional[str] = None
    entrepot_id: Optional[UUID] = None
    cooperative_depart: Optional[str] = None
    entrepot_destination: Optional[str] = None
    tonnage_transfert: Optional[float] = Field(None, gt=0)
    lot_id: Optional[str] = None
    truck: Optional[str] = None
    driver: Optional[str] = None
    scan_id: Optional[UUID] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_payload(cls, data):
        if not isinstance(data, dict):
            return data
        normalized = dict(data)
        if normalized.get("volume_tonnes") is None and normalized.get("tonnage_transfert") is not None:
            normalized["volume_tonnes"] = normalized["tonnage_transfert"]
        if normalized.get("immatriculation_camion") is None and normalized.get("truck"):
            normalized["immatriculation_camion"] = normalized["truck"]
        if normalized.get("nom_chauffeur") is None and normalized.get("driver"):
            normalized["nom_chauffeur"] = normalized["driver"]
        if normalized.get("scan_initial_id") is None and normalized.get("scan_id") is not None:
            normalized["scan_initial_id"] = normalized["scan_id"]
        return normalized

class ScanSummary(BaseModel):
    """Vue condensée d'un scan, embarquée dans le bordereau pour permettre
    la comparaison côte-à-côte à l'entrepôt sans second aller-retour réseau."""
    id: UUID
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
    agent_id: UUID
    nom_agent: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


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

    # Traçabilité résolue côté serveur (guide.md §4 étape 4 : pré-remplissage)
    nom_cooperative: Optional[str] = None
    nom_entrepot: Optional[str] = None
    nom_agent: Optional[str] = None
    scan_initial: Optional[ScanSummary] = None
    kor_initial: Optional[float] = None
    humidite_initiale: Optional[float] = None
    arbitre: bool = False

    model_config = ConfigDict(from_attributes=True)

class ArbitrageCreate(BaseModel):
    bordereau_id: UUID
    scan_entrepot_image_url: str
    scan_entrepot_grade: str = "A"
    # Aucune valeur par défaut inventée : « 54.2 lbs » et « 6.8 % » étaient des
    # constantes fictives qui devenaient la vérité du lot si le client ne les
    # envoyait pas. Un champ absent doit rester absent.
    scan_entrepot_kor: Optional[float] = None
    scan_entrepot_humidite: Optional[float] = None
    # Relevés physiques réels saisis par l'inspecteur au déchargement.
    # Le KOR ne peut PAS être déduit d'une photo : il vient du test de coupe.
    kor_mesure: Optional[float] = None
    humidite_mesuree: Optional[float] = None
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


class LotCertifieResponse(BaseModel):
    """Lot scellé transmis au portail de l'acheteur (Usineur / Exportateur).

    C'est l'objet consommé par l'étape 5 du guide : « Sceller la Vente &
    Transmettre à l'Historique Acheteur ».
    """
    arbitrage_id: UUID
    bordereau_id: UUID
    numero_bordereau: str
    acheteur_id: Optional[UUID] = None
    nom_acheteur: Optional[str] = None

    nom_cooperative: Optional[str] = None
    nom_agent: Optional[str] = None
    nom_entrepot: Optional[str] = None

    grade_lot: str
    volume_tonnes: float
    immatriculation_camion: str
    nom_chauffeur: str

    kor_initial: Optional[float] = None
    humidite_initiale: Optional[float] = None
    kor_entrepot: Optional[float] = None
    humidite_entrepot: Optional[float] = None
    delta_kor: float = 0.0
    verdict_conforme: bool = True

    image_scan_initial: Optional[str] = None
    image_scan_entrepot: Optional[str] = None
    gps_lat: Optional[float] = None
    gps_long: Optional[float] = None

    statut_vente: str
    certificat_pdf_url: Optional[str] = None
    scelle_a: datetime

    date_collecte: Optional[datetime] = None
    date_expedition: Optional[datetime] = None
    date_arbitrage: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
