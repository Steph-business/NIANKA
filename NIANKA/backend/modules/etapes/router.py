import asyncio
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from backend.common.dependencies import get_current_user, require_roles
from backend.common.storage import SupabaseStorageService
from backend.database import get_db
from backend.modules.authentification.models import User
from backend.modules.authentification.services import AuthService
from backend.modules.etapes.ai_service import ai_classifier
from backend.modules.etapes.certificat import render_certificat_html
from backend.modules.etapes.schemas import (
    ArbitrageCreate,
    ArbitrageResponse,
    LotCertifieResponse,
    LotCreate,
    LotResponse,
    ScanCreate,
    ScanResponse,
    TransferOrderCreate,
    TransferOrderResponse,
)
from backend.modules.etapes.services import EtapesService, parse_gps

router = APIRouter(prefix="/etapes", tags=["Etapes & Traçabilité NIANKA"])


# --------------------------------------------------------------------- #
# Lots                                                                   #
# --------------------------------------------------------------------- #

@router.post("/lots", response_model=LotResponse, status_code=status.HTTP_201_CREATED)
def create_lot(
    req: LotCreate,
    current_user: User = Depends(require_roles(["cooperative", "agent", "admin"])),
    db: Session = Depends(get_db)
):
    """Enregistre un nouveau lot de noix de cajou avec grade, poids en tonnes, KOR et coordonnées GPS."""
    cooperative_id = AuthService.resolve_cooperative_id(db, current_user) or current_user.id
    return EtapesService.create_lot(db, cooperative_id, req)


