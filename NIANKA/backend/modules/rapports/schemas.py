from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict

class RapportCreate(BaseModel):
    titre: str = Field(..., min_length=3, max_length=200)
    type_rapport: Optional[str] = Field("statistique_kor", description="statistique_kor, certificat_phytosanitaire, rapport_export")
    periode_debut: datetime
    periode_fin: datetime

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
