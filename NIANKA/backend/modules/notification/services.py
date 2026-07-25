import asyncio
from datetime import datetime, timezone
from typing import List, Optional
import uuid

from sqlalchemy.orm import Session
from backend.common.sse import notification_broadcaster
from backend.modules.notification.models import Notification
from backend.modules.notification.schemas import NotificationCreate

class NotificationService:

    @staticmethod
    def create_notification(db: Session, req: NotificationCreate) -> Notification:
        notif = Notification(
            id=uuid.uuid4(),
            utilisateur_id=req.utilisateur_id,
            type=req.type,
            contenu=req.contenu,
            reference_id=req.reference_id,
            lu=False,
            cree_le=datetime.now(timezone.utc)
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)

        # Broadcast via SSE event loop asynchronously if running
        data = {
            "id": str(notif.id),
            "utilisateur_id": str(notif.utilisateur_id),
            "type": notif.type,
            "contenu": notif.contenu,
            "reference_id": notif.reference_id,
            "lu": notif.lu,
            "cree_le": notif.cree_le.isoformat()
        }
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.run_coroutine_threadsafe(
                    notification_broadcaster.broadcast_to_user(str(notif.utilisateur_id), data),
                    loop
                )
        except Exception:
            pass

        return notif

    @staticmethod
    def get_user_notifications(
        db: Session, user_id: uuid.UUID, unread_only: Optional[bool] = None
    ) -> List[dict]:
        from backend.modules.etapes.models import Scan
        query = db.query(Notification).filter(Notification.utilisateur_id == user_id)
        if unread_only is True:
            query = query.filter(Notification.lu == False)
        notifs = query.order_by(Notification.cree_le.desc()).all()

        res = []
        for n in notifs:
            n_dict = {
                "id": str(n.id),
                "utilisateur_id": str(n.utilisateur_id),
                "type": n.type,
                "contenu": n.contenu,
                "lu": n.lu,
                "reference_id": n.reference_id,
                "cree_le": n.cree_le.isoformat() if n.cree_le else None,
                "scan": None
            }
            if n.reference_id:
                try:
                    scan_uuid = uuid.UUID(n.reference_id)
                    scan = db.query(Scan).filter(Scan.id == scan_uuid).first()
                    if scan:
                        n_dict["scan"] = {
                            "id": str(scan.id),
                            "image_url": scan.image_url,
                            "grade_ia": scan.grade_ia,
                            "score_kor": scan.score_kor,
                            "humidite": scan.humidite,
                            "defauts": scan.defauts
                        }
                except Exception:
                    pass
            res.append(n_dict)
        return res

    @staticmethod
    def mark_as_read(db: Session, notif_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        notif = db.query(Notification).filter(
            Notification.id == notif_id,
            Notification.utilisateur_id == user_id
        ).first()
        if notif:
            notif.lu = True
            db.commit()
            return True
        return False

    @staticmethod
    def mark_all_as_read(db: Session, user_id: uuid.UUID) -> int:
        count = db.query(Notification).filter(
            Notification.utilisateur_id == user_id,
            Notification.lu == False
        ).update({"lu": True})
        db.commit()
        return count

    @staticmethod
    def delete_notification(db: Session, notif_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        notif = db.query(Notification).filter(
            Notification.id == notif_id,
            Notification.utilisateur_id == user_id
        ).first()
        if notif:
            db.delete(notif)
            db.commit()
            return True
        return False
