import uuid
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException, status
import httpx
from backend.config import settings

# Directory for local fallback upload storage
UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads" / "scans"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

class SupabaseStorageService:
    """Service d'envoi et de gestion sécurisée des images sur Supabase Storage.
    Toutes les requêtes d'envoi passent côté serveur pour protéger les clés secrètes.
    """

    BUCKET_NAME = "scans"

    @staticmethod
    def get_supabase_url_and_key():
        # Derive Supabase project URL from DATABASE_URL if available
        # e.g. postgresql://postgres.znycdrepalmdsxakpkfc:... -> https://znycdrepalmdsxakpkfc.supabase.co
        db_url = settings.DATABASE_URL
        project_ref = None
        if "postgres." in db_url:
            try:
                project_ref = db_url.split("postgres.")[1].split(":")[0]
            except Exception:
                pass

        # Lues via `settings` (pydantic-settings), pas `os.getenv` : ce projet
        # charge le `.env` uniquement dans l'objet Settings, sans jamais le
        # copier dans l'environnement du processus — os.getenv() ne voyait
        # donc jamais ces clés, même correctement renseignées dans .env.
        supabase_url = settings.SUPABASE_URL or (f"https://{project_ref}.supabase.co" if project_ref else "")
        # Uniquement une VRAIE clé Supabase (service role ou clé API projet).
        # `JWT_SECRET` sert à signer les jetons applicatifs NIANKA — ce n'est
        # pas une clé Supabase. L'utiliser ici provoquait un aller-retour
        # réseau voué à l'échec (401) à CHAQUE upload avant de retomber sur
        # le stockage de secours, ralentissant chaque scan pour rien.
        supabase_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
        return supabase_url, supabase_key

    @staticmethod
    def _local_fallback_url(filename: str) -> str:
        """URL absolue vers le fichier stocké localement.

        Le backend et le frontend tournent sur des origines différentes
        (ports 8081 et 3000) : une URL relative comme `/uploads/scans/x.jpg`
        se résoudrait, côté navigateur, contre l'origine du FRONTEND — où ce
        chemin n'existe pas — et casserait l'affichage de l'image.
        """
        base = settings.PUBLIC_BASE_URL.rstrip("/")
        return f"{base}/uploads/scans/{filename}"

    @classmethod
    async def upload_file(cls, file: UploadFile, folder: str = "scans") -> str:
        """Upload une image reçue du frontend vers Supabase Storage et retourne son URL publique.
        Si Supabase Storage n'est pas configuré, sauvegarde localement en mode fallback.
        """
        # Validate MIME type
        allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
        if file.content_type and file.content_type.lower() not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Format de fichier non supporté. Formats acceptés: JPEG, PNG, WEBP."
            )

        file_bytes = await file.read()
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Fichier vide fourni.")

        # Generate unique filename
        ext = Path(file.filename or "image.jpg").suffix or ".jpg"
        unique_name = f"{folder}/{uuid.uuid4()}{ext}"

        supabase_url, service_key = cls.get_supabase_url_and_key()

        # Try uploading directly to Supabase Storage if URL is available
        if supabase_url and "supabase.co" in supabase_url and service_key:
            endpoint = f"{supabase_url}/storage/v1/object/{cls.BUCKET_NAME}/{unique_name}"
            headers = {
                "Authorization": f"Bearer {service_key}",
                "apiKey": service_key,
                "Content-Type": file.content_type or "image/jpeg"
            }
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    response = await client.post(endpoint, content=file_bytes, headers=headers)
                    if response.status_code in [200, 201]:
                        public_url = f"{supabase_url}/storage/v1/object/public/{cls.BUCKET_NAME}/{unique_name}"
                        return public_url
            except Exception as e:
                print(f"[WARN] Supabase storage upload notice, using fallback storage: {e}")

        # Fallback local file storage
        local_filename = f"{uuid.uuid4()}{ext}"
        local_path = UPLOADS_DIR / local_filename
        with open(local_path, "wb") as f:
            f.write(file_bytes)

        return cls._local_fallback_url(local_filename)

    @classmethod
    async def upload_bytes(cls, file_bytes: bytes, filename: str = "scan.jpg", content_type: str = "image/jpeg", folder: str = "scans") -> str:
        """Upload des octets d'image vers Supabase Storage et retourne l'URL publique Supabase."""
        ext = Path(filename or "image.jpg").suffix or ".jpg"
        unique_name = f"{folder}/{uuid.uuid4()}{ext}"

        supabase_url, service_key = cls.get_supabase_url_and_key()

        if supabase_url and "supabase.co" in supabase_url and service_key:
            endpoint = f"{supabase_url}/storage/v1/object/{cls.BUCKET_NAME}/{unique_name}"
            headers = {
                "Authorization": f"Bearer {service_key}",
                "apiKey": service_key,
                "Content-Type": content_type
            }
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    response = await client.post(endpoint, content=file_bytes, headers=headers)
                    if response.status_code in [200, 201]:
                        public_url = f"{supabase_url}/storage/v1/object/public/{cls.BUCKET_NAME}/{unique_name}"
                        print(f"[SUCCESS STORAGE] Image enregistrée sur Supabase Storage : {public_url}")
                        return public_url
                    print(f"[WARN STORAGE] Réponse Supabase Storage inattendue ({response.status_code}), bascule locale.")
            except Exception as e:
                print(f"[WARN STORAGE] Notice Supabase storage upload : {e}")

        # Fallback : disque local, servi par le backend sous /uploads/scans/...
        # Bien plus léger qu'un data-URL base64 embarqué dans la base de
        # données et dans CHAQUE réponse API qui liste des scans (dashboards,
        # historique, notifications) — c'était la cause principale des
        # chargements lents observés dans l'application.
        local_filename = f"{uuid.uuid4()}{ext}"
        local_path = UPLOADS_DIR / local_filename
        with open(local_path, "wb") as f:
            f.write(file_bytes)

        return cls._local_fallback_url(local_filename)
