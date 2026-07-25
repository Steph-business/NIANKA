import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from backend.database import Base, GUID

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    utilisateur_id = Column(GUID, ForeignKey("utilisateurs.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=True, index=True)
    contenu = Column(Text, nullable=False)
    lu = Column(Boolean, default=False, nullable=False)
    reference_id = Column(String(100), nullable=True, index=True)
    cree_le = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
