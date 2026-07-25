import asyncio
import json
from typing import Dict, Set

class NotificationBroadcaster:
    """Gestionnaire temps réel SSE pour la diffusion des notifications aux utilisateurs."""
    def __init__(self):
        self._listeners: Dict[str, Set[asyncio.Queue]] = {}

    def subscribe(self, user_id: str) -> asyncio.Queue:
        queue = asyncio.Queue()
        if user_id not in self._listeners:
            self._listeners[user_id] = set()
        self._listeners[user_id].add(queue)
        return queue

    def unsubscribe(self, user_id: str, queue: asyncio.Queue):
        if user_id in self._listeners:
            self._listeners[user_id].discard(queue)
            if not self._listeners[user_id]:
                del self._listeners[user_id]

    async def broadcast_to_user(self, user_id: str, data: dict):
        if user_id in self._listeners:
            for queue in list(self._listeners[user_id]):
                await queue.put(data)

notification_broadcaster = NotificationBroadcaster()
