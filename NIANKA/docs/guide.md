# CONTEXTE TECHNIQUE & ARCHITECTURE MÉTIER : NIANKA

## 1. Vue d'ensemble et Contraintes Actuelles
* **Nom du projet :** NIANKA.
* **Pivot technique actuel :** L'interface initiale est développée en application Web (PWA responsive) pour une exécution fluide et rapide sur le terrain et en laboratoire.
* **Rôles utilisateurs :**
  1. **Agent de terrain (Pisteur) :** Scan bord champ chez le paysan.
  2. **Coopérative :** Consolidation locale, tri des lots par grade et suivi des agents.
  3. **Entrepôt Central :** Point de rencontre physique, pesage, déchargement et scan d'arbitrage neutre par l'IA NIANKA pour sceller la vente officielle.
  4. **Usineur & Exportateur :** Consultation des dashboards, statistiques KOR et rapports d'exportation certifiés.
  5. **Institution & Régulateur :** Observatoire national de la production et de la transformation.

---

## 2. Réalité du Terrain & Réglementation de la Filière Anacarde en Côte d'Ivoire

### A. Cadre Légal : Interdiction d'Achat « Bord Champ » pour les Industriels
En Côte d'Ivoire, la réglementation interdit aux usiniers et aux exportateurs d'acheter les noix de cajou directement dans les plantations chez les paysans. Ils ont l'obligation légale de s'approvisionner exclusivement auprès des coopératives agréées ou dans les entrepôts centraux / magasins généraux portuaires.

### B. Le Flux Opérationnel en 5 Étapes

1. **Collecte au Niveau Local (Bord Champ)** :
   * L'agent (pisteur) se déplace de plantation en plantation chez les paysans.
   * Il utilise l'application **NIANKA (Scan Caméra)** pour faire une analyse immédiate sur échantillon (500g) afin de valider la qualité du sac avant d'acheter au paysan.
2. **Regroupement et Tri en Coopérative** :
   * La coopérative centralise les récoltes apportées par ses pisteurs.
   * L'interface de la coopérative permet de trier les stocks (ex: séparer le Grade A Premium du Grade C) pour éviter les mélanges.
