from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from backend.common.dependencies import get_current_user, require_roles
from backend.common.storage import SupabaseStorageService
from backend.database import get_db
from backend.modules.authentification.models import User
from backend.modules.etapes.ai_service import ai_classifier
from backend.modules.etapes.schemas import (
    ArbitrageCreate,
    ArbitrageResponse,
    LotCreate,
    LotResponse,
    ScanCreate,
    ScanResponse,
    TransferOrderCreate,
    TransferOrderResponse,
)
from backend.modules.etapes.services import EtapesService

router = APIRouter(prefix="/etapes", tags=["Etapes & Traçabilité NIANKA"])


@router.post("/lots", response_model=LotResponse, status_code=status.HTTP_201_CREATED)
def create_lot(
    req: LotCreate,
    current_user: User = Depends(require_roles(["cooperative", "agent", "admin"])),
    db: Session = Depends(get_db)
):
    """Enregistre un nouveau lot de noix de cajou avec grade, poids en tonnes, KOR et coordonnées GPS."""
    return EtapesService.create_lot(db, current_user.id, req)


@router.get("/lots", response_model=List[LotResponse])
def get_lots(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Liste les lots de noix de cajou enregistrés."""
    return EtapesService.list_lots(db, current_user.id)


@router.post("/upload-image")
async def upload_scan_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload une photo d'échantillon d'anacarde vers Supabase Storage (sans exposer de clés au frontend)."""
    image_url = await SupabaseStorageService.upload_file(file, folder="scans")
    return {
        "message": "Image transférée vers Supabase Storage avec succès",
        "image_url": image_url
    }


@router.post("/predict-quality")
async def predict_anacarde_quality(
    file: UploadFile = File(...),
    producer: Optional[str] = Form(None),
    cooperative: Optional[str] = Form(None),
    weight_kg: Optional[float] = Form(None),
    sample_weight_kg: Optional[float] = Form(None),
    gps: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Exécute l'analyse de qualité par IA (MobileNetV3 model_anacarde.keras) et enregistre automatiquement le scan en BDD."""
    contents = await file.read()
    prediction = ai_classifier.predict(
        image_bytes=contents,
        producer=producer,
        cooperative=cooperative,
        weight_kg=weight_kg,
        gps=gps,
    )

    try:
        from backend.modules.etapes.models import Scan
        from backend.modules.authentification.models import User
        from datetime import datetime, timezone
        import uuid
        import base64

        agent = db.query(User).filter(User.role == "agent").first() or db.query(User).first()
        agent_id = agent.id if agent else uuid.uuid4()

        # Upload image directly to Supabase Storage bucket 'scans'
        storage_url = await SupabaseStorageService.upload_bytes(
            file_bytes=contents,
            filename=file.filename or "scan.jpg",
            content_type=file.content_type or "image/jpeg"
        )

        scan = Scan(
            id=uuid.uuid4(),
            agent_id=agent_id,
            image_url=storage_url,
            grade_ia=prediction["predicted_grade"],
            score_confiance=prediction["confidence_score"],
            score_kor=prediction["metrics"]["kor_lbs"],
            humidite=prediction["metrics"]["humidity_pct"],
            defauts={
                "defect_rate_pct": prediction["metrics"]["defect_rate_pct"],
                "weight_kg": weight_kg if weight_kg is not None else 500.0,
                "sample_weight_kg": sample_weight_kg if sample_weight_kg is not None else 1.0
            },
            etape="collecte_terrain",
            date_scan=datetime.now(timezone.utc)
        )
        db.add(scan)
        db.commit()
        prediction["scan_id"] = str(scan.id)

        # Notify Agent & Cooperative
        try:
            from backend.modules.notification.services import NotificationService
            from backend.modules.notification.schemas import NotificationCreate

            short_lot = str(scan.id)[:8].upper()
            w_val = weight_kg if weight_kg is not None else 500.0
            coop_name = cooperative or "Coop. ANADER Bouaké"

            # 1. Notification pour l'agent
            NotificationService.create_notification(
                db,
                NotificationCreate(
                    utilisateur_id=agent_id,
                    type="scan",
                    contenu=f"Transmis : Le Lot LOT-2026-{short_lot} ({w_val} kg, {prediction['predicted_grade']}) a ete scanne et transmis a la {coop_name}.",
                    reference_id=str(scan.id)
                )
            )

            # 2. Notification pour la coopérative
            coop_user = db.query(User).filter(User.role == "cooperative").first()
            if coop_user and coop_user.id != agent_id:
                NotificationService.create_notification(
                    db,
                    NotificationCreate(
                        utilisateur_id=coop_user.id,
                        type="scan",
                        contenu=f"Nouveau Lot Transmis : L'Agent {agent.nom_complet if agent else 'Sarah Kone'} a scanne le Lot LOT-2026-{short_lot} ({prediction['predicted_grade']}, {w_val} kg) - {coop_name}.",
                        reference_id=str(scan.id)
                    )
                )
        except Exception as notif_err:
            print(f"[WARN NOTIF] Notice creation notification: {notif_err}")
    except Exception as err:
        print(f"[WARN BDD] Notice auto-sauvegarde scan: {err}")

    return prediction



@router.post("/scan", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
def submit_scan(
    req: ScanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enregistre une nouvelle analyse d'un échantillon de noix de cajou (avec géolocalisation GPS)."""
    return EtapesService.create_scan(db, current_user.id, req)


@router.get("/scans", response_model=List[ScanResponse])
def get_scans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Liste l'historique des scans réalisés par l'utilisateur."""
    return EtapesService.list_scans(db, current_user.id)


@router.post("/transfert", response_model=TransferOrderResponse, status_code=status.HTTP_201_CREATED)
def create_transfer(
    req: TransferOrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Émet un ordre de transfert (Bordereau Numérique de Livraison avec QR Code) de la Coopérative vers l'Entrepôt Central."""
    return EtapesService.create_transfer_order(db, current_user.id, req)


@router.get("/transfert/{identifier}", response_model=TransferOrderResponse)
def get_transfer_by_id_or_number(
    identifier: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Récupère les détails d'un bordereau de transfert par son ID ou son numéro (ex: TRF-2024-08)."""
    return EtapesService.get_transfer_by_number_or_id(db, identifier)


@router.post("/arbitrage", response_model=ArbitrageResponse, status_code=status.HTTP_201_CREATED)
def execute_arbitrage(
    req: ArbitrageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Effectue l'arbitrage neutre à l'entrepôt et scelle la vente officielle."""
    arbitrage = EtapesService.execute_arbitrage(db, current_user.id, req)
    
    scan_initial_kor = 54.2
    if arbitrage.bordereau and arbitrage.bordereau.scan_initial:
        scan_initial_kor = arbitrage.bordereau.scan_initial.score_kor or 54.2

    scan_entrepot_kor = arbitrage.scan_entrepot.score_kor if arbitrage.scan_entrepot else 54.2

    return ArbitrageResponse(
        id=arbitrage.id,
        bordereau_id=arbitrage.bordereau_id,
        verdict_conforme=arbitrage.verdict_conforme,
        delta_kor=arbitrage.delta_kor,
        statut_vente=arbitrage.statut_vente,
        certificat_pdf_url=arbitrage.certificat_pdf_url,
        scelle_a=arbitrage.scelle_a,
        scan_initial_kor=scan_initial_kor,
        scan_entrepot_kor=scan_entrepot_kor
    )


@router.get("/stats")
def get_traceability_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère les statistiques consolidées de traçabilité réelles issues de la base de données Supabase."""
    return EtapesService.get_stats(db, current_user)
