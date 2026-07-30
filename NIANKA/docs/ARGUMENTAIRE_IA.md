# NIANKA — Mettre l'IA en avant

> Argumentaire de présentation. Objectif : faire comprendre en trois minutes
> pourquoi l'IA est le cœur du produit — sans surpromettre, et sans se faire
> démonter sur la précision du modèle.

---

## 1. La phrase à retenir

> **« Dans la filière anacarde, la qualité n'est pas mesurée : elle est négociée.
> NIANKA la transforme en mesure. »**

C'est là toute la valeur de l'IA. Pas dans la performance du modèle — dans le
changement de nature de l'information.

---

## 2. Le problème que l'IA résout (à poser avant toute démo)

Aujourd'hui, entre le producteur et l'exportateur, la qualité d'un lot d'anacarde
est établie **à l'œil nu**, par une personne qui a un intérêt dans la transaction.

Trois conséquences directes :

| Problème | Conséquence concrète |
|---|---|
| **Jugement subjectif** | Deux acheteurs annoncent deux qualités différentes pour le même sac. Le producteur, sans contre-expertise, subit le prix. |
| **Jugement non traçable** | Une fois la transaction faite, plus aucune trace de ce qui a été constaté, ni par qui. Le litige est ininstruisable. |
| **Jugement non comparable** | Impossible de savoir si un lot s'est dégradé entre le champ et l'entrepôt — il n'existe pas de « avant » à comparer au « après ». |

**La vraie question n'est donc pas « une IA sait-elle noter une noix de cajou ? »**
**C'est : « qui arbitre, aujourd'hui, quand deux parties ne sont pas d'accord ? »**
Réponse actuelle : personne. C'est ce vide que l'IA vient occuper.

---

## 3. Ce que l'IA apporte — trois propriétés, pas une performance

C'est l'argument central. L'IA n'a pas besoin d'être parfaite pour être utile,
elle a besoin d'être **neutre, instantanée et reproductible**. Trois propriétés
qu'aucun contrôleur humain ne peut cumuler.

### ① Neutralité — l'IA n'a pas d'intérêt dans la transaction
Le modèle ne sait pas qui vend, qui achète, ni à quel prix. Il regarde une image.
C'est la première fois dans cette filière qu'un avis qualité est émis par un tiers
sans intérêt financier au résultat.

### ② Instantanéité — le contrôle devient gratuit, donc systématique
Une inférence prend quelques millisecondes sur un téléphone, au bord du champ,
sans laboratoire ni expert déplacé. Ce n'est pas « plus rapide qu'avant » :
c'est **un contrôle qui n'existait tout simplement pas** à ce point de la chaîne,
parce qu'il était économiquement impossible de le faire.

### ③ Reproductibilité — c'est elle qui rend l'arbitrage possible
Le même modèle, appliqué deux fois, applique deux fois les mêmes critères.
C'est ce qui autorise à **comparer un scan bord champ et un scan entrepôt** et à
en tirer un verdict opposable. Un humain au champ et un humain à l'entrepôt ne
sont pas comparables entre eux ; deux exécutions du même modèle, si.

> **La formule à dire :** *« On ne demande pas à l'IA d'avoir raison à la place
> de l'homme. On lui demande d'appliquer exactement le même critère aux deux
> bouts de la chaîne — et c'est précisément ce qu'un humain ne peut pas faire. »*

---

## 4. Le moment fort : le double scan

C'est **la** démonstration à faire vivre au jury. Elle transforme une simple
classification d'image en un mécanisme de confiance.

```
   Bord champ                    Transport                    Entrepôt
   ──────────                    ─────────                    ────────
   📷 Scan IA #1        →     🚚 Bordereau + QR      →       📷 Scan IA #2
   Grade, KOR, défauts        KOR d'origine gravé          Mêmes critères
   Agent authentifié          GPS + identité agent         Compte entrepôt

                            ⚖️  ARBITRAGE AUTOMATIQUE
                     Écart KOR > 1,5 lbs  →  « écart détecté »
                     Écart KOR ≤ 1,5 lbs  →  lot conforme, vente scellable
```

**Ce que ça prouve, et qu'il faut nommer à voix haute :**

- La dégradation ou la substitution en transport devient **détectable sans témoin**.
- Le verdict n'est écrit nulle part dans le code : il est **calculé sur deux mesures
  réelles lues en base**. (Le montrer : deux photos de qualités différentes → le
  verdict bascule en direct.)
- Le résultat n'est pas un avis, c'est un **document opposable** : certificat avec
  QR code, vérifiable par un tiers qui n'était présent à aucune des deux étapes.

> **La formule à dire :** *« Le lot est parti à 49 lbs de KOR et arrive à 41.
> Personne n'a besoin d'accuser qui que ce soit : le système l'a constaté tout
> seul, horodaté, et le certificat le porte. »*

---

## 5. L'effet d'échelle : du scan individuel à la donnée publique

Argument à sortir face à un jury institutionnel ou à un investisseur — il fait
passer NIANKA d'un outil de terrain à une infrastructure.

Chaque scan produit, en plus du grade, un point de donnée **géolocalisé, horodaté
et structuré**. Agrégés, ces points donnent ce que la filière n'a jamais eu :

- une **cartographie réelle de la qualité par zone de production** ;
- la **détection des zones et des périodes à risque** (dégradation récurrente sur un
  axe logistique, chute de qualité sur une coopérative) ;
- un **historique de performance par acteur**, opposable et vérifiable.

