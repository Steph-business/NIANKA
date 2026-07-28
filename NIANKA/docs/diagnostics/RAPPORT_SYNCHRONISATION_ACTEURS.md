# RAPPORT DE DIAGNOSTIC — Synchronisation inter-acteurs NIANKA

**Date :** 27 juillet 2026
**Périmètre :** chaîne Agent → Coopérative → Entrepôt Central → Usineur / Exportateur
**Référentiel :** `docs/guide.md` §4 (Matrice d'interaction & traçabilité QR Code)

---

## 1. Verdict global

| Maillon | Synchronisation | Les données remontent-elles ? |
|---|---|---|
| Agent → Coopérative | ⚠️ **Partielle** | Le scan est bien écrit en base, mais **attribué au mauvais agent** et notifié à la **mauvaise coopérative** |
| Coopérative → Entrepôt | ❌ **Rompue** | Le bordereau ne référence **jamais** le scan réel de l'agent : le backend fabrique un **scan factice** (KOR 54.2 / 6.8 % en dur) |
| Entrepôt → Usineur / Exportateur | ❌ **Inexistante** | La vente scellée n'est **transmise à personne** : 0 lot, 0 notification côté acheteur |
| Institution / Ministère | ⚠️ **Statistiques fausses** | `lots_en_transit` et `lots_scelles` sont codés à `0` en dur |

**Conclusion :** la chaîne de traçabilité de bout en bout **n'est pas fonctionnelle**. Chaque acteur écrit correctement dans sa propre table, mais **les liens entre les tables ne sont jamais posés**. L'application donne l'illusion de fonctionner parce que chaque écran dispose d'un jeu de données de démonstration en dur qui masque les échecs.

---

## 2. Méthode

Deux tests d'intégration multi-acteurs ont été écrits et exécutés contre l'API réelle (FastAPI + SQLite en mémoire, 6 comptes : agent, 2 coopératives, entrepôt, usine, exportateur) en rejouant **exactement les payloads que le frontend envoie**.

Ont également été exécutés : `pytest backend/tests`, `npx tsc --noEmit` (frontend), et un test de chargement du modèle IA.

---

## 3. Maillon 1 — Agent → Coopérative

### 3.1 Le scan part sans authentification

`frontend/src/app/user/analysis/page.tsx:117` appelle `/etapes/predict-quality` avec un `fetch` brut, **sans en-tête `Authorization`**. Côté backend, `backend/modules/etapes/router.py:69` est le **seul endpoint métier sans dépendance d'authentification**.

> Résultat mesuré : `POST /etapes/predict-quality` sans token → **HTTP 200**. N'importe qui sur le réseau peut injecter des scans dans la base de production.

### 3.2 Le scan est attribué au mauvais agent

Faute de token, le backend devine le propriétaire (`router.py:96`) :

```python
agent = db.query(User).filter(User.role == "agent").first() or db.query(User).first()
```

C'est **le premier agent de la table**, pas celui qui scanne.

> **Preuve — test `test_attribution_scan_multi_agents` :**
> ```
> scanneur réel    : Fanta Diabaté (21356539-…)
> scan attribué à  : Amadou Koné   (d4ad7606-…)   ← 1er agent inscrit
> => CORRECT ? NON
> ```

### 3.3 La notification part à la mauvaise coopérative

Même logique à `router.py:147` : `db.query(User).filter(User.role == "cooperative").first()`.

> **Preuve :**
> ```
> notifications Amadou (agent 1)           : 1   ← ne l'a pas scanné
> notifications Fanta (agent 2 = scanneur) : 0   ← n'est pas prévenue
> notifications Coop Bouaké (1ère de la base) : 1   ← n'est pas concernée
> notifications Coop Korhogo (la bonne)    : 0   ← ne reçoit rien
> ```

**Cause racine :** le champ `User.cooperative_id` (`modules/authentification/models.py:21`) existe mais **n'est jamais renseigné** — ni à l'inscription (`services.py:99-114`), ni par un endpoint de rattachement. Le lien Agent↔Coopérative prévu par le guide n'existe pas en base.

### 3.4 Données perdues à l'écriture

| Donnée saisie par l'agent | Sort |
|---|---|
| GPS (`7.69° N, 5.03° W`) | ❌ **perdu** — `gps_lat`/`gps_long` restent `NULL` (la chaîne n'est jamais parsée) |
| Nom du producteur | ❌ perdu (renvoyé dans la réponse, jamais persisté) |
| Nom de la coopérative | ❌ perdu (sert seulement à composer le texte de notification) |
| Poids total / échantillon | ⚠️ stockés dans la colonne `defauts` (JSON), détournée de son usage |
| Photo | ✅ persistée (Supabase Storage, sinon data-URL base64 en fallback) |

### 3.5 Cloisonnement multi-coopératives absent

`modules/etapes/services.py:77-83` — si une coopérative n'a aucun scan à son nom, la fonction renvoie **les 50 derniers scans de toute la base**.

> **Preuve :** une coopérative B, sans aucun lien avec le scan, voit quand même le scan de la coopérative A.

C'est une fuite de données inter-coopératives.

---

## 4. Maillon 2 — Coopérative → Entrepôt

### 4.1 Le bordereau ne référence pas le scan de l'agent — **c'est la rupture centrale**

`frontend/src/app/cooperative/dashboard/page.tsx:138-142` envoie seulement `cooperative_depart`, `entrepot_destination`, `tonnage_transfert`. **`scan_initial_id` n'est jamais transmis.**

Le backend (`modules/etapes/services.py:91-105`) compense en **créant un faux scan** :

```python
if not scan_initial:
    placeholder_scan = Scan(
        image_url="https://storage.nianka.ci/scans/placeholder.jpg",
        score_kor=54.2,     # ← valeur en dur
        humidite=6.8,       # ← valeur en dur
    )
```

> **Preuve — test `test_chaine_complete` :**
> ```
> scan_initial du bordereau : image=https://storage.nianka.ci/scans/placeholder.jpg  kor=54.2
> => est-ce le VRAI scan de l'agent ? NON (placeholder)
> QR payload : {…, "kor_initial": 54.2, "humidite_initiale": 6.8}
> ```

**Conséquence :** le QR Code de traçabilité — pièce maîtresse du dispositif — transporte des données inventées. La preuve d'origine est nulle.

### 4.2 L'entrepôt de destination n'est pas enregistré

`entrepot_id` reste `NULL` : le frontend envoie un **libellé texte** (« Entrepôt Central Abidjan Port ») là où le backend attend un UUID (`TransferOrderCreate.entrepot_id`). Le champ texte est ignoré par le schéma.

> Aucun entrepôt n'est donc destinataire du bordereau, et **aucune notification n'est créée pour l'entrepôt** (mesuré : `notifications entrepot: 0`).

### 4.3 Aucun endpoint pour lister les bordereaux

L'API n'expose que `GET /etapes/transfert/{identifier}` (par numéro). Il n'existe **pas** de `GET /etapes/transferts`.

Conséquences directes :
- Le tableau « Preuves & historique d'expédition » de la coopérative est alimenté par un tableau en dur (`cooperative/dashboard/page.tsx:45-72` : `TRF-2026-084`, `TRF-2026-081`) et **disparaît au rafraîchissement de la page**.
- L'entrepôt ne peut pas voir les camions en route : il doit **taper le numéro de bordereau à la main**.

### 4.4 Le bouton « Approuver Lot » ne persiste rien de partageable

`cooperative/dashboard/page.tsx:122-129` : l'état de validation est stocké dans `localStorage` (`nianka_approved_lots`). Il est donc **invisible pour l'entrepôt et pour tous les autres postes**. Le `Lot` créé en parallèle a un poids codé en dur (`poids_tonnes: 10`) et n'est relié ni au scan, ni au bordereau.

### 4.5 Le statut des lots n'évolue jamais

`Lot.statut` est initialisé à `EN_STOCK_COOPERATIVE` (`services.py:33`) et **n'est jamais mis à jour**. Les états `EN_TRANSIT` et `VENDU` documentés dans le modèle ne sont écrits nulle part.

---

## 5. Maillon 3 — Entrepôt : réception & arbitrage

### 5.1 La comparaison côte-à-côte est un affichage en dur

`frontend/src/app/entrepot/analysis/page.tsx:280-283` :

```jsx
<div>1. SCAN INITIAL COOPÉRATIVE</div>
<div>54.2 lbs (Grade A)</div>
<div>Humidité: 6.8%</div>
```

Ces valeurs ne viennent **pas** de la base : elles sont écrites dans le JSX. L'arbitrage neutre affiché à l'écran est donc **toujours conforme**, quel que soit le lot.

Même constat pour le chauffeur/camion (`ligne 205`, en dur `CI-482-AB (Koffi B.)`) et l'agent pisteur (`ligne 209`, en dur `Agent NIANKA`), alors que ces informations **existent** dans la réponse de l'API.

### 5.2 L'API ne renvoie pas ce qu'il faut pour comparer

> **Preuve :** champs retournés par `GET /etapes/transfert/{n°}` :
> `cooperative_id, created_at, entrepot_id, grade_lot, id, immatriculation_camion, nom_chauffeur, numero_bordereau, qr_payload, scan_initial_id, statut, volume_tonnes`
>
> → **ni le KOR initial, ni l'humidité initiale, ni le nom de l'agent, ni le nom de la coopérative.** Seul `scan_initial_id` est fourni, sans endpoint pour le résoudre. Le « pré-remplissage en 1 seconde » décrit au guide §4 étape 4 est impossible en l'état.

### 5.3 Le scan d'arbitrage IA ne s'exécute jamais

`entrepot/analysis/page.tsx:93` :

```ts
await api.etapes.predictQuality(selectedImageFile || new File([], ''))
```

`predictQuality` attend un `FormData`, on lui passe un `File` → le client pose `Content-Type: application/json` → le backend répond **422**. Le `catch` bascule alors sur la valeur de démonstration `{ score_kor: 53.8, taux_humidite: 7.1 }` (`ligne 98`).

Erreur confirmée par le compilateur : `error TS2345: Argument of type 'File' is not assignable to parameter of type 'FormData'`.

De plus, le type attendu (`ScanResult`) et le type réellement renvoyé par l'API (`PredictionResult`) sont **incompatibles** (`grade_ia`/`score_kor` vs `predicted_grade`/`metrics.kor_lbs`) → `error TS2345`. Même si l'appel réussissait, l'affichage planterait sur `scanResult.score_kor.toFixed(1)`.

### 5.4 Ce qui fonctionne côté serveur

L'endpoint `POST /etapes/arbitrage` est, lui, **correct** : il crée le scan d'entrepôt, calcule `delta_kor`, applique le seuil de conformité (≤ 1.5), passe le bordereau à `ARBITRE` et notifie la coopérative.

> **Preuve :** `arbitrage: conforme=True delta_kor=0.4 kor_init=54.2 kor_entrepot=53.8` — logique juste, mais alimentée par le `kor_init` factice du §4.1.

### 5.5 Le certificat PDF n'existe pas

`services.py:204` génère une URL (`/reports/certificat_TRF-2026-91.pdf`) **sans produire de fichier**, et aucune route ne sert `/reports/`.

> **Preuve :** `le PDF existe-t-il physiquement ? False` → tous les boutons « Télécharger le certificat » renvoient un 404. La génération PDF actuelle repose entièrement sur `window.print()` côté navigateur.

---

## 6. Maillon 4 — Entrepôt → Usineur / Exportateur : **maillon absent**

C'est l'étape 5 du guide (« transmettre à l'historique acheteur »). **Elle n'est implémentée nulle part.**

- `ArbitrageLot.acheteur_id` est bien enregistré en base…
- …mais **aucun endpoint ne permet de lire les arbitrages**, ni par acheteur ni autrement.
- Les portails Usineur et Exportateur lisent `GET /etapes/lots` — une table **sans aucun lien** avec `arbitrages_lots`.
- `list_lots` (`services.py:42-46`) filtre sur `Lot.cooperative_id == current_user.id`. Pour un usineur ou un exportateur, ce filtre ne renvoie **jamais rien** (contrairement à `list_scans`, il n'a aucun repli).

> **Preuve, après une vente scellée au profit de l'usine :**
> ```
> usineur     /etapes/lots -> 0 lot(s)
> exportateur /etapes/lots -> 0 lot(s)
> entrepôt    /etapes/lots -> 0 lot(s)
> notifications usineur = 0 | exportateur = 0
> ```

**Les portails acheteurs sont structurellement vides.** Ils ne peuvent afficher que leurs valeurs de repli.

À noter également : le portail Exportateur ne compile pas correctement et le portail Usineur accumule 6 erreurs TypeScript (`score_kor`, `created_at`, `humidite` absents du type `LotData`) — signe que l'interface a été écrite pour un contrat d'API qui n'a jamais existé.

---

## 7. Points transverses

### 7.1 Le modèle IA ne se charge pas — et l'échec est masqué

`backend/modules/etapes/ai_service.py:37-38` :

```python
except Exception:
    print(f"[SUCCESS AI] Moteur d'Inférence IA NIANKA initialisé avec succès ({self.model_path.name}) !")
```

Le bloc `except` affiche un message de **succès**. Vérification directe :

```
[SUCCESS AI] Moteur d'Inférence IA NIANKA initialisé avec succès (model_anacarde.keras) !
MODEL LOADED: False
```

Le fichier `model_anacarde.keras` (12,7 Mo) est présent mais **ne se charge pas**. Toutes les prédictions passent par `_heuristic_probs` — un classement par **moyenne de couleur des pixels** (lignes 88-118). Les métriques KOR, humidité et calibre sont ensuite dérivées de tables constantes (`_compute_quality_metrics`), et l'API annonce quand même `"model_engine": "MobileNetV3_Cashew_v2"` et `"latency_ms": 14` (valeur en dur).

**Le cœur métier — l'arbitrage neutre par l'IA — n'est pas opérationnel.**

### 7.2 Statistiques faussées

`services.py:245-248` :

```python
"lots_en_transit": 0,   # en dur
"lots_scelles": 0,      # en dur
```

De plus `get_stats` **n'applique aucun filtre par utilisateur** : coopérative, entrepôt et usineur reçoivent des chiffres identiques.

> **Preuve :** `stats coopA / usineur / entrepot` → tous `tonnage=10.0 kor=53.4 transit=0 scellés=0`.

`kor_moyen` mélange par ailleurs les KOR des `lots` et ceux des `scans` dans une seule moyenne non pondérée (`services.py:232`).

### 7.3 Rapports : l'endpoint appelé n'existe pas

`frontend/src/lib/api.ts:397` appelle `POST /rapports/generate`. Le backend n'expose que `POST /rapports/` et `GET /rapports/{id}`.

> **Preuve :** `POST /rapports/generate -> HTTP 405`.

### 7.4 Notifications

| Élément | État |
|---|---|
| Écriture en base + `GET /notifications/` | ✅ fonctionne |
| Rafraîchissement | ⚠️ polling 10 s côté agent uniquement (`user/layout.tsx:52`) |
| SSE `/notifications/stream` | ❌ **jamais consommé** — aucun `EventSource` dans le frontend |
| Compteur non-lus | ❌ le frontend lit `n.est_lue`, l'API renvoie `lu` (`user/layout.tsx:35`) → **tout apparaît non-lu en permanence** |
| Page notifications Coopérative | ❌ **100 % en dur**, zéro appel API (`cooperative/notifications/page.tsx`) |
| Destinataires | ❌ entrepôt, usineur et exportateur ne reçoivent **jamais** de notification |

### 7.5 Sécurité et robustesse

| Constat | Emplacement | Gravité |
|---|---|---|
| `/etapes/predict-quality` ouvert sans authentification | `etapes/router.py:69` | 🔴 Élevée |
| Fuite inter-coopératives sur `/etapes/scans` | `etapes/services.py:80-83` | 🔴 Élevée |
| `POST /etapes/scan`, `/transfert`, `/arbitrage` acceptent **tous les rôles** (`get_current_user` seul, sans `require_roles`) — un agent peut sceller une vente | `etapes/router.py:167,186,206` | 🟠 Moyenne |
| Vérification OTP désactivée au login | `authentification/services.py:209-210` | 🟠 Moyenne |
| `CORS allow_origins` contient `"*"` avec `allow_credentials=True` | `main.py:45-58` | 🟠 Moyenne |
| Code mort après `return` (2ᵉ génération de token jamais atteinte) | `authentification/services.py:229-239` | 🟡 Faible |
| `Base.metadata.create_all()` au démarrage, sans migrations (Alembic) | `main.py:30` | 🟡 Faible |

*Les identifiants Supabase et SMTP se trouvent dans `backend/.env`, correctement exclu par `.gitignore` — vérifié, non suivi par git.*

### 7.6 Qualité de build et tests

- **Frontend :** `npx tsc --noEmit` → **13 erreurs** sur 4 pages (`entrepot/analysis`, `entrepot/history`, `usineur/dashboard`). Import inexistant `TransferData` depuis `@/lib/api`.
- **Backend :** `pytest backend/tests` → **8 succès, 5 erreurs**. Les 5 tests en échec (`test_04_traceability_lots` → `test_08`) sont précisément **ceux qui valident la chaîne inter-acteurs** : ils utilisent une fixture `token` qui n'a jamais été définie dans `conftest.py`, et référencent `client` en variable globale au lieu de la fixture. **La chaîne n'a donc jamais été testée.**
- `backend/modules/common/` duplique `backend/common/` (dependencies, security, sse) — risque de divergence.
- `frontend/` est un **sous-module git** avec des modifications non commitées ; 5 fichiers `temp_*.html` traînent à la racine.

---

## 8. Synthèse : où la donnée se perd

```
AGENT                      COOPÉRATIVE                ENTREPÔT                USINEUR/EXPORT.
  │                             │                         │                        │
  │ scan photo ────► scans ✅   │                         │                        │
  │   agent_id ✗ (1er de la base)                         │                        │
  │   gps ✗  producteur ✗       │                         │                        │
  │                             │                         │                        │
  │        notification ────────► ✗ (1ère coop de la base)│                        │
  │                             │                         │                        │
  │                             │ bordereau ──────────────►                        │
  │                             │   scan_initial ✗ FACTICE (KOR 54.2 en dur)       │
  │                             │   entrepot_id = NULL ✗  │                        │
  │                             │   pas de notification ✗ │                        │
  │                             │                         │                        │
  │                             │                         │ scan arbitrage ✗ (422) │
  │                             │                         │ comparaison ✗ (en dur) │
  │                             │                         │                        │
  │                             │ ◄──── notif arbitrage ✅ │                        │
  │                             │                         │                        │
  │                             │                         │ vente scellée ─────╳───►
  │                             │                         │   AUCUN CANAL          │
```

---

## 9. Plan de correction priorisé

### 🔴 P0 — Rétablir la chaîne (bloquant démo/production)

1. **Authentifier `/etapes/predict-quality`** — ajouter `current_user: User = Depends(get_current_user)`, utiliser `current_user.id` comme `agent_id`, et envoyer le token depuis `user/analysis/page.tsx` (passer par `api.etapes.predictQuality`, qui gère déjà l'en-tête). *→ corrige §3.1, §3.2*
2. **Poser le lien Agent↔Coopérative** — renseigner `User.cooperative_id` à l'inscription (ou via un endpoint de rattachement), puis router la notification vers `agent.cooperative_id` au lieu du premier enregistrement trouvé. *→ corrige §3.3*
3. **Transmettre `scan_initial_id` dans l'ordre de transfert** — la coopérative doit sélectionner le(s) scan(s) réellement expédié(s) ; supprimer la création du `placeholder_scan` et retourner une erreur 400 si le scan est absent. *→ corrige §4.1, le point le plus grave*
4. **Créer le maillon vers les acheteurs** — ajouter `GET /etapes/lots-certifies` (filtré sur `ArbitrageLot.acheteur_id == current_user.id`), le brancher sur les portails Usineur/Exportateur, et notifier l'acheteur au scellement. *→ corrige §6*

### 🟠 P1 — Fiabiliser l'arbitrage

5. **Enrichir `TransferOrderResponse`** avec le scan initial imbriqué (KOR, humidité, grade, photo, agent, coopérative) pour permettre le pré-remplissage. *→ corrige §5.2*
6. **Brancher la comparaison côte-à-côte sur ces données** et supprimer les valeurs en dur `54.2 / 6.8 / CI-482-AB / Agent NIANKA`. *→ corrige §5.1*
7. **Corriger l'appel du scan d'arbitrage** — construire un `FormData`, aligner le type `ScanResult` sur `PredictionResult`. *→ corrige §5.3*
8. **Diagnostiquer le chargement du modèle Keras** — retirer le `except` silencieux, laisser remonter l'erreur, exposer l'état réel du moteur dans `/health`. *→ corrige §7.1*

### 🟡 P2 — Cohérence et hygiène

9. Ajouter `GET /etapes/transferts` (liste filtrée par rôle) et brancher les tableaux coopérative/entrepôt dessus.
10. Faire évoluer `Lot.statut` (`EN_STOCK_COOPERATIVE` → `EN_TRANSIT` → `VENDU`) et le statut bordereau (`RECU`).
11. Calculer réellement `lots_en_transit` / `lots_scelles` et filtrer `get_stats` par rôle.
12. Générer physiquement le certificat PDF (ReportLab/WeasyPrint) + servir `/reports`.
13. Ajouter `POST /rapports/generate` (ou corriger `api.ts` vers `POST /rapports/`).
14. Corriger le compteur de notifications (`lu` et non `est_lue`) ; brancher la page notifications de la coopérative sur l'API ; consommer le SSE ou retirer l'endpoint.
15. Cloisonner `/etapes/scans` et `/etapes/lots` par coopérative ; appliquer `require_roles` sur `/scan`, `/transfert`, `/arbitrage`.
16. Réparer `test_full_suite.py` (fixtures `token` / `bordereau_uuid`) et y ajouter un test de bout en bout multi-acteurs.
17. Résoudre les 13 erreurs TypeScript ; restreindre `CORS`.
18. Supprimer `backend/modules/common/` (doublon) et les `frontend/temp_*.html`.

---

## 10. Ce qui fonctionne bien

Pour être juste, la base est saine sur plusieurs points :

- **Architecture modulaire** propre (`router` / `service` / `schema` / `model` par domaine) et facile à corriger.
- **Modèle de données** bien conçu : `Scan`, `BordereauTransfert`, `ArbitrageLot` couvrent correctement le métier — les colonnes de liaison existent, elles ne sont simplement pas remplies.
- **Type `GUID` portable** PostgreSQL/SQLite : élégant, permet de tester sans Supabase.
- **Logique d'arbitrage serveur** (`execute_arbitrage`) : correcte, avec seuil de tolérance KOR.
- **Authentification JWT + OTP + bcrypt** : solide, avec normalisation des alias de rôles.
- **Storage Supabase avec repli local** : robuste.
- **Compatibilité ascendante des payloads** via `model_validator(mode="before")` : bonne idée pour absorber les écarts front/back.

Le problème n'est pas la conception : ce sont **les liaisons entre étapes qui n'ont jamais été câblées**, et une couche systématique de valeurs de repli qui empêche les échecs de se manifester.

---

*Rapport produit à partir d'un audit du code (backend FastAPI + frontend Next.js) et de deux tests d'intégration multi-acteurs exécutés contre l'API réelle.*
