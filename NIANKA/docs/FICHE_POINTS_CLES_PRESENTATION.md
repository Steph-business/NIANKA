# NIANKA — Fiche de Points Clés pour la Présentation

## ✅ Ce qui est 100% RÉEL

- **Classification de grade (A / B / C / Rejeté)** — vrai modèle IA (MobileNetV3, transfer learning), inférence réelle sur chaque photo, pas un tirage aléatoire.
- **Taux de défaut** — analyse d'image réelle (détection de taches sombres et d'hétérogénéité de couleur dans l'échantillon détecté). Varie réellement d'une photo à l'autre.
- **Traçabilité de bout en bout** — chaque étape (collecte agent → coopérative → entrepôt → acheteur) est horodatée et enregistrée en base de données réelle (Supabase PostgreSQL).
- **Double scan anti-fraude** — un scan à la collecte, un second à l'entrepôt ; le système compare automatiquement les deux (écart KOR, verdict conforme/non conforme). C'est le vrai différenciateur du produit : un outil de vérification de chaîne, pas juste un classificateur.
- **Stockage des photos** — vraies images sur Supabase Storage (plus de simulation).
- **Certificats officiels** — génération PDF avec QR code de vérification, réellement téléchargeables.
- **Performance** — chargement optimisé (requêtes groupées, plus de blocage du serveur pendant un scan).

## 🟡 Ce qui est ESTIMÉ (et pourquoi c'est normal)

| Métrique | Pourquoi ce n'est pas une vraie mesure |
|---|---|
| **KOR** (rendement en amande) | Nécessite un décorticage physique réel et une pesée — impossible depuis une photo du fruit entier. |
| **Humidité** | Nécessite un capteur physique (humidimètre) — aucune caméra ne mesure un taux d'humidité. |
| **Grainage** (calibre) | Nécessiterait un objet de référence physique dans le cadre pour un étalonnage fiable en mm. |

**Comment c'est calculé aujourd'hui** : à partir du grade détecté par l'IA (chaque grade a une fourchette de valeurs typiques du secteur). C'est clairement étiqueté **"(estimé)"** partout dans l'interface — jamais présenté comme une mesure de laboratoire.

## 🎯 Arguments à mettre en avant

1. **"On ne prétend pas remplacer un laboratoire — on démocratise le contrôle qualité de premier niveau, partout, instantanément, gratuitement."**
2. **Le double scan détecte la fraude/dégradation** dans la chaîne — un vrai problème identifié par le CCA (préservation de la qualité entre la collecte et l'entrepôt).
3. **Traçabilité vérifiable** — chaque certificat renvoie à un parcours complet consultable (photo, agent, coopérative, entrepôt, acheteur).
4. **Plateforme fonctionnelle réelle**, pas une maquette : vraie base de données, vrai stockage cloud, vraie IA, vrais temps de réponse mesurés.

## 🛡️ Si on te pose une question technique difficile

- **"Le KOR affiché est-il fiable ?"**
  → *"C'est une estimation basée sur le grade détecté, clairement indiquée comme telle. Le KOR réel nécessite un décorticage en laboratoire — notre objectif à ce stade est la détection rapide de la qualité visuelle et de la fraude en transport, pas le remplacement du laboratoire."*

- **"Comment mesurez-vous l'humidité sans capteur ?"**
  → *"Nous ne la mesurons pas au sens strict — c'est une estimation liée au grade, affichée comme telle. Une vraie mesure demanderait un capteur physique, une évolution matérielle possible plus tard."*

- **"Le taux de défaut est-il vraiment basé sur la photo ?"**
  → *"Oui — contrairement au KOR/humidité, c'est une vraie analyse d'image (détection de taches, hétérogénéité de couleur), pas une constante. Ça varie réellement d'un échantillon à l'autre."*

- **"Qu'est-ce qui empêche un agent de tricher sur une photo ?"**
  → *"Le double scan à l'entrepôt : si le lot a été altéré ou substitué en route, l'écart KOR détecté entre les deux scans déclenche automatiquement un verdict de non-conformité."*