@router.get("/lots", response_model=List[LotResponse])
def get_lots(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Liste les lots visibles par l'utilisateur connecté (cloisonnés par coopérative)."""
    return [EtapesService.serialize_lot(db, l) for l in EtapesService.list_lots(db, current_user)]


@router.get("/lots/{lot_id}", response_model=LotResponse)
def get_lot(
    lot_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Récupère les détails d'un lot spécifique par son ID."""
    return EtapesService.serialize_lot(db, EtapesService.get_lot_by_id(db, lot_id))


# --------------------------------------------------------------------- #
# Scans & inférence IA                                                   #
# --------------------------------------------------------------------- #

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
    etape: Optional[str] = Form("collecte_terrain"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyse de qualité par IA, enregistrée au nom de l'utilisateur connecté.

    Le scan est rattaché à l'agent authentifié (jamais deviné), et la coopérative
    de rattachement de cet agent est notifiée en temps réel.
    """
    contents = await file.read()

    from datetime import datetime, timezone
    import uuid

    from backend.modules.etapes.models import Scan
    from backend.modules.notification.schemas import NotificationCreate
    from backend.modules.notification.services import NotificationService

    gps_lat, gps_long = parse_gps(gps)
    etape_scan = etape or "collecte_terrain"

    # L'inférence IA est CPU-bound (TensorFlow) : l'exécuter directement dans
    # cette coroutine bloquerait la boucle événementielle FastAPI pendant
    # toute sa durée, gelant du même coup TOUTES les autres requêtes en cours
    # (notifications, autres utilisateurs...). `asyncio.to_thread` la déporte
    # dans un thread pool. Elle est en plus lancée EN PARALLÈLE de l'envoi de
    # la photo vers Supabase Storage (I/O réseau indépendant), au lieu de
    # l'attendre en séquence comme avant.
    prediction, storage_url = await asyncio.gather(
        asyncio.to_thread(
            ai_classifier.predict,
            image_bytes=contents,
            producer=producer,
            cooperative=cooperative,
            weight_kg=weight_kg,
            gps=gps,
        ),
        SupabaseStorageService.upload_bytes(
            file_bytes=contents,
            filename=file.filename or "scan.jpg",
            content_type=file.content_type or "image/jpeg"
        ),
    )

    scan = Scan(
        id=uuid.uuid4(),
        agent_id=current_user.id,
        image_url=storage_url,
        grade_ia=prediction["predicted_grade"],
        score_confiance=prediction["confidence_score"],
        score_kor=prediction["metrics"]["kor_lbs"],
        humidite=prediction["metrics"]["humidity_pct"],
        defauts={
            "defect_rate_pct": prediction["metrics"]["defect_rate_pct"],
            "calibre_mm": prediction["metrics"]["calibre_mm"],
            "weight_kg": weight_kg,
            "sample_weight_kg": sample_weight_kg,
            "producteur": producer,
            "cooperative_saisie": cooperative,
            "gps_saisi": gps,
        },
        gps_lat=gps_lat,
        gps_long=gps_long,
        etape=etape_scan,
        date_scan=datetime.now(timezone.utc)
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    prediction["scan_id"] = str(scan.id)
    prediction["image_url"] = storage_url
    prediction["agent_id"] = str(current_user.id)
    prediction["nom_agent"] = current_user.nom_complet
    prediction["gps_lat"] = gps_lat
    prediction["gps_long"] = gps_long
    prediction["etape"] = etape_scan

    # Notifications : l'agent, puis SA coopérative de rattachement
    reference = f"LOT-{scan.date_scan.year}-{str(scan.id)[:8].upper()}"
    poids = weight_kg if weight_kg is not None else 0.0
    grade = prediction["predicted_grade"]
    kor = prediction["metrics"]["kor_lbs"]

    cooperative_id = AuthService.resolve_cooperative_id(db, current_user)
    nom_cooperative = EtapesService._nom(db, cooperative_id) or (cooperative or "votre coopérative")

    if etape_scan == "collecte_terrain":
        NotificationService.create_notification(
            db,
            NotificationCreate(
                utilisateur_id=current_user.id,
                type="scan",
                contenu=(
                    f"Transmis : {reference} ({poids:.0f} kg, {grade}, KOR {kor} lbs) "
                    f"analysé et transmis à {nom_cooperative}."
                ),
                reference_id=str(scan.id)
            )
        )

        if cooperative_id and cooperative_id != current_user.id:
            NotificationService.create_notification(
                db,
                NotificationCreate(
                    utilisateur_id=cooperative_id,
                    type="scan",
                    contenu=(
                        f"Nouveau lot terrain : l'agent {current_user.nom_complet} a scanné "
                        f"{reference} — {grade}, KOR {kor} lbs, {poids:.0f} kg"
                        + (f" (producteur {producer})." if producer else ".")
                    ),
                    reference_id=str(scan.id)
                )
            )

    return prediction


@router.post("/scan", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
def submit_scan(
    req: ScanCreate,
    current_user: User = Depends(require_roles(["agent", "cooperative", "entrepot", "admin"])),
    db: Session = Depends(get_db)
):
    """Enregistre une nouvelle analyse d'un échantillon de noix de cajou (avec géolocalisation GPS)."""
    return EtapesService.create_scan(db, current_user.id, req)


@router.get("/scans", response_model=List[ScanResponse])
def get_scans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Historique des scans visibles par l'utilisateur connecté.

    Un agent voit ses propres scans, une coopérative ceux de ses agents rattachés,
    l'entrepôt et les acheteurs disposent d'une vue filière.
    """
    scans = EtapesService.list_scans(db, current_user)
    nom_cache = EtapesService._noms_bulk(db, [s.agent_id for s in scans])
    return [EtapesService.serialize_scan(db, s, nom_cache) for s in scans]


# --------------------------------------------------------------------- #
# Bordereaux de transfert (Coopérative -> Entrepôt)                      #
# --------------------------------------------------------------------- #

@router.post("/transfert", response_model=TransferOrderResponse, status_code=status.HTTP_201_CREATED)
def create_transfer(
    req: TransferOrderCreate,
    current_user: User = Depends(require_roles(["cooperative", "agent", "admin"])),
    db: Session = Depends(get_db)
):
    """Émet un ordre de transfert (Bordereau Numérique de Livraison avec QR Code) vers l'Entrepôt Central."""
    cooperative_id = AuthService.resolve_cooperative_id(db, current_user) or current_user.id
    bordereau = EtapesService.create_transfer_order(db, cooperative_id, req)
    return EtapesService.serialize_bordereau(db, bordereau)


@router.get("/transferts", response_model=List[TransferOrderResponse])
def list_transfers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Liste les bordereaux de transfert visibles par l'utilisateur connecté.

    Coopérative : ses expéditions. Entrepôt : les camions qui lui sont destinés.
    """
    bordereaux = EtapesService.list_transfers(db, current_user)
    return [EtapesService.serialize_bordereau(db, b) for b in bordereaux]


@router.get("/transfert/{identifier}", response_model=TransferOrderResponse)
def get_transfer_by_id_or_number(
    identifier: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Charge un bordereau par son numéro (TRF-2026-08), son UUID ou le payload du QR Code.

    La réponse embarque le scan bord champ complet : l'entrepôt dispose du KOR,
    de l'humidité, de la photo et de l'agent d'origine sans second appel.
    """
    bordereau = EtapesService.get_transfer_by_number_or_id(db, identifier)
    return EtapesService.serialize_bordereau(db, bordereau)


# --------------------------------------------------------------------- #
# Arbitrage & scellement de la vente                                     #
# --------------------------------------------------------------------- #

@router.post("/arbitrage", response_model=ArbitrageResponse, status_code=status.HTTP_201_CREATED)
def execute_arbitrage(
    req: ArbitrageCreate,
    current_user: User = Depends(require_roles(["entrepot", "admin"])),
    db: Session = Depends(get_db)
):
    """Arbitrage neutre à l'entrepôt : compare le scan bord champ au scan de
    déchargement, tranche la conformité et scelle la vente au profit de l'acheteur."""
    arbitrage = EtapesService.execute_arbitrage(db, current_user.id, req)

    from backend.modules.etapes.models import Scan

    bordereau = arbitrage.bordereau
    scan_initial = db.query(Scan).filter(Scan.id == bordereau.scan_initial_id).first() if bordereau else None
    scan_entrepot = db.query(Scan).filter(Scan.id == arbitrage.scan_entrepot_id).first()

    return ArbitrageResponse(
        id=arbitrage.id,
        bordereau_id=arbitrage.bordereau_id,
        verdict_conforme=arbitrage.verdict_conforme,
        delta_kor=arbitrage.delta_kor,
        statut_vente=arbitrage.statut_vente,
        certificat_pdf_url=arbitrage.certificat_pdf_url,
        scelle_a=arbitrage.scelle_a,
        scan_initial_kor=(scan_initial.score_kor if scan_initial and scan_initial.score_kor is not None
                          else req.scan_entrepot_kor),
        scan_entrepot_kor=(scan_entrepot.score_kor if scan_entrepot else req.scan_entrepot_kor),
    )


@router.get("/lots-certifies", response_model=List[LotCertifieResponse])
def get_lots_certifies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Catalogue des lots certifiés transmis au portail de l'acheteur (étape 5).

    Un usinier ou un exportateur n'y voit que les lots qui lui ont été attribués
    lors du scellement de la vente à l'entrepôt.
    """
    return EtapesService.list_lots_certifies(db, current_user)


class _AdminLecteur:
    """Lecteur interne à portée globale, utilisé pour générer le certificat public."""
    role = "admin"
    id = None
    cooperative_id = None
    nom_complet = "NIANKA"


@router.get("/certificat/{numero_bordereau}", response_class=HTMLResponse)
def get_certificat(
    numero_bordereau: str,
    db: Session = Depends(get_db)
):
    """Certificat de qualité NIANKA, prêt à imprimer / exporter en PDF, gravé d'un QR Code.

    Volontairement accessible sans jeton : le certificat est une pièce
    vérifiable par un tiers (douane, acheteur, régulateur) à partir du QR Code.
    """
    bordereau = EtapesService.get_transfer_by_number_or_id(db, numero_bordereau)
    donnees = EtapesService.serialize_bordereau(db, bordereau)

    certifies = {
        c["numero_bordereau"]: c
        for c in EtapesService.list_lots_certifies(db, _AdminLecteur())
    }
    arbitrage = certifies.get(bordereau.numero_bordereau)

    return HTMLResponse(content=render_certificat_html(donnees, arbitrage))


# --------------------------------------------------------------------- #
# Statistiques                                                           #
# --------------------------------------------------------------------- #

@router.get("/stats")
def get_traceability_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Statistiques consolidées de traçabilité, calculées sur le périmètre de l'appelant."""
    return EtapesService.get_stats(db, current_user)
