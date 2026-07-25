# 🌿 NIANKA - Plateforme Nationale de Traçabilité et de Qualification IA de l'Anacarde

NIANKA est une solution globale de traçabilité numérique, certification de qualité par Intelligence Artificielle (Deep Learning MobileNetV3) et arbitrage neutre de la filière Anacarde (Noix de Cajou) en Côte d'Ivoire et Afrique de l'Ouest.

---

## 🏛️ Chaîne de Valeur & Architecture Multi-Acteurs (5 Rôles)

La plateforme interconnecte en temps réel l'ensemble des acteurs de la chaîne de valeur du champ au port d'exportation :

```
[ 1. AGENT TERRAIN ]
      │ (Collecte terrain, Géolocalisation GPS & Scan IA d'échantillons)
      ▼
[ 2. COOPÉRATIVE ]
      │ (Validation des lots + Émission du Bordereau de Transfert QR Code)
      ▼
[ 3. ENTREPÔT CENTRAL ]
      │ (Scan Réception QR + Arbitrage Neutre Certifié IA + Certificat de Vente)
      ├─────────────────────────────────┐
      ▼                                 ▼
[ 4. USINEUR / TRANSFORMATEUR ]   [ 5. EXPORTATEUR & INSTITUTION ]
  (Approvisionnement des usines     (Achat pour l'exportation Port Abidjan/San Pedro
   de décorticage locales)           & Supervision nationale du Conseil Coton Anacarde)
```

---

## 🤖 Moteur IA & Classification de la Qualité (MobileNetV3 & Multi-Spectral)

Le moteur de qualification repose sur un modèle de Deep Learning pré-entraîné par Transfer Learning :
📁 **`backend/modele_ia/model_anacarde.keras`**

### 1. Classification & Critères Qualité
* ⚪ **`Grade A`** : Qualité Supérieure / Premium (KOR ~49–54.5 lbs, Défauts < 2%, Humidité < 8.5%)
* 🟤 **`Grade B`** : Qualité Standard (KOR ~45–48.5 lbs, Défauts 3–5%, Humidité ~9.8%)
* 🔴 **`Grade C`** : Qualité Second Choix / Pommes d'Anacarde Brutes (KOR ~40–44 lbs, Défauts 8–12%, Humidité ~11.5%)
* ⬛ **`Rejeté`** : Non Conforme / Défectueux / Moisi (Taux de défauts > 25%, KOR < 35 lbs)

### 2. Analyseur Multi-Spectral & Segmentation Visuelle
En complément du modèle Keras, un extracteur de caractéristiques visuelles basé sur la répartition chromatique RVB, la variance de texture et la détection de taches sombres garantit des prédictions dynamiques adaptées à chaque photo d'échantillon téléversée.

---

## ⚡ Backend FastAPI & Base de Données Supabase PostgreSQL

Le backend est développé en **Python / FastAPI** sur le port **8081** (`http://localhost:8081/api/v1`).

### Endpoints Principaux :
* 🔐 **Authentification** : `POST /api/v1/auth/login` & `POST /api/v1/auth/register`
  * Connexion par **Numéro de Téléphone** et Mot de passe.
  * Validation automatique immédiate sans blocage OTP/SMS.
* 🧠 **Diagnostic IA** : `POST /api/v1/etapes/predict-quality`
  * Reçoit la photo d'échantillon, le nom du producteur, la coopérative, le poids et la géolocalisation.
  * Enregistre **automatiquement le scan dans la table `scans`** de Supabase PostgreSQL.
* 📊 **Traçabilité & Stats** :
  * `GET /api/v1/etapes/scans` : Historique des scans enregistrés.
  * `GET /api/v1/etapes/lots` : Lots de noix de cajou enregistrés.
  * `GET /api/v1/etapes/stats` : Statistiques consolidées nationales (tonnage total, KOR moyen, % premium, lots en transit).
* 🚚 **Bordereaux de Transfert** : `POST /api/v1/etapes/transfert` & `GET /api/v1/etapes/transfert/{identifier}`
  * Émission de bordereaux numériques avec QR Code pour le transport coopérative $\rightarrow$ entrepôt.
* ⚖️ **Arbitrage Neutre** : `POST /api/v1/etapes/arbitrage`
  * Scellé officiel de vente avec certificat PDF numérique.

---

## 🖥️ Frontend Next.js & UX Dynamic Live-Data

Le frontend est construit en **Next.js (App Router) / React / TypeScript**.

### Points Clés Frontend :
1. **0 Donnée Fictive** : Toutes les tables, cartes KPI et tableaux de bord consomment les données en direct depuis l'API FastAPI et Supabase.
2. **Géolocalisation GPS HTML5** : Intégration de `navigator.geolocation` avec bouton d'actualisation en direct.
3. **Persistance Image Base64** : Conversion automatique `FileReader.readAsDataURL` pour garantir un affichage 100% fiable des clichés d'analyse.
4. **Indicateur de Chargement Sans Flash** : Animation spinner pendant les requêtes API pour éviter les faux états vides.

---

## 💻 Démarrage Rapide

### 1. Démarrer le Backend FastAPI
```bash
# Dans le dossier racine du projet
python backend/main.py
```
* **URL API** : `http://localhost:8081/api/v1`
* **Swagger UI / Docs OpenAPI** : [http://localhost:8081/docs](http://localhost:8081/docs)

### 2. Démarrer le Frontend Next.js
```bash
cd frontend
npm run dev
```
* **URL Application Web** : [http://localhost:3000](http://localhost:3000)

### 3. Compte de Test Démo
* **Numéro de téléphone** : `0153646448`
* **Mot de passe** : `123456`
* **Rôle** : `Agent de Terrain` (redirection automatique vers `/user/analysis`)
