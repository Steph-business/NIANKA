from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict

class NotificationCreate(BaseModel):
    utilisateur_id: UUID
    type: str = Field("info", description="Type de notification: info, scan, transit, arbitrage, alert")
    contenu: str
    reference_id: Optional[str] = None

class NotificationResponse(BaseModel):
    id: UUID
    utilisateur_id: UUID
    type: Optional[str] = "info"
    contenu: str
    lu: bool = False
    reference_id: Optional[str] = None
    cree_le: Optional[datetime] = None
    scan: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)
