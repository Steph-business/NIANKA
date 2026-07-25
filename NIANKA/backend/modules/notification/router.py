import asyncio
import json
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from backend.common.dependencies import get_current_user
from backend.common.sse import notification_broadcaster
from backend.database import get_db
from backend.modules.authentification.models import User
from backend.modules.notification.schemas import NotificationCreate, NotificationResponse
from backend.modules.notification.services import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[NotificationResponse])
def list_notifications(
    unread_only: Optional[bool] = Query(None, description="Filtrer uniquement les non lues"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Liste les notifications de l'utilisateur connecté."""
    return NotificationService.get_user_notifications(db, current_user.id, unread_only)


@router.post("/", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    req: NotificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crée une notification et la diffuse en temps réel."""
    return NotificationService.create_notification(db, req)


@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marque une notification comme lue."""
    success = NotificationService.mark_as_read(db, notification_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification non trouvée.")
    return {"message": "Notification marquée comme lue"}


@router.patch("/read-all")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marque toutes les notifications de l'utilisateur comme lues."""
    count = NotificationService.mark_all_as_read(db, current_user.id)
    return {"message": f"{count} notifications marquées comme lues"}


@router.delete("/{notification_id}")
def delete_notif(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Supprime une notification."""
    success = NotificationService.delete_notification(db, notification_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification non trouvée.")
    return {"message": "Notification supprimée"}


@router.get("/stream")
async def stream_notifications(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Flux temps réel (Server-Sent Events) pour les notifications de l'utilisateur."""
    user_id_str = str(current_user.id)
    queue = notification_broadcaster.subscribe(user_id_str)

    async def event_generator():
        try:
            # Send initial ping event
            yield f"event: ping\ndata: {json.dumps({'status': 'connected'})}\n\n"
            while True:
                if await request.is_disconnected():
                    break
                try:
                    data = await asyncio.wait_for(queue.get(), timeout=20.0)
                    yield f"event: notification\ndata: {json.dumps(data)}\n\n"
                except asyncio.TimeoutError:
                    # Heartbeat
                    yield "event: heartbeat\ndata: {}\n\n"
        finally:
            notification_broadcaster.unsubscribe(user_id_str, queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
