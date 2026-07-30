import json
import random
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.modules.authentification.models import User
from backend.modules.etapes.models import ArbitrageLot, BordereauTransfert, Lot, Scan
from backend.modules.etapes.schemas import ArbitrageCreate, LotCreate, ScanCreate, TransferOrderCreate
from backend.modules.notification.schemas import NotificationCreate
from backend.modules.notification.services import NotificationService

# Rôles ayant une vue transverse sur la filière (pas de cloisonnement coopérative)
ROLES_VUE_GLOBALE = {"entrepot", "usine", "exportateur", "admin"}

# Écart KOR toléré entre le scan bord champ et le scan d'arbitrage (lbs)
SEUIL_CONFORMITE_KOR = 1.5


def parse_gps(raw: Optional[str]) -> tuple[Optional[float], Optional[float]]:
    """Extrait (latitude, longitude) d'une chaîne GPS saisie sur le terrain.

    Accepte « 7.6938° N, 5.0303° W », « 7.6938 N, -5.0303 W — Bouaké »
    ou « 7.6938, -5.0303 ». Les points cardinaux S et W donnent un signe négatif.
    """
    if not raw:
        return None, None

    matches = re.findall(r"(-?\d+(?:[.,]\d+)?)\s*°?\s*([NSEWnsew])?", raw)
    coords: List[float] = []
    for value, hemisphere in matches[:2]:
        try:
            num = float(value.replace(",", "."))
        except ValueError:
            continue
        if hemisphere and hemisphere.upper() in ("S", "W"):
            num = -abs(num)
        coords.append(num)

    if len(coords) < 2:
        return None, None
    return coords[0], coords[1]


