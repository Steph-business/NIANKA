import json
import random
from datetime import datetime, timezone
from typing import List, Optional
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.modules.etapes.models import ArbitrageLot, BordereauTransfert, Lot, Scan
from backend.modules.etapes.schemas import ArbitrageCreate, LotCreate, ScanCreate, TransferOrderCreate
from backend.modules.notification.schemas import NotificationCreate
from backend.modules.notification.services import NotificationService


class EtapesService:

    @staticmethod
    def create_lot(db: Session, cooperative_id: uuid.UUID, req: LotCreate) -> Lot:
        seq = random.randint(100, 999)
        numero_lot = f"LOT-{datetime.now().year}-{seq}"

        lot = Lot(
            id=uuid.uuid4(),
            numero_lot=numero_lot,
            cooperative_id=cooperative_id,
            grade=req.grade,
            poids_tonnes=req.poids_tonnes,
            score_kor=req.score_kor or 54.2,
            humidite=req.humidite or 6.8,
            gps_lat=req.gps_lat or 7.6938,
            gps_long=req.gps_long or -5.0303,
            statut="EN_STOCK_COOPERATIVE",
            created_at=datetime.now(timezone.utc)
        )
        db.add(lot)
        db.commit()
        db.refresh(lot)
        return lot

    @staticmethod
    def list_lots(db: Session, cooperative_id: Optional[uuid.UUID] = None) -> List[Lot]:
        query = db.query(Lot)
        if cooperative_id:
            query = query.filter(Lot.cooperative_id == cooperative_id)
        return query.order_by(Lot.created_at.desc()).all()

    @staticmethod
    def create_scan(db: Session, agent_id: uuid.UUID, req: ScanCreate) -> Scan:
        scan = Scan(
            id=uuid.uuid4(),
            agent_id=agent_id,
            image_url=req.image_url,
            grade_ia=req.grade_ia,
            score_confiance=req.score_confiance,
            score_kor=req.score_kor or 54.2,
            humidite=req.humidite or 6.8,
            defauts=req.defauts or {"moisissure": 0.01, "pique": 0.02},
            gps_lat=req.gps_lat or 7.6938,
            gps_long=req.gps_long or -5.0303,
            etape=req.etape or "collecte_terrain",
            date_scan=datetime.now(timezone.utc)
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        return scan

    @staticmethod
    def list_scans(db: Session, agent_id: Optional[uuid.UUID] = None) -> List[Scan]:
        query = db.query(Scan)
        if agent_id:
            user_scans = query.filter(Scan.agent_id == agent_id).order_by(Scan.date_scan.desc()).limit(50).all()
            if user_scans:
                return user_scans
        return db.query(Scan).order_by(Scan.date_scan.desc()).limit(50).all()

    @staticmethod
    def create_transfer_order(db: Session, cooperative_id: uuid.UUID, req: TransferOrderCreate) -> BordereauTransfert:
        scan_initial = db.query(Scan).filter(Scan.id == req.scan_initial_id).first()
        if not scan_initial:
            raise HTTPException(status_code=404, detail="Scan initial introuvable.")

        # Generate Bordereau Number
        seq = random.randint(10, 99)
        numero_bordereau = f"TRF-{datetime.now().year}-{seq}"

        qr_payload_dict = {
            "numero_bordereau": numero_bordereau,
            "scan_initial_id": str(scan_initial.id),
            "cooperative_id": str(cooperative_id),
            "immatriculation_camion": req.immatriculation_camion,
            "nom_chauffeur": req.nom_chauffeur,
            "volume_tonnes": req.volume_tonnes,
            "grade": req.grade_lot,
            "kor_initial": scan_initial.score_kor,
            "humidite_initiale": scan_initial.humidite,
        }

        bordereau = BordereauTransfert(
            id=uuid.uuid4(),
            numero_bordereau=numero_bordereau,
            cooperative_id=cooperative_id,
            entrepot_id=req.entrepot_id,
            scan_initial_id=scan_initial.id,
            immatriculation_camion=req.immatriculation_camion,
            nom_chauffeur=req.nom_chauffeur,
            volume_tonnes=req.volume_tonnes,
            grade_lot=req.grade_lot,
            statut="EN TRANSIT",
            qr_payload=json.dumps(qr_payload_dict),
            created_at=datetime.now(timezone.utc)
        )

        db.add(bordereau)
        db.commit()
        db.refresh(bordereau)

        # Notify Cooperative / System
        NotificationService.create_notification(
            db,
            NotificationCreate(
                utilisateur_id=cooperative_id,
                type="transit",
                contenu=f"Bordereau {numero_bordereau} généré. Lot de {req.volume_tonnes}T en transit vers l'entrepôt.",
                reference_id=numero_bordereau
            )
        )

        return bordereau

    @staticmethod
    def get_transfer_by_number_or_id(db: Session, identifier: str) -> BordereauTransfert:
        bordereau = db.query(BordereauTransfert).filter(
            (BordereauTransfert.numero_bordereau == identifier) | (BordereauTransfert.id == identifier)
        ).first()
        if not bordereau:
            raise HTTPException(status_code=404, detail="Bordereau de transfert introuvable.")
        return bordereau

    @staticmethod
    def execute_arbitrage(db: Session, inspecteur_id: uuid.UUID, req: ArbitrageCreate) -> ArbitrageLot:
        bordereau = db.query(BordereauTransfert).filter(BordereauTransfert.id == req.bordereau_id).first()
        if not bordereau:
            raise HTTPException(status_code=404, detail="Bordereau de transfert non trouvé.")

        # Create warehouse scan
        scan_entrepot = Scan(
            id=uuid.uuid4(),
            agent_id=inspecteur_id,
            image_url=req.scan_entrepot_image_url,
            grade_ia=req.scan_entrepot_grade,
            score_confiance=0.98,
            score_kor=req.scan_entrepot_kor,
            humidite=req.scan_entrepot_humidite,
            defauts={"moisissure": 0.0, "pique": 0.01},
            etape="entrepot_arbitrage",
            date_scan=datetime.now(timezone.utc)
        )
        db.add(scan_entrepot)
        db.flush()

        scan_initial = bordereau.scan_initial
        kor_initial = scan_initial.score_kor if scan_initial else 54.2
        delta_kor = abs(req.scan_entrepot_kor - kor_initial)
        conforme = delta_kor <= 1.5

        bordereau.statut = "ARBITRE"
        if req.acheteur_id:
            bordereau.entrepot_id = inspecteur_id

        arbitrage = ArbitrageLot(
            id=uuid.uuid4(),
            bordereau_id=bordereau.id,
            scan_entrepot_id=scan_entrepot.id,
            inspecteur_id=inspecteur_id,
            acheteur_id=req.acheteur_id,
            verdict_conforme=conforme,
            delta_kor=round(delta_kor, 2),
            statut_vente="VENTE_SCELLEE",
            certificat_pdf_url=f"/reports/certificat_{bordereau.numero_bordereau}.pdf",
            scelle_a=datetime.now(timezone.utc)
        )

        db.add(arbitrage)
        db.commit()
        db.refresh(arbitrage)

        # Notify Cooperative
        NotificationService.create_notification(
            db,
            NotificationCreate(
                utilisateur_id=bordereau.cooperative_id,
                type="arbitrage",
                contenu=f"L'arbitrage du bordereau {bordereau.numero_bordereau} a été scellé avec succès. Verdict: {'CONFORME' if conforme else 'ECART DETECTE'}.",
                reference_id=bordereau.numero_bordereau
            )
        )
        return arbitrage

    @staticmethod
    def get_stats(db: Session, user: User) -> dict:
        from backend.modules.etapes.models import Lot, Scan, BordereauTransfert, ArbitrageLot

        lots_data = db.query(Lot.poids_tonnes, Lot.grade, Lot.score_kor).all()
        kor_scans = [r[0] for r in db.query(Scan.score_kor).filter(Scan.score_kor.isnot(None)).all()]

        total_tonnage = sum(r[0] for r in lots_data if r[0])
        kor_list = [r[2] for r in lots_data if r[2] is not None] + kor_scans
        kor_moyen = round(sum(kor_list) / len(kor_list), 1) if kor_list else 52.4

        grade_a_tonnes = sum(r[0] for r in lots_data if r[0] and "A" in (r[1] or ""))
        grade_b_tonnes = sum(r[0] for r in lots_data if r[0] and "B" in (r[1] or ""))
        grade_c_tonnes = sum(r[0] for r in lots_data if r[0] and "C" in (r[1] or ""))

        premium_pct = round((grade_a_tonnes / total_tonnage) * 100, 1) if total_tonnage > 0 else 85.0

        return {
            "utilisateur": user.nom_complet,
            "role": user.role,
            "tonnage_total_collecte": total_tonnage,
            "kor_moyen": kor_moyen,
            "qualite_premium_pourcent": premium_pct,
            "lots_en_transit": 0,
            "lots_scelles": 0,
            "total_lots_count": len(lots_data),
            "grades": {
                "Grade A": f"{grade_a_tonnes:.1f} Tonnes",
                "Grade B": f"{grade_b_tonnes:.1f} Tonnes",
                "Grade C": f"{grade_c_tonnes:.1f} Tonnes"
            }
        }
