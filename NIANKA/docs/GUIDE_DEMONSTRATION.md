# NIANKA — Guide de démonstration

> Document opérationnel pour la présentation. Tout ce qui suit a été vérifié
> de bout en bout contre la base Supabase réelle.

---

## 1. Démarrer la plateforme

**Important : le backend doit tourner sur Python 3.13** (l'environnement `.venv313`),
sinon TensorFlow n'est pas disponible et l'IA bascule en mode heuristique.

Terminal 1 — backend :

```bash
cd /e/NIANKA && ./.venv313/Scripts/python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8081
```

Terminal 2 — frontend :

```bash
cd /e/NIANKA/frontend && npm run dev
```

### Vérification avant de monter sur scène

```bash
curl -s http://127.0.0.1:8081/health
```

Le bloc `ia` **doit** afficher :

```json
"model_loaded": true, "engine": "MobileNetV3_Cashew_v2", "mode": "keras"
```

Si `model_loaded` est `false`, c'est que le backend a été lancé avec le mauvais
interpréteur Python — relancez avec `./.venv313/Scripts/python.exe`.

---

## 2. Comptes de démonstration

Mot de passe commun : **`Nianka2026`**
Connexion par **numéro de téléphone uniquement — aucun code OTP**.

| Rôle | Téléphone | Nom affiché | Écran d'arrivée |
|---|---|---|---|
| Agent pisteur | `+2250700000102` | Sarah Koné (Pisteur) | `/user/analysis` |
| Coopérative | `+2250700000101` | Coopérative ANADER Bouaké | `/cooperative/dashboard` |
| Entrepôt central | `+2250700000103` | Entrepôt Central Abidjan Port | `/entrepot/dashboard` |
| Usinier | `+2250700000104` | Usine Cajou Industries SA | `/usineur/dashboard` |
| Exportateur | `+2250700000105` | Export Ivoire International | `/exportateur/dashboard` |
| Institution | `+2250700000106` | Ministère de l'Agriculture | `/institution/dashboard` |

Le numéro est reconnu sous plusieurs formes : `+2250700000102`, `0700000102`
ou `225 07 00 00 01 02` mènent au même compte.

Pour recréer ces comptes (script idempotent, ne supprime rien) :

```bash
cd /e/NIANKA && ./.venv313/Scripts/python.exe -m backend.seed_demo
```

---

## 3. Scénario de démonstration (≈ 6 minutes)

Ouvrez de préférence **cinq onglets**, un par rôle, connectés d'avance.

### Acte 1 — L'agent scanne au bord champ *(onglet Agent)*

1. `/user/analysis` → renseigner producteur, coopérative, poids total et poids d'échantillon.
2. Le GPS se remplit automatiquement (autorisez la géolocalisation du navigateur).
3. **Importer une vraie photo de noix de cajou** puis « Lancer l'Analyse ».
4. Résultat : grade, KOR, humidité, taux de défauts.

> **À dire :** l'inférence tourne sur le modèle MobileNetV3 embarqué, en local,
> en quelques millisecondes. Le scan est signé par l'agent authentifié — il ne
> peut pas être attribué à quelqu'un d'autre.

### Acte 2 — La coopérative reçoit en temps réel *(onglet Coopérative)*

5. `/cooperative/dashboard` → le lot apparaît dans « Analyses terrain en direct »
   avec l'agent, le GPS, le KOR et l'humidité.
6. La cloche de notification et `/cooperative/notifications` affichent l'alerte.
7. Cliquer **« Approuver Lot »**.

> **À dire :** seule cette coopérative voit ce scan. Une coopérative concurrente
> connectée au même moment ne verrait rien — le cloisonnement est appliqué côté serveur.

### Acte 3 — Expédition et QR Code *(onglet Coopérative)*

8. **« Expédier vers un Entrepôt »** → cocher le lot terrain, choisir l'entrepôt,
   saisir tonnage / camion / chauffeur → « Générer le bordereau ».
9. Le bordereau `TRF-2026-XX` s'affiche dans l'historique.

> **À dire :** le bordereau référence le **scan réel** de l'agent. Le QR Code
> embarque le KOR d'origine, le GPS de collecte et l'identité de l'agent.

### Acte 4 — Arbitrage neutre *(onglet Entrepôt)* — **le moment fort**

10. `/entrepot/dashboard` → le camion apparaît dans les arrivages (notification reçue).
11. « Réceptionner & arbitrer » → le bordereau se **pré-remplit tout seul** :
    coopérative, agent, camion, chauffeur, KOR bord champ.
12. Importer la photo d'échantillon au déchargement → « Lancer le scan d'arbitrage ».
13. La **comparaison côte-à-côte** s'affiche, et le verdict est calculé sur les
    deux mesures réelles (tolérance 1,5 lbs de KOR).
14. Choisir l'acheteur → **« Sceller la vente »**.

> **À dire :** les deux chiffres comparés sortent de la base, pas de l'écran.
> Si les noix s'étaient dégradées pendant le transport, le verdict basculerait
> automatiquement en « écart détecté ». C'est ça, l'arbitre neutre.

### Acte 5 — L'acheteur reçoit le lot *(onglet Usinier)*

15. `/usineur/dashboard` → le lot certifié est là, avec KOR bord champ **et** KOR arbitré,
    la coopérative d'origine et l'agent.
16. « Fiche & Certificat » puis **« Certificat officiel »** → le document s'ouvre,
    gravé d'un **QR Code réel**, prêt à imprimer ou enregistrer en PDF (Ctrl+P).

> **À dire :** de la plantation au conteneur, chaque maillon est tracé et le
> certificat est vérifiable par un tiers via son QR Code.

---

## 4. Questions probables du jury

**« L'IA est-elle vraiment entraînée ? »**
Oui : `model_anacarde.keras`, MobileNetV3-Large (socle ImageNet gelé + tête
dense fine-tunée), entrée 224×224×3, 4 classes (Grade A / B / C / Rejeté).
`GET /health` expose l'état réel du moteur en permanence.

**« Quelle est la précision réelle du modèle ? »**
Soyez honnête si la question vient : le modèle a été entraîné sur un premier
jeu de **68 photos** (29/17/13/9 selon le grade) — un prototype de démonstration,
pas un modèle de production. Mesurée honnêtement par validation croisée 5-fold
(donc sur des images que le modèle n'a jamais vues pendant chaque pli), l'exactitude
est de **53,8 %** sur 4 classes (25 % = hasard pur). C'est un point de départ
qui valide la chaîne technique de bout en bout ; la marge de progression la
plus évidente est d'élargir le jeu de données avant la mise en production —
la coopérative Grade B et le Rejeté restent les classes les plus difficiles
à distinguer avec si peu d'exemples (9 photos seulement pour Rejeté).

**« Que se passe-t-il si le lot s'est dégradé pendant le transport ? »**
L'écart de KOR est calculé automatiquement. Au-delà de 1,5 lbs, le verdict passe
en « écart détecté » et le certificat porte la mention correspondante. Vous pouvez
le montrer en direct en scannant deux photos de qualités différentes.

**« Un acteur peut-il tricher ? »**
Non : le scan est rattaché à l'agent authentifié ; seul un compte « entrepôt »
peut arbitrer ; un bordereau ne peut être arbitré qu'une seule fois (409 sinon) ;
et chaque coopérative ne voit que ses propres données.

**« Et hors connexion, sur le terrain ? »**
Le modèle est convertible en TensorFlow Lite pour une exécution embarquée offline —
c'est la trajectoire mobile décrite dans le cahier des charges.

---

## 5. Points de vigilance

| Point | Détail |
|---|---|
| **Interpréteur Python** | Lancer le backend avec `.venv313`, sinon pas de vrai modèle. |
| **Photos de test** | Utilisez de préférence de **vraies photos de noix** — le modèle a été entraîné sur des échantillons réels, pas sur des aplats de couleur unie. |
| **Anciens comptes de test** | La base contient encore ~18 comptes « Agent Test Qualité… » enregistrés comme coopératives. Ils apparaissent dans la liste de rattachement à l'inscription. Ne créez pas de compte agent devant le jury, ou choisissez explicitement « Coopérative ANADER Bouaké ». |
| **Géolocalisation** | Le navigateur demande l'autorisation GPS. Acceptez avant la démo pour éviter la pop-up en direct. |
| **Encodage d'anciens noms** | Quelques enregistrements anciens affichent « Entrepôt » sous forme `EntrepÃ´t` (double encodage historique). Les comptes de démo sont sains. |

---

## 6. Ce qui a été corrigé

| Avant | Après |
|---|---|
| Scan attribué au premier agent de la base | Rattaché à l'agent authentifié |
| Notification envoyée à la première coopérative trouvée | Envoyée à la coopérative de rattachement |
| Bordereau porteur d'un scan **fabriqué** (KOR 54.2 en dur) | Bordereau adossé au **scan réel** de l'agent |
| Comparaison d'arbitrage écrite dans le code | Calculée sur les deux mesures en base |
| Scan d'arbitrage jamais exécuté (erreur 422 silencieuse) | Inférence réelle, erreurs affichées |
| Acheteurs : 0 lot, aucun canal de transmission | `GET /etapes/lots-certifies` + notification |
| Certificat PDF → 404 | Certificat HTML imprimable avec QR Code réel |
| Endpoint d'analyse ouvert sans authentification | Authentification obligatoire |
| Scans visibles par toutes les coopératives | Cloisonnement par coopérative |
| `lots_en_transit` / `lots_scelles` codés à 0 | Calculés réellement, par rôle |
| Modèle Keras non chargé, échec masqué par un log « SUCCESS » | Modèle chargé ; état réel exposé par `/health` |
| 13 erreurs TypeScript, 5 tests cassés | Build propre, 25 tests au vert |
| Pages *Suivi des lots*, *Historique*, *Rapports* : données de démonstration en dur | Branchées sur l'API, états vides honnêtes |
| « Générer un rapport » : ajout local, perdu au rafraîchissement | Rapport persisté en base (`POST /rapports/generate`) |
| Table `rapports` inaccessible (colonne `utilisateur_id` inexistante) | Attribut mappé sur la colonne réelle `superviseur_id` |
| Certificats appelant un service QR externe (api.qrserver.com) | Aucune dépendance réseau externe |
| Connexion usinier renvoyant vers le portail coopérative | Redirection corrigée pour tous les rôles |
| Tableau de bord institution : agents, tendances, carte, alertes en dur | Branché sur les vraies collectes, GPS et performances d'agents |
| **IA prédisait systématiquement « Rejeté », quelle que soit l'image** (double normalisation : l'image était divisée par 255 avant d'entrer dans une couche `Rescaling` qui le refait déjà) | Prétraitement corrigé — le modèle reçoit les pixels bruts qu'il attend |
| **Une fois corrigé : le modèle plafonnait à 29 % d'exactitude sur ses propres 68 images d'entraînement** (pire qu'un tirage au hasard sur 4 classes, 60 % des prédictions tombaient sur « Grade B ») | Ré-entraîné avec fine-tuning partiel du socle + pondération des classes : **53,8 % en validation croisée 5-fold** (contre 29,4 % avant, mesuré sur le même protocole) |
