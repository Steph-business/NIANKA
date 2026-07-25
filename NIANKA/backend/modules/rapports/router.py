from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.common.dependencies import get_current_user, require_roles
from backend.database import get_db
from backend.modules.authentification.models import User
from backend.modules.rapports.schemas import RapportCreate, RapportResponse
from backend.modules.rapports.services import RapportService

router = APIRouter(prefix="/rapports", tags=["Rapports & Certificats NIANKA"])


@router.post("/", response_model=RapportResponse, status_code=status.HTTP_201_CREATED)
def generate_rapport(
    req: RapportCreate,
    current_user: User = Depends(require_roles(["exportateur", "usine", "entrepot", "admin"])),
    db: Session = Depends(get_db)
):
    """Génère un nouveau rapport d'exportation ou certificat phytosanitaire PDF."""
    return RapportService.create_rapport(db, current_user.id, req)


@router.get("/", response_model=List[RapportResponse])
def list_rapports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Liste l'historique des rapports générés pour l'utilisateur."""
    return RapportService.get_user_rapports(db, current_user.id)


@router.get("/{rapport_id}", response_model=RapportResponse)
def get_rapport(
    rapport_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Récupère les détails d'un rapport par son ID."""
    rapport = RapportService.get_rapport_by_id(db, rapport_id)
    if not rapport:
        raise HTTPException(status_code=404, detail="Rapport non trouvé.")
    return rapport