> **La formule à dire :** *« Chaque photo prise par un agent au bord d'un champ
> alimente, sans effort supplémentaire, l'observatoire national de la qualité
> anacarde. La donnée n'est pas un sous-produit du contrôle : c'est le second
> produit. »*

---

## 6. Tenir la question de la précision (53,8 %)

**Ne pas la fuir, et surtout ne pas la laisser arriver en fin de présentation.**
Le meilleur traitement est de la poser soi-même, tôt, et de la recadrer.

**Ce qu'il faut dire, dans cet ordre :**

1. **Le chiffre, sans détour.** *« Le modèle est à 53,8 % d'exactitude sur 4 classes,
   mesuré en validation croisée 5-fold sur 68 photos. Le hasard, c'est 25 %. C'est
   un prototype, pas un modèle de production, et je le présente comme tel. »*

2. **Pourquoi c'est bas — et pourquoi c'est réparable.** *« Ce n'est pas un problème
   d'architecture, c'est un problème de volume : 68 images, dont 9 seulement pour la
   classe "Rejeté". La chaîne technique est validée de bout en bout ; ce qui manque
   est un jeu de données, pas une invention. »*

3. **Le recadrage — l'argument décisif.** *« Et surtout : le mécanisme d'arbitrage ne
   dépend pas de cette exactitude. Il repose sur la reproductibilité — le fait que le
   même modèle applique le même critère au champ et à l'entrepôt. Un écart entre les
   deux scans reste un signal valide même si le grade absolu est imparfait. La valeur
   du produit tient sur la cohérence, pas sur la note. »*

4. **La transparence comme preuve de sérieux.** *« Nous n'avons masqué aucun de ces
   chiffres : `GET /health` expose en permanence l'état réel du moteur, et tout ce qui
   est estimé est étiqueté "(estimé)" dans l'interface. »*

**Ce qu'il ne faut pas faire :** arrondir vers le haut, parler d'« environ 80 % » sur
un autre protocole, ou noyer la question dans du vocabulaire technique. Un jury qui
sent l'esquive creusera ; un jury à qui on donne le chiffre brut passe à la suite.

---

## 7. La frontière honnête : ce que l'IA fait, ce qu'elle ne fait pas

Ce tableau est un **atout de crédibilité**, pas un aveu de faiblesse. Le montrer
spontanément désamorce la moitié des questions pièges.

| Mesure | Statut | Pourquoi |
|---|---|---|
| **Grade (A/B/C/Rejeté)** | 🟢 Inférence réelle | MobileNetV3, 224×224, sortie du modèle entraîné. |
| **Taux de défaut** | 🟢 Analyse d'image réelle | Détection de taches sombres et d'hétérogénéité de couleur sur l'échantillon isolé du fond. Varie réellement d'une photo à l'autre. |
| **KOR (rendement amande)** | 🟡 Estimé depuis le grade | Exige un décorticage physique et une pesée. Aucune photo du fruit entier ne peut le mesurer. |
| **Humidité** | 🟡 Estimé depuis le grade | Exige un humidimètre. Aucune caméra ne mesure un taux d'humidité. |
| **Grainage (calibre)** | 🟡 Estimé depuis le grade | Exigerait un objet de référence dans le cadre. Testé, écarté : quand l'échantillon remplit le cadre — ce qui est la consigne de prise de vue — l'estimation sature. |

> **La formule à dire :** *« Nous ne prétendons pas remplacer un laboratoire. Nous
> démocratisons le contrôle de premier niveau : partout, instantanément, à coût nul.
> Et nous disons exactement où s'arrête ce que la photo peut prouver. »*

---

## 8. Structure de prise de parole (3 minutes)

| Temps | Contenu | Message porté |
|---|---|---|
| **0:00 – 0:30** | Le problème : la qualité est négociée, pas mesurée. Personne n'arbitre. | Il y a un vide. |
| **0:30 – 1:00** | L'IA comme tiers neutre : neutre, instantanée, reproductible. | L'IA occupe ce vide. |
| **1:00 – 2:00** | **Démo du double scan** : deux photos, comparaison côte-à-côte, verdict qui bascule. | Ce n'est pas une promesse, c'est à l'écran. |
| **2:00 – 2:30** | Le certificat QR : la sortie opposable, vérifiable par un tiers. | Ça produit une preuve, pas un avis. |
| **2:30 – 3:00** | L'échelle : observatoire national de la qualité. Puis la précision, annoncée franchement. | Ça change d'échelle, et c'est honnête. |

**Règle d'or de la démo :** ne jamais ouvrir sur l'architecture du modèle. Ouvrir sur
le producteur qui se fait imposer un prix. La technique ne convainc qu'après que
l'enjeu a été rendu tangible — et elle se garde en réserve pour les questions.

---

## 9. Réserve technique (à ne sortir que si on la demande)

- **Modèle** : `model_anacarde.keras`, MobileNetV3-Large, socle ImageNet + fine-tuning
  partiel, tête dense, entrée 224×224×3, 4 classes.
- **Entraînement** : pondération des classes pour compenser le déséquilibre
  (29/17/13/9 images selon le grade).
- **Exécution** : inférence locale sur le serveur, modèle réchauffé au démarrage pour
  que le premier scan soit déjà rapide ; verrou d'inférence pour les scans concurrents.
- **Transparence d'état** : `GET /health` renvoie `model_loaded`, `engine`, `mode` —
  si le vrai modèle n'est pas chargé, le système le dit au lieu de le masquer, et
  bascule explicitement en mode heuristique annoncé.
- **Trajectoire mobile** : conversion TensorFlow Lite pour une exécution embarquée
  hors connexion, au bord du champ.
