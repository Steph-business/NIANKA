import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base, GUID

class Rapport(Base):
    __tablename__ = "rapports"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    utilisateur_id = Column(GUID, ForeignKey("utilisateurs.id", ondelete="CASCADE"), nullable=False, index=True)
    titre = Column(String(200), nullable=False)
    type_rapport = Column(String(50), default="statistique_kor") # statistique_kor, certificat_phytosanitaire, rapport_export
    periode_debut = Column(DateTime, nullable=False)
    periode_fin = Column(DateTime, nullable=False)
    fichier_url = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    utilisateur = relationship("User")
