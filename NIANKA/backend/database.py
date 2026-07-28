import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.types import TypeDecorator, CHAR, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from backend.config import settings

# Adjust PostgreSQL URL for SQLAlchemy if needed
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Configure Engine
engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    connect_args={"sslmode": "require"} if "supabase.com" in db_url else {}
)

# expire_on_commit=False : par défaut, SQLAlchemy invalide TOUS les objets
# chargés dans la session après chaque commit() — le moindre accès à un
# attribut déjà en mémoire (ex: current_user.cooperative_id après avoir
# enregistré un scan) déclenche alors un SELECT silencieux supplémentaire.
# Avec une base Supabase distante (aller-retour réseau de plusieurs centaines
# de ms), cette cascade de requêtes invisibles était une cause majeure de
# lenteur. Chaque requête HTTP a de toute façon sa propre session courte
# (voir get_db), donc aucun risque de lire des données périmées entre deux
# requêtes différentes.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, expire_on_commit=False, bind=engine)

Base = declarative_base()

class GUID(TypeDecorator):
    """Cross-dialect GUID type. PostgreSQL uses UUID, SQLite uses CHAR(36)."""
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if not isinstance(value, uuid.UUID):
            try:
                return str(uuid.UUID(str(value)))
            except ValueError:
                return str(value)
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if not isinstance(value, uuid.UUID):
            return uuid.UUID(str(value))
        return value

JSONColumn = JSON().with_variant(JSONB, "postgresql")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
