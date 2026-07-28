"""
Jeu de démonstration NIANKA — crée les 6 acteurs de la chaîne de traçabilité.

Ce script est IDEMPOTENT et NON DESTRUCTIF : il ne supprime ni ne modifie
aucune donnée existante. Un compte déjà présent (même numéro de téléphone)
est simplement laissé en l'état.

Usage :
    python -m backend.seed_demo
"""

import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.common.security import hash_password
from backend.database import SessionLocal
from backend.modules.authentification.models import Profil, User

MOT_DE_PASSE_DEMO = "Nianka2026"

# (rôle, nom affiché, téléphone) — l'agent est rattaché à la coopérative.
ACTEURS = [
    ("cooperative", "Coopérative ANADER Bouaké", "+2250700000101"),
    ("agent",       "Sarah Koné (Pisteur)",      "+2250700000102"),
    ("entrepot",    "Entrepôt Central Abidjan Port", "+2250700000103"),
    ("usine",       "Usine Cajou Industries SA", "+2250700000104"),
    ("exportateur", "Export Ivoire International", "+2250700000105"),
    ("admin",       "Ministère de l'Agriculture", "+2250700000106"),
]


def _profil_id(db, role: str) -> uuid.UUID:
    profil = db.query(Profil).filter(Profil.libelle == role).first()
    if not profil:
        profil = Profil(id=uuid.uuid4(), libelle=role)
        db.add(profil)
        db.flush()
    return profil.id


def _pseudo(nom: str, telephone: str) -> str:
    base = "".join(c for c in nom.lower() if c.isalnum())
    return f"{base}{telephone[-4:]}"


def main() -> None:
    db = SessionLocal()
    maintenant = datetime.now(timezone.utc)
    cooperative_id = None
    resume = []

    try:
        for role, nom, telephone in ACTEURS:
            existant = db.query(User).filter(User.telephone == telephone).first()

            if existant:
                # On ne modifie rien, sauf le rattachement de l'agent s'il manque.
                if role == "agent" and cooperative_id and not existant.cooperative_id:
                    existant.cooperative_id = cooperative_id
                    db.commit()
                    resume.append((nom, telephone, role, "existant (rattaché)"))
                else:
                    resume.append((nom, telephone, role, "existant — inchangé"))
                if role == "cooperative":
                    cooperative_id = existant.id
                continue

            user = User(
                id=uuid.uuid4(),
                nom_complet=nom,
                pseudo=_pseudo(nom, telephone),
                email=f"demo{telephone[-4:]}@nianka.ci",
                telephone=telephone,
                password_hash=hash_password(MOT_DE_PASSE_DEMO),
                profil_id=_profil_id(db, role),
                cooperative_id=cooperative_id if role == "agent" else None,
                role=role,
                statut="actif",
                is_verified=True,
                email_verified=True,
                profil_complet=True,
                created_at=maintenant,
                updated_at=maintenant,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            if role == "cooperative":
                cooperative_id = user.id
            resume.append((nom, telephone, role, "CRÉÉ"))

        print("\n" + "=" * 78)
        print(" JEU DE DÉMONSTRATION NIANKA")
        print("=" * 78)
        print(f" Mot de passe commun à tous les comptes : {MOT_DE_PASSE_DEMO}\n")
        print(f" {'RÔLE':<13} {'TÉLÉPHONE':<17} {'NOM':<34} ÉTAT")
        print(" " + "-" * 76)
        for nom, telephone, role, etat in resume:
            print(f" {role:<13} {telephone:<17} {nom:<34} {etat}")
        print("=" * 78)
        print(" Connexion : numéro de téléphone + mot de passe (aucun code OTP).")
        print("=" * 78 + "\n")

    finally:
        db.close()


if __name__ == "__main__":
    main()