3. **Transport vers l'Entrepôt Central (Le Point de Rencontre)** :
   * La coopérative expédie ses sacs vers les grands entrepôts (magasins intérieurs ou portuaires d'Abidjan et San Pédro).
   * L'entrepôt est une infrastructure logistique agréée par l'État qui ne possède pas la marchandise, mais héberge la transaction officielle.
4. **La Transaction Officielle & L'Arbitrage par l'IA NIANKA** :
   * C'est dans l'entrepôt que l'Usineur ou l'Exportateur vient officiellement acheter le lot à la Coopérative.
   * Au déchargement et au pesage, les noix ayant pu subitement s'altérer pendant le transport (humidité, moisissure), un **Scan de Validation Officielle par l'IA NIANKA** est réalisé sur le plateau de déchargement.
   * **L'IA NIANKA sert d'arbitre neutre** incontestable pour valider le taux KOR final et certifier le contrat de vente entre la coopérative et l'acheteur.
5. **Sortie Finale (Usinage ou Exportation)** :
   * Une fois la vente actée sur la plateforme, les noix sont acheminées vers les usines de décorticage ou empaquetées dans des conteneurs d'exportation avec leur **Certificat de Qualité PDF gravé par un QR Code**.

---

## 3. Découpage Frontend des Interfaces (2 Composants Majeurs)

Le développement Frontend est structuré autour de 2 briques d'expérience utilisateur :

1. **Composant "Caméra / Scan d'Analyse" (Interface de Capture)** :
   * **Utilisateurs :** Agent de terrain & Entrepôt Central (Scan de Réception & Arbitrage).
   * **UI :** Bouton "Nouvelle Analyse", accès flux caméra WebRTC, bouding boxes en temps réel, télémétrie (KOR, Humidité, Défauts) et génération du certificat de transaction.

2. **Composant "Dashboard / Consultation & Analytics" (Interface de Gestion)** :
   * **Utilisateurs :** Coopérative, Entrepôt Central, Usineur, Exportateur & Ministère.
   * **UI :** Graphiques de tendances KOR, cartes GPS des stocks, filtres par grade, historique des bordereaux et téléchargement des rapports PDF certifiés.

---

## 4. Matrice d'Interaction Inter-Acteurs & Traçabilité par QR Code

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  AGENT TERRAIN  │ ────► │   COOPÉRATIVE   │ ────► │  TRANSPORTEUR   │ ────► │ENTREPÔT CENTRAL │ ────► │USINEUR/EXPORTAT.│
│ (Scan Plantation)│       │ (Tri & Transfert)│       │ (Camion + QR)   │       │(Arbitrage IA)   │       │ (Achat & Export)│
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```

### A. Flux de Traçabilité Pas-à-Pas

1. **Étape 1 — Prélèvement Agent (`/user/analysis`)** :
   * **Action :** Scan photo 500g sur le terrain chez le paysan.
   * **Données enregistrées :** Photo, Grade IA (ex: Grade A), Score KOR initial (ex: 54.2 lbs), Humidité (ex: 6.8%), Geolocation GPS (`7.6938° N, 5.0303° W`).

2. **Étape 2 — Ordre de Transfert Coopérative (`/cooperative/dashboard`)** :
   * **Action :** La coopérative consolide les sacs et clique sur **"Expédier vers un Entrepôt"**.
   * **Génération de Preuve :** Le système émet un **Bordereau Numérique de Livraison (#TRF-2024-XX)** associé à un **QR Code de Traçabilité**.
   * **Contenu du QR Code :** `Lot_ID`, `Coopérative_Origine`, `Immatriculation_Camion`, `Nom_Chauffeur`, `Volume_Tonnes`, `Scan_Initial_Agent`.

3. **Étape 3 — Simulation Transporteur / Logistique (Lien Camion)** :
   * Pour des raisons d'efficacité et d'ergonomie (sans alourdir l'application avec un écran chauffeur dédié), la logistique du transporteur est encapsulée directement dans le **Bordereau de Livraison QR Code** (*Plaque Camion: CI-482-AB, Chauffeur: Koffi B.*).
   * Le statut passe automatiquement à **"EN TRANSIT"** avec géolocalisation théorique.

4. **Étape 4 — Réception & Scan d'Arbitrage avec Comparaison Côte-à-Côte (`/entrepot/analysis`)** :
   * **Action 1 :** L'inspecteur d'entrepôt saisit le N° de Bordereau (ex: `TRF-2024-08`) ou clique sur **"Scanner QR Code Camion"**.
   * **Pré-remplissage :** Toutes les données historiques de collecte sont extraites en 1 seconde (Origine, Chauffeur, Scan & KOR initial de l'agent).
   * **Action 2 :** L'inspecteur réalise le **Scan IA de Déchargement** (Upload photo échantillon 500g au déchargement).
   * **Comparaison Côte-à-Côte & Arbitrage IA :** L'interface affiche la comparaison directe :
     - *Scan Initial Coopérative :* KOR 54.2 lbs (Grade A) - Humidité 6.8%
     - *Scan Arbitrage Entrepôt :* KOR 54.2 lbs (Grade A Premium) - Humidité 6.8%
   * **Verdict Neutre Certifié :** L'IA certifie qu'aucune dégradation ne s'est produite durant le transport, fournissant **la preuve d'achat incontestable**.

5. **Étape 5 — Scellement de la Vente & Historique Usineur / Exportateur (`/usineur/dashboard`, `/exportateur/dashboard`)** :
   * Une fois le verdict validé, l'inspecteur clique sur **"Sceller la Vente & Transmettre à l'Historique Acheteur"**.
   * Le lot certifié est automatiquement transféré sur le portail de l'acheteur sélectionné :
     - **Usineur :** Reçoit la fiche de décorticage avec garantie de rendement amande (&gt; 28%).
     - **Exportateur :** Reçoit le lot certifié conforme pour l'exportation et génère le **Certificat PDF Phytosanitaire EU/US** avec QR Code.

---

## 5. Stack Technique & Architecture (Python, Supabase, Next.js)

* **IA Inference (Web App Presente) :** Micro-service Backend Python 3.11 / FastAPI avec modèle MobileNetV3-Small (TensorFlow/Keras).
* **IA Inference (Mobile Future) :** Modèle converti en TensorFlow Lite (TFLite) pour exécution mobile offline embarquée.
* **Backend & Database :** Supabase PostgreSQL, Supabase Auth & Storage.
* **Frontend Web App :** Next.js 14 (App Router), Tailwind & Custom CSS NIANKA, Lucide Icons.

---

## 6. Structure des Tables Supabase (PostgreSQL - Schema Officiel)

```sql
-- 1. Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Table : profiles (Liée à auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('agent', 'cooperative', 'usine', 'entrepot', 'exportateur')) NOT NULL,
  cooperative_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Rattachement direct Agent -> Coopérative
  nom_entite TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table : scans (Historique des analyses IA)
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  grade_ia TEXT CHECK (grade_ia IN ('A', 'B', 'C', 'Rejeté')) NOT NULL,
  score_confiance DECIMAL NOT NULL,
  grade_expert TEXT CHECK (grade_expert IN ('A', 'B', 'C', 'Rejeté')),
  date_scan TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Table : rapports (Historique des documents PDF)
CREATE TABLE rapports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  utilisateur_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  titre TEXT NOT NULL,
  periode_debut TIMESTAMP WITH TIME ZONE NOT NULL,
  periode_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  fichier_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Table : notifications (Système d'alertes)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```