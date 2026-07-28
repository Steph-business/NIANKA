from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict

class RapportCreate(BaseModel):
    titre: str = Field(..., min_length=3, max_length=200)
    type_rapport: Optional[str] = Field("statistique_kor", description="statistique_kor, certificat_phytosanitaire, rapport_export")
    periode_debut: datetime
    periode_fin: datetime

class RapportGenerateRequest(BaseModel):
    """Demande simplifiée émise par les tableaux de bord : la période est
    exprimée en langage courant (« 7d », « 30d », « 90d », « 12m »)."""
    type_rapport: Optional[str] = Field("statistique_kor")
    periode: Optional[str] = Field("30d", description="7d, 30d, 90d, 12m")
    titre: Optional[str] = None

class RapportResponse(BaseModel):
    id: UUID
    utilisateur_id: UUID
    titre: str
    type_rapport: str
    periode_debut: datetime
    periode_fin: datetime
    fichier_url: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
