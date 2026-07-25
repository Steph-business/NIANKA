import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session

from backend.modules.rapports.models import Rapport
from backend.modules.rapports.schemas import RapportCreate

class RapportService:

    @staticmethod
    def create_rapport(db: Session, utilisateur_id: uuid.UUID, req: RapportCreate) -> Rapport:
        # Generate mock PDF report URL / report reference
        report_id = uuid.uuid4()
        file_url = f"/reports/rapport_{report_id}.pdf"

        rapport = Rapport(
            id=report_id,
            utilisateur_id=utilisateur_id,
            titre=req.titre,
            type_rapport=req.type_rapport or "statistique_kor",
            periode_debut=req.periode_debut,
            periode_fin=req.periode_fin,
            fichier_url=file_url,
            created_at=datetime.now(timezone.utc)
        )
        db.add(rapport)
        db.commit()
        db.refresh(rapport)
        return rapport

    @staticmethod
    def get_user_rapports(db: Session, utilisateur_id: uuid.UUID) -> List[Rapport]:
        return db.query(Rapport).filter(Rapport.utilisateur_id == utilisateur_id).order_by(Rapport.created_at.desc()).all()

    @staticmethod
    def get_rapport_by_id(db: Session, rapport_id: uuid.UUID) -> Optional[Rapport]:
        return db.query(Rapport).filter(Rapport.id == rapport_id).first()