class EtapesService:

    # ------------------------------------------------------------------ #
    # Helpers                                                            #
    # ------------------------------------------------------------------ #

    @staticmethod
    def _nom(db: Session, user_id: Optional[uuid.UUID]) -> Optional[str]:
        if not user_id:
            return None
        user = db.query(User).filter(User.id == user_id).first()
        return user.nom_complet if user else None

    @staticmethod
    def _noms_bulk(db: Session, user_ids) -> Dict[uuid.UUID, str]:
        """Résout plusieurs noms en une seule requête (évite le N+1 de _nom)."""
        ids = {uid for uid in user_ids if uid}
        if not ids:
            return {}
        return {u.id: u.nom_complet for u in db.query(User).filter(User.id.in_(ids)).all()}

    @staticmethod
    def _as_uuid(value: Any) -> Optional[uuid.UUID]:
        """Convertit en UUID ou retourne None (évite les DataError PostgreSQL
        lorsqu'on recherche un bordereau par son numéro « TRF-2026-08 »)."""
        if isinstance(value, uuid.UUID):
            return value
        try:
            return uuid.UUID(str(value))
        except (ValueError, AttributeError, TypeError):
            return None

    @staticmethod
    def _agent_ids_de_la_cooperative(db: Session, cooperative_id: uuid.UUID) -> List[uuid.UUID]:
        """Agents rattachés à une coopérative, plus la coopérative elle-même
        (qui peut scanner depuis son propre poste)."""
        ids = [
            row[0] for row in
            db.query(User.id).filter(User.cooperative_id == cooperative_id).all()
        ]
        ids.append(cooperative_id)
        return ids

    @staticmethod
    def _scope_scans(db: Session, user: User):
        """Périmètre de lecture des scans selon le rôle de l'appelant."""
        role = (user.role or "").lower()
        query = db.query(Scan)

        if role in ROLES_VUE_GLOBALE:
            return query

        if role == "cooperative":
            ids = EtapesService._agent_ids_de_la_cooperative(db, user.id)
            # Tolérance données héritées : les agents jamais rattachés restent
            # visibles par la coopérative la plus ancienne uniquement.
            orphelins = db.query(User.id).filter(
                User.role == "agent", User.cooperative_id.is_(None)
            ).all()
            if orphelins:
                premiere_coop = db.query(User).filter(
                    User.role == "cooperative"
                ).order_by(User.created_at.asc()).first()
                if premiere_coop and premiere_coop.id == user.id:
                    ids.extend(row[0] for row in orphelins)
            return query.filter(Scan.agent_id.in_(ids))

        # Agent : uniquement ses propres scans
        return query.filter(Scan.agent_id == user.id)

    # ------------------------------------------------------------------ #
    # Lots                                                               #
    # ------------------------------------------------------------------ #

    @staticmethod
    def create_lot(db: Session, cooperative_id: uuid.UUID, req: LotCreate) -> Lot:
        seq = random.randint(100, 999)
        numero_lot = f"LOT-{datetime.now().year}-{seq}"

        lot = Lot(
            id=uuid.uuid4(),
            numero_lot=numero_lot,
            cooperative_id=cooperative_id,
            grade=req.grade or "Grade A",
            poids_tonnes=req.poids_tonnes or 1.0,
            score_kor=req.score_kor if req.score_kor is not None else 54.2,
            humidite=req.humidite if req.humidite is not None else 6.8,
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
    def list_lots(db: Session, user: User) -> List[Lot]:
        """Lots visibles par l'appelant.

        Coopérative / agent : uniquement les lots de leur coopérative.
        Entrepôt, usinier, exportateur, admin : vue filière complète.
        """
        role = (user.role or "").lower()
        query = db.query(Lot)

        if role not in ROLES_VUE_GLOBALE:
            cooperative_id = user.cooperative_id if role == "agent" and user.cooperative_id else user.id
            query = query.filter(Lot.cooperative_id == cooperative_id)

        return query.order_by(Lot.created_at.desc()).all()

    @staticmethod
    def serialize_lot(db: Session, lot: Lot) -> Dict[str, Any]:
        """Lot enrichi du nom de sa coopérative, pour éviter que le client
        n'ait à inventer un libellé."""
        return {
            "id": lot.id,
            "numero_lot": lot.numero_lot,
            "cooperative_id": lot.cooperative_id,
            "nom_cooperative": EtapesService._nom(db, lot.cooperative_id),
            "grade": lot.grade,
            "poids_tonnes": lot.poids_tonnes,
            "score_kor": lot.score_kor,
            "humidite": lot.humidite,
            "gps_lat": lot.gps_lat,
            "gps_long": lot.gps_long,
            "statut": lot.statut,
            "created_at": lot.created_at,
        }

    @staticmethod
    def get_lot_by_id(db: Session, lot_id: uuid.UUID) -> Lot:
        lot = db.query(Lot).filter(Lot.id == lot_id).first()
        if not lot:
            raise HTTPException(status_code=404, detail="Lot introuvable")
        return lot

    # ------------------------------------------------------------------ #
    # Scans                                                              #
    # ------------------------------------------------------------------ #

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
            gps_lat=req.gps_lat,
            gps_long=req.gps_long,
            etape=req.etape or "collecte_terrain",
            date_scan=datetime.now(timezone.utc)
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        return scan

    @staticmethod
    def list_scans(db: Session, user: User, limit: int = 100) -> List[Scan]:
        return (
            EtapesService._scope_scans(db, user)
            .order_by(Scan.date_scan.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def serialize_scan(
        db: Session, scan: Optional[Scan], nom_cache: Optional[Dict[uuid.UUID, str]] = None
    ) -> Optional[Dict[str, Any]]:
        if not scan:
            return None
        nom_agent = nom_cache.get(scan.agent_id) if nom_cache is not None else EtapesService._nom(db, scan.agent_id)
        return {
            "id": scan.id,
            "image_url": scan.image_url,
            "grade_ia": scan.grade_ia,
            "score_confiance": scan.score_confiance,
            "score_kor": scan.score_kor,
            "humidite": scan.humidite,
            "defauts": scan.defauts,
            "gps_lat": scan.gps_lat,
            "gps_long": scan.gps_long,
            "etape": scan.etape,
            "date_scan": scan.date_scan,
            "agent_id": scan.agent_id,
            "nom_agent": nom_agent,
        }

    # ------------------------------------------------------------------ #
    # Bordereaux de transfert                                            #
    # ------------------------------------------------------------------ #

    @staticmethod
    def serialize_bordereaux_bulk(
        db: Session, bordereaux: List[BordereauTransfert]
    ) -> List[Dict[str, Any]]:
        """Sérialise une liste de bordereaux avec un nombre CONSTANT de requêtes.

        La version ligne par ligne émettait 6 requêtes par bordereau (scan
        initial, arbitrage, nom coopérative, nom entrepôt, nom agent, puis le
        scan à nouveau via serialize_scan). Mesuré à 2,4 s pour 3 bordereaux
        seulement sur une base distante — et ~15 s pour 20 lots. On résout donc
        tout en masse en 3 requêtes, quel que soit le nombre de lignes, comme le
        fait déjà list_lots_certifies.
        """
        if not bordereaux:
            return []

        scan_ids = {b.scan_initial_id for b in bordereaux if b.scan_initial_id}
        scans_par_id = {
            s.id: s for s in db.query(Scan).filter(Scan.id.in_(scan_ids)).all()
        } if scan_ids else {}

        bordereau_ids = {b.id for b in bordereaux}
        arbitres_ids = {
            a.bordereau_id
            for a in db.query(ArbitrageLot.bordereau_id)
            .filter(ArbitrageLot.bordereau_id.in_(bordereau_ids))
            .all()
        } if bordereau_ids else set()

        user_ids = set()
        for b in bordereaux:
            user_ids.add(b.cooperative_id)
            user_ids.add(b.entrepot_id)
        for s in scans_par_id.values():
            user_ids.add(s.agent_id)
        noms = EtapesService._noms_bulk(db, user_ids)

        resultats: List[Dict[str, Any]] = []
        for b in bordereaux:
            scan = scans_par_id.get(b.scan_initial_id) if b.scan_initial_id else None
            is_arbitre = (b.id in arbitres_ids) or (b.statut in ("ARBITRE", "VENDU"))
            resultats.append({
                "id": b.id,
                "numero_bordereau": b.numero_bordereau,
                "cooperative_id": b.cooperative_id,
                "entrepot_id": b.entrepot_id,
                "scan_initial_id": b.scan_initial_id,
                "immatriculation_camion": b.immatriculation_camion,
                "nom_chauffeur": b.nom_chauffeur,
                "volume_tonnes": b.volume_tonnes,
                "grade_lot": b.grade_lot,
                "statut": b.statut,
                "qr_payload": b.qr_payload,
                "created_at": b.created_at,
                "nom_cooperative": noms.get(b.cooperative_id),
                "nom_entrepot": noms.get(b.entrepot_id),
                "nom_agent": noms.get(scan.agent_id) if scan else None,
                "scan_initial": EtapesService.serialize_scan(db, scan, noms),
                "kor_initial": scan.score_kor if scan else None,
                "humidite_initiale": scan.humidite if scan else None,
                "arbitre": is_arbitre,
            })
        return resultats

    @staticmethod
    def serialize_bordereau(db: Session, b: BordereauTransfert) -> Dict[str, Any]:
        """Bordereau enrichi : la coopérative, l'entrepôt et surtout le scan
        bord champ sont résolus côté serveur pour permettre le pré-remplissage
        instantané à la réception (guide.md §4 étape 4).

        Délègue à la version en masse pour garder UN SEUL chemin de code : les
        deux variantes ne peuvent donc pas divergerner silencieusement.
        """

        if b is None:
            return None
        return EtapesService.serialize_bordereaux_bulk(db, [b])[0]


    @staticmethod
    def _resoudre_scan_initial(db: Session, cooperative_id: uuid.UUID, req: TransferOrderCreate) -> Scan:
        """Scan bord champ réellement associé au lot expédié.

        Aucun scan n'est jamais fabriqué : soit le client désigne le scan, soit
        on reprend le dernier scan terrain de la coopérative, soit on refuse.
        """
        if req.scan_initial_id:
            scan = db.query(Scan).filter(Scan.id == req.scan_initial_id).first()
            if not scan:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Le scan bord champ référencé est introuvable."
                )
            return scan

        agent_ids = EtapesService._agent_ids_de_la_cooperative(db, cooperative_id)
        scan = (
            db.query(Scan)
            .filter(Scan.agent_id.in_(agent_ids), Scan.etape == "collecte_terrain")
            .order_by(Scan.date_scan.desc())
            .first()
        )
        if not scan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Impossible d'émettre le bordereau : aucun scan bord champ n'est "
                    "rattaché à cette coopérative. Un agent doit d'abord analyser un "
                    "échantillon sur le terrain."
                )
            )
        return scan

    @staticmethod
    def _resoudre_entrepot(db: Session, req: TransferOrderCreate) -> Optional[User]:
        """Entrepôt destinataire, par UUID ou par libellé."""
        if req.entrepot_id:
            entrepot = db.query(User).filter(
                User.id == req.entrepot_id, User.role == "entrepot"
            ).first()
            if not entrepot:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Entrepôt de destination introuvable."
                )
            return entrepot

        if req.entrepot_destination:
            libelle = req.entrepot_destination.strip().lower()
            entrepots = db.query(User).filter(User.role == "entrepot").all()
            for e in entrepots:
                nom = (e.nom_complet or "").lower()
                if nom and (nom in libelle or libelle in nom):
                    return e
            # Repli : un seul entrepôt enregistré => c'est forcément lui.
            if len(entrepots) == 1:
                return entrepots[0]

        return None

    @staticmethod
    def create_transfer_order(db: Session, cooperative_id: uuid.UUID, req: TransferOrderCreate) -> BordereauTransfert:
        scan_initial = EtapesService._resoudre_scan_initial(db, cooperative_id, req)
        entrepot = EtapesService._resoudre_entrepot(db, req)

        seq = random.randint(10, 99)
        numero_bordereau = f"TRF-{datetime.now().year}-{seq}"
        while db.query(BordereauTransfert).filter(
            BordereauTransfert.numero_bordereau == numero_bordereau
        ).first():
            seq = random.randint(10, 999)
            numero_bordereau = f"TRF-{datetime.now().year}-{seq}"

        nom_cooperative = EtapesService._nom(db, cooperative_id)
        nom_agent = EtapesService._nom(db, scan_initial.agent_id)
        volume = req.volume_tonnes or 1.0
        grade = req.grade_lot or scan_initial.grade_ia or "Grade A"

        qr_payload_dict = {
            "numero_bordereau": numero_bordereau,
            "lot_id": str(scan_initial.id),
            "scan_initial_id": str(scan_initial.id),
            "cooperative_id": str(cooperative_id),
            "cooperative_origine": nom_cooperative,
            "agent_pisteur": nom_agent,
            "entrepot_id": str(entrepot.id) if entrepot else None,
            "entrepot_destination": entrepot.nom_complet if entrepot else req.entrepot_destination,
            "immatriculation_camion": req.immatriculation_camion,
            "nom_chauffeur": req.nom_chauffeur,
            "volume_tonnes": volume,
            "grade": grade,
            "kor_initial": scan_initial.score_kor,
            "humidite_initiale": scan_initial.humidite,
            "gps_collecte": [scan_initial.gps_lat, scan_initial.gps_long],
            "date_scan_initial": scan_initial.date_scan.isoformat() if scan_initial.date_scan else None,
        }

        bordereau = BordereauTransfert(
            id=uuid.uuid4(),
            numero_bordereau=numero_bordereau,
            cooperative_id=cooperative_id,
            entrepot_id=entrepot.id if entrepot else None,
            scan_initial_id=scan_initial.id,
            immatriculation_camion=req.immatriculation_camion or "CI-000-XX",
            nom_chauffeur=req.nom_chauffeur or "Chauffeur",
            volume_tonnes=volume,
            grade_lot=grade,
            statut="EN TRANSIT",
            qr_payload=json.dumps(qr_payload_dict, ensure_ascii=False),
            created_at=datetime.now(timezone.utc)
        )

        db.add(bordereau)

        # Les lots concernés passent en transit
        db.query(Lot).filter(
            Lot.cooperative_id == cooperative_id,
            Lot.statut == "EN_STOCK_COOPERATIVE"
        ).update({"statut": "EN_TRANSIT"}, synchronize_session=False)

        db.commit()
        db.refresh(bordereau)

        NotificationService.create_notification(
            db,
            NotificationCreate(
                utilisateur_id=cooperative_id,
                type="transit",
                contenu=(
                    f"Bordereau {numero_bordereau} généré. {volume} T ({grade}) "
                    f"en transit vers {entrepot.nom_complet if entrepot else 'l’entrepôt central'} "
                    f"— camion {bordereau.immatriculation_camion}."
                ),
                reference_id=numero_bordereau
            )
        )

        # L'entrepôt destinataire est prévenu de l'arrivée du camion
        if entrepot:
            NotificationService.create_notification(
                db,
                NotificationCreate(
                    utilisateur_id=entrepot.id,
                    type="transit",
                    contenu=(
                        f"Camion en approche : bordereau {numero_bordereau} — "
                        f"{volume} T ({grade}) expédiées par {nom_cooperative}. "
                        f"Camion {bordereau.immatriculation_camion}, chauffeur {bordereau.nom_chauffeur}."
                    ),
                    reference_id=numero_bordereau
                )
            )

        return bordereau

    @staticmethod
    def get_transfer_by_number_or_id(db: Session, identifier: str) -> BordereauTransfert:
        identifier = (identifier or "").strip()
        query = db.query(BordereauTransfert).filter(
            BordereauTransfert.numero_bordereau == identifier
        )
        bordereau = query.first()

        if not bordereau:
            as_uuid = EtapesService._as_uuid(identifier)
            if as_uuid:
                bordereau = db.query(BordereauTransfert).filter(
                    BordereauTransfert.id == as_uuid
                ).first()

        if not bordereau:
            # Le QR code peut contenir le payload JSON complet
            try:
                payload = json.loads(identifier)
                numero = payload.get("numero_bordereau")
                if numero:
                    bordereau = db.query(BordereauTransfert).filter(
                        BordereauTransfert.numero_bordereau == numero
                    ).first()
            except (ValueError, TypeError):
                pass

        if not bordereau:
            raise HTTPException(
                status_code=404,
                detail=f"Bordereau de transfert « {identifier} » introuvable."
            )

        if bordereau.statut in ("EN TRANSIT", "EN_TRANSIT"):
            bordereau.statut = "EN_TRAITEMENT"
            db.commit()
            db.refresh(bordereau)

        return bordereau


    @staticmethod
    def list_transfers(db: Session, user: User) -> List[BordereauTransfert]:
        """Bordereaux visibles par l'appelant.

        Coopérative : ses expéditions. Entrepôt : ce qui lui est destiné
        (plus les bordereaux sans destinataire, pour ne rien perdre).
        """
        role = (user.role or "").lower()
        query = db.query(BordereauTransfert)

        if role == "cooperative":
            query = query.filter(BordereauTransfert.cooperative_id == user.id)
        elif role == "agent":
            coop_id = user.cooperative_id or user.id
            query = query.filter(BordereauTransfert.cooperative_id == coop_id)
        elif role == "entrepot":
            query = query.filter(
                (BordereauTransfert.entrepot_id == user.id)
                | (BordereauTransfert.entrepot_id.is_(None))
            )
        # usine / exportateur / admin : vue complète

        return query.order_by(BordereauTransfert.created_at.desc()).all()

    # ------------------------------------------------------------------ #
    # Arbitrage & scellement de la vente                                 #
    # ------------------------------------------------------------------ #

    @staticmethod
    def execute_arbitrage(db: Session, inspecteur_id: uuid.UUID, req: ArbitrageCreate) -> ArbitrageLot:
        bordereau = db.query(BordereauTransfert).filter(
            BordereauTransfert.id == req.bordereau_id
        ).first()
        if not bordereau:
            raise HTTPException(status_code=404, detail="Bordereau de transfert non trouvé.")

        existant = db.query(ArbitrageLot).filter(
            ArbitrageLot.bordereau_id == bordereau.id
        ).first()
        if existant:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Le bordereau {bordereau.numero_bordereau} a déjà été arbitré et scellé."
            )

        acheteur = None
        if req.acheteur_id:
            acheteur = db.query(User).filter(User.id == req.acheteur_id).first()
            if not acheteur:
                raise HTTPException(status_code=404, detail="Acheteur introuvable.")
            if (acheteur.role or "").lower() not in ("usine", "exportateur"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="L'acheteur doit être un usinier ou un exportateur."
                )

        scan_initial = db.query(Scan).filter(Scan.id == bordereau.scan_initial_id).first()

        # Les relevés physiques priment toujours sur les estimations de l'IA :
        # le KOR vient du test de coupe, l'humidité de l'humidimètre. Aucune
        # photo ne peut produire ces deux valeurs.
        kor_final = req.kor_mesure if req.kor_mesure is not None else req.scan_entrepot_kor
        humidite_finale = req.humidite_mesuree if req.humidite_mesuree is not None else req.scan_entrepot_humidite
        kor_source = "mesure" if req.kor_mesure is not None else "estimation_ia"
        humidite_source = "mesure" if req.humidite_mesuree is not None else "estimation_ia"

        scan_entrepot = Scan(
            id=uuid.uuid4(),
            agent_id=inspecteur_id,
            image_url=req.scan_entrepot_image_url,
            grade_ia=req.scan_entrepot_grade,
            score_confiance=0.98,
            score_kor=kor_final,
            humidite=humidite_finale,
            defauts={"kor_source": kor_source, "humidite_source": humidite_source},
            gps_lat=scan_initial.gps_lat if scan_initial else None,
            gps_long=scan_initial.gps_long if scan_initial else None,
            etape="entrepot_arbitrage",
            date_scan=datetime.now(timezone.utc)
        )
        db.add(scan_entrepot)
        db.flush()

        # Verdict de conformité fondé sur des critères EXPLICABLES, et non sur
        # un seul écart entre deux estimations. Chaque motif de rejet est
        # conservé pour pouvoir être justifié à l'acheteur.
        motifs: List[str] = []

        kor_initial = scan_initial.score_kor if scan_initial else None
        if kor_initial is not None and kor_final is not None:
            delta_kor = abs(kor_final - kor_initial)
            if delta_kor > SEUIL_CONFORMITE_KOR:
                motifs.append(f"écart de rendement de {round(delta_kor, 2)} lbs entre la collecte et le déchargement")
        else:
            delta_kor = 0.0

        # Seuil filière : au-delà de 10 % d'humidité, le risque de moisissure
        # au stockage devient significatif.
        if humidite_finale is not None and humidite_finale > 10:
            motifs.append(f"humidité de {humidite_finale} % supérieure au seuil de stockage (10 %)")

        # Dégradation visuelle entre les deux scans (ex. « Grade A » -> « Rejeté »).
        ORDRE = {"grade a": 0, "grade b": 1, "grade c": 2, "rejeté": 3, "rejete": 3}
        rang_initial = ORDRE.get((scan_initial.grade_ia or "").lower()) if scan_initial else None
        rang_final = ORDRE.get((req.scan_entrepot_grade or "").lower())
        if rang_initial is not None and rang_final is not None and rang_final > rang_initial + 1:
            motifs.append("dégradation visuelle marquée entre la collecte et le déchargement")

        conforme = len(motifs) == 0

        bordereau.statut = "ARBITRE"
        bordereau.entrepot_id = inspecteur_id

        arbitrage = ArbitrageLot(
            id=uuid.uuid4(),
            bordereau_id=bordereau.id,
            scan_entrepot_id=scan_entrepot.id,
            inspecteur_id=inspecteur_id,
            acheteur_id=acheteur.id if acheteur else None,
            verdict_conforme=conforme,
            delta_kor=round(delta_kor, 2),
            statut_vente="VENTE_SCELLEE",
            certificat_pdf_url=f"/api/v1/etapes/certificat/{bordereau.numero_bordereau}",
            scelle_a=datetime.now(timezone.utc)
        )
        db.add(arbitrage)

        db.query(Lot).filter(
            Lot.cooperative_id == bordereau.cooperative_id,
            Lot.statut == "EN_TRANSIT"
        ).update({"statut": "VENDU"}, synchronize_session=False)

        db.commit()
        db.refresh(arbitrage)

        verdict = "CONFORME" if conforme else "ÉCART DÉTECTÉ"
        nom_entrepot = EtapesService._nom(db, inspecteur_id)
        nom_cooperative = EtapesService._nom(db, bordereau.cooperative_id)

        NotificationService.create_notification(
            db,
            NotificationCreate(
                utilisateur_id=bordereau.cooperative_id,
                type="arbitrage",
                contenu=(
                    f"Vente scellée : bordereau {bordereau.numero_bordereau} arbitré par "
                    f"{nom_entrepot}. Verdict {verdict}"
                    + (f" — {' ; '.join(motifs)}." if motifs else ".")
                    + (f" Acheteur : {acheteur.nom_complet}." if acheteur else "")
                ),
                reference_id=bordereau.numero_bordereau
            )
        )

        # Étape 5 du guide : transmission au portail de l'acheteur
        if acheteur:
            NotificationService.create_notification(
                db,
                NotificationCreate(
                    utilisateur_id=acheteur.id,
                    type="vente",
                    contenu=(
                        f"Nouveau lot certifié disponible : {bordereau.numero_bordereau} — "
                        f"{bordereau.volume_tonnes} T ({bordereau.grade_lot}), KOR {req.scan_entrepot_kor} lbs, "
                        f"origine {nom_cooperative}. Verdict IA : {verdict}."
                    ),
                    reference_id=bordereau.numero_bordereau
                )
            )

        return arbitrage

    @staticmethod
    def _scope_lots_certifies_query(db: Session, user: User):
        """Filtre commun (comptage et listing) des lots scellés visibles par l'appelant."""
        role = (user.role or "").lower()
        query = db.query(ArbitrageLot)

        if role in ("usine", "usineur", "exportateur", "exporter", "acheteur"):
            query = query.filter(
                (ArbitrageLot.acheteur_id == user.id)
                | (ArbitrageLot.acheteur_id.is_(None))
            )

        elif role == "entrepot":
            query = query.filter(ArbitrageLot.inspecteur_id == user.id)
        elif role == "cooperative":
            query = query.join(
                BordereauTransfert, ArbitrageLot.bordereau_id == BordereauTransfert.id
            ).filter(BordereauTransfert.cooperative_id == user.id)
        # admin : tout
        return query

    @staticmethod
    def count_lots_certifies(db: Session, user: User) -> int:
        """Nombre de lots scellés, sans payer le coût de sérialisation complète."""
        return EtapesService._scope_lots_certifies_query(db, user).count()

    @staticmethod
    def list_lots_certifies(db: Session, user: User) -> List[Dict[str, Any]]:
        """Lots scellés transmis au portail de l'acheteur (étape 5 du guide).

        Usinier / exportateur : uniquement les lots qui leur ont été attribués.
        Entrepôt : les ventes qu'il a arbitrées. Coopérative : ses ventes.
        """
        arbitrages = EtapesService._scope_lots_certifies_query(db, user).order_by(
            ArbitrageLot.scelle_a.desc()
        ).all()
        if not arbitrages:
            return []

        # Résolution en masse des bordereaux, scans et noms référencés :
        # évite les ~7 requêtes/ligne (N+1) d'une résolution lot par lot.
        bordereau_ids = {arb.bordereau_id for arb in arbitrages if arb.bordereau_id}
        bordereaux_par_id = {
            b.id: b for b in db.query(BordereauTransfert).filter(BordereauTransfert.id.in_(bordereau_ids)).all()
        } if bordereau_ids else {}

        scan_ids = {arb.scan_entrepot_id for arb in arbitrages if arb.scan_entrepot_id}
        scan_ids |= {b.scan_initial_id for b in bordereaux_par_id.values() if b.scan_initial_id}
        scans_par_id = {
            s.id: s for s in db.query(Scan).filter(Scan.id.in_(scan_ids)).all()
        } if scan_ids else {}

        user_ids = set()
        for arb in arbitrages:
            user_ids.add(arb.acheteur_id)
            user_ids.add(arb.inspecteur_id)
        for b in bordereaux_par_id.values():
            user_ids.add(b.cooperative_id)
        for s in scans_par_id.values():
            user_ids.add(s.agent_id)
        noms = EtapesService._noms_bulk(db, user_ids)

        resultats: List[Dict[str, Any]] = []
        for arb in arbitrages:
            bordereau = bordereaux_par_id.get(arb.bordereau_id)
            if not bordereau:
                continue
            scan_initial = scans_par_id.get(bordereau.scan_initial_id)
            scan_entrepot = scans_par_id.get(arb.scan_entrepot_id)

            resultats.append({
                "arbitrage_id": arb.id,
                "bordereau_id": bordereau.id,
                "numero_bordereau": bordereau.numero_bordereau,
                "acheteur_id": arb.acheteur_id,
                "nom_acheteur": noms.get(arb.acheteur_id),
                "nom_cooperative": noms.get(bordereau.cooperative_id),
                "nom_agent": noms.get(scan_initial.agent_id) if scan_initial else None,
                "nom_entrepot": noms.get(arb.inspecteur_id),
                "grade_lot": bordereau.grade_lot,
                "volume_tonnes": bordereau.volume_tonnes,
                "immatriculation_camion": bordereau.immatriculation_camion,
                "nom_chauffeur": bordereau.nom_chauffeur,
                "kor_initial": scan_initial.score_kor if scan_initial else None,
                "humidite_initiale": scan_initial.humidite if scan_initial else None,
                "kor_entrepot": scan_entrepot.score_kor if scan_entrepot else None,
                "humidite_entrepot": scan_entrepot.humidite if scan_entrepot else None,
                "delta_kor": arb.delta_kor or 0.0,
                "verdict_conforme": bool(arb.verdict_conforme),
                "image_scan_initial": scan_initial.image_url if scan_initial else None,
                "image_scan_entrepot": scan_entrepot.image_url if scan_entrepot else None,
                "gps_lat": scan_initial.gps_lat if scan_initial else None,
                "gps_long": scan_initial.gps_long if scan_initial else None,
                "statut_vente": arb.statut_vente,
                "certificat_pdf_url": arb.certificat_pdf_url,
                "scelle_a": arb.scelle_a,
                # Horodatage des 4 étapes réelles de la chaîne, pour la vue
                # "parcours du lot" (traçabilité de bout en bout).
                "date_collecte": scan_initial.date_scan if scan_initial else None,
                "date_expedition": bordereau.created_at,
                "date_arbitrage": scan_entrepot.date_scan if scan_entrepot else None,
            })
        return resultats

    # ------------------------------------------------------------------ #
    # Statistiques                                                       #
    # ------------------------------------------------------------------ #

    @staticmethod
    def get_stats(db: Session, user: User) -> dict:
        role = (user.role or "").lower()

        lots = EtapesService.list_lots(db, user)
        # with_entities: seul le KOR est nécessaire ici, on évite de rapatrier
        # image_url (parfois plusieurs dizaines de Ko de base64 hérité).
        scans = EtapesService._scope_scans(db, user).with_entities(Scan.score_kor).all()

        bordereaux = EtapesService.list_transfers(db, user)
        lots_en_transit = sum(1 for b in bordereaux if (b.statut or "").upper() == "EN TRANSIT")
        lots_scelles = EtapesService.count_lots_certifies(db, user)

        total_tonnage = sum(l.poids_tonnes or 0 for l in lots)
        tonnage_expedie = sum(b.volume_tonnes or 0 for b in bordereaux)

        kor_values = [l.score_kor for l in lots if l.score_kor is not None]
        kor_values += [s.score_kor for s in scans if s.score_kor is not None]
        kor_moyen = round(sum(kor_values) / len(kor_values), 1) if kor_values else 0.0

        def tonnes_grade(lettre: str) -> float:
            return sum(
                l.poids_tonnes or 0 for l in lots
                if l.poids_tonnes and lettre in (l.grade or "").upper().replace("GRADE", "").strip()
            )

        grade_a = tonnes_grade("A")
        grade_b = tonnes_grade("B")
        grade_c = tonnes_grade("C")
        premium_pct = round((grade_a / total_tonnage) * 100, 1) if total_tonnage > 0 else 0.0

        return {
            "utilisateur": user.nom_complet,
            "role": role,
            "tonnage_total_collecte": round(total_tonnage, 2),
            "tonnage_expedie": round(tonnage_expedie, 2),
            "kor_moyen": kor_moyen,
            "qualite_premium_pourcent": premium_pct,
            "lots_en_transit": lots_en_transit,
            "lots_scelles": lots_scelles,
            "total_lots_count": len(lots),
            "total_scans_count": len(scans),
            "total_bordereaux": len(bordereaux),
            "grades": {
                "Grade A": f"{grade_a:.1f} Tonnes",
                "Grade B": f"{grade_b:.1f} Tonnes",
                "Grade C": f"{grade_c:.1f} Tonnes",
            },
        }
