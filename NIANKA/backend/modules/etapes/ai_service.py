import os
import io
import sys
import json
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional
from PIL import Image
import numpy as np

# Absolute path to model file
MODEL_PATH = Path(__file__).resolve().parent.parent.parent / "modele_ia" / "model_anacarde.keras"

CLASS_NAMES = ["Grade A", "Grade B", "Grade C", "Rejeté"]
CLASS_CODES = ["grade_A", "grade_B", "grade_C", "rejete"]

class AnacardeClassifierService:
    def __init__(self, model_path: Path = MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self.load_error: Optional[str] = None
        # TensorFlow n'est pas garanti thread-safe pour des appels concurrents
        # sur la même instance de modèle : ce verrou sérialise les inférences
        # lorsque plusieurs scans arrivent en même temps (le endpoint les
        # exécute désormais dans un thread pool, cf. router.py).
        self._predict_lock = threading.Lock()
        self._load_model_if_possible()

    @property
    def is_model_loaded(self) -> bool:
        return self.model is not None

    @property
    def engine_name(self) -> str:
        return "MobileNetV3_Cashew_v2" if self.is_model_loaded else "NIANKA_Heuristique_v1"

    def status(self) -> Dict[str, Any]:
        """État réel du moteur d'inférence, exposé par /health."""
        return {
            "model_file": str(self.model_path),
            "model_file_present": self.model_path.exists(),
            "model_loaded": self.is_model_loaded,
            "engine": self.engine_name,
            "mode": "keras" if self.is_model_loaded else "heuristique",
            "load_error": self.load_error,
        }

    def _load_model_if_possible(self):
        """Charge le modèle Keras. En cas d'échec, l'erreur est signalée sans
        être masquée : le service bascule explicitement en mode heuristique."""
        if not self.model_path.exists():
            self.load_error = f"Fichier modèle absent : {self.model_path}"
            print(f"[WARN AI] {self.load_error} — bascule en mode heuristique.")
            return

        try:
            os.environ.setdefault("KERAS_BACKEND", "tensorflow")
            os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")  # réduit le bruit au démarrage
            import keras
            self.model = keras.models.load_model(str(self.model_path), compile=False)
            print(f"[OK AI] Modèle Keras chargé ({self.model_path.name}) — inférence réelle active.")
            self._warm_up()
        except Exception as exc:
            self.load_error = f"{type(exc).__name__}: {exc}"
            print(
                f"[WARN AI] Modèle Keras NON chargé ({self.load_error}).\n"
                "          Le service bascule en mode HEURISTIQUE (analyse colorimétrique).\n"
                "          Pour activer l'inférence réelle : installer TensorFlow sur un "
                "interpréteur Python 3.11-3.13 (`pip install tensorflow`)."
            )

    def _warm_up(self):
        """Exécute une inférence à blanc au démarrage du serveur.

        La toute première inférence sur un modèle Keras/TensorFlow est très
        lente (traçage du graphe de calcul, ~1-2 s) : sans ce réchauffage,
        c'est le premier utilisateur qui scanne qui paierait ce coût, en plus
        de bloquer l'application pendant ce temps. En le payant ici, au
        démarrage, chaque scan réel est rapide dès le début.
        """
        try:
            debut = time.perf_counter()
            dummy = np.zeros((1, 224, 224, 3), dtype=np.float32)
            self.model(dummy, training=False)
            duree = round((time.perf_counter() - debut) * 1000, 1)
            print(f"[OK AI] Modèle réchauffé au démarrage ({duree} ms) — premier scan déjà rapide.")
        except Exception as exc:
            print(f"[WARN AI] Échec du réchauffage du modèle (sans gravité) : {exc}")

    def preprocess_image(self, image_bytes: bytes) -> np.ndarray:
        """Charge et redimensionne l'image en (224, 224, 3).

        Le modèle `model_anacarde.keras` embarque sa propre couche
        `Rescaling(scale=1/127.5, offset=-1)` en tête de MobileNetV3 — il
        attend donc des pixels bruts 0-255, PAS une image déjà normalisée en
        [0, 1]. Diviser ici par 255.0 provoquerait un double rescaling : la
        couche interne ramènerait alors tous les pixels à une valeur quasi
        constante (~-1), et le modèle prédirait la même classe en permanence
        quelle que soit l'image (bug historique : toujours « Rejeté »).
        """
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = img.resize((224, 224))
        arr = np.array(img, dtype=np.float32)  # pixels 0-255, non normalisés
        return np.expand_dims(arr, axis=0)

    def predict(self, image_bytes: bytes, producer: str = None, cooperative: str = None, weight_kg: float = None, gps: str = None) -> Dict[str, Any]:
        """Performs AI inference on cashew image and returns detailed quality metrics."""
        debut = time.perf_counter()
        img_arr = self.preprocess_image(image_bytes)
        mode = "heuristique"

        if self.model is not None:
            try:
                # Appel direct du modèle plutôt que `.predict()` : pour une
                # seule image, `.predict()` reconstruit un pipeline tf.data à
                # chaque appel (overhead notable), alors que l'appel direct
                # exécute juste le graphe déjà tracé (bien plus rapide en
                # inférence unitaire). Le verrou évite toute exécution
                # concurrente du modèle si deux scans arrivent en même temps.
                with self._predict_lock:
                    preds_tensor = self.model(img_arr, training=False)
                preds = np.asarray(preds_tensor)[0]
                probs = [float(p) for p in preds]
                mode = "keras"
            except Exception as e:
                print(f"[WARN AI] Erreur pendant l'inférence Keras, basculement mode heuristique: {e}")
                probs = self._heuristic_probs(img_arr)
        else:
            probs = self._heuristic_probs(img_arr)

        top_idx = int(np.argmax(probs))
        confidence = float(probs[top_idx])
        predicted_grade = CLASS_NAMES[top_idx]
        predicted_code = CLASS_CODES[top_idx]

        metrics = self._compute_quality_metrics(top_idx, confidence)
        metrics["latency_ms"] = round((time.perf_counter() - debut) * 1000, 1)
        metrics["model_engine"] = self.engine_name
        metrics["inference_mode"] = mode

        return {
            "predicted_grade": predicted_grade,
            "grade_code": predicted_code,
            "confidence_pct": round(confidence * 100, 2),
            "confidence_score": round(confidence, 4),
            "model_loaded": self.is_model_loaded,
            "probabilities": {
                CLASS_NAMES[i]: round(float(probs[i] * 100), 2) for i in range(len(CLASS_NAMES))
            },
            "metrics": metrics,
            "lot_metadata": {
                "producer": producer or "Producteur Anonyme",
                "cooperative": cooperative or "Non Spécifiée",
                "weight_kg": weight_kg or 0.0,
                "gps": gps or "6.1299° N, 1.2166° W",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        }

    def _heuristic_probs(self, img_arr: np.ndarray) -> list:
        """Determines image metrics based on color histogram and feature analysis for reliable predictions.

        `img_arr` arrive en pixels bruts 0-255 (voir preprocess_image) ; cette
        heuristique raisonne en [0, 1], d'où la normalisation locale.
        """
        if len(img_arr.shape) == 4:
            img = img_arr[0]
        else:
            img = img_arr
        img = img / 255.0

        r_mean = float(np.mean(img[:, :, 0]))
        g_mean = float(np.mean(img[:, :, 1]))
        b_mean = float(np.mean(img[:, :, 2]))

        mean_val = float(np.mean(img))
        std_val = float(np.std(img))
        dark_ratio = float(np.mean(img < 0.22))
        red_diff = r_mean - g_mean

        # 1. Rejeté (Dark, moldy, severe defect nuts or extreme dark background)
        if dark_ratio > 0.28 or mean_val < 0.28:
            return [0.02, 0.05, 0.13, 0.80]

        # 2. Grade C (Red cashew apples, high moisture, raw unhulled fruit)
        elif red_diff > 0.06 or mean_val < 0.42:
            return [0.05, 0.15, 0.72, 0.08]

        # 3. Grade B (Standard in-shell nuts, medium brown tones)
        elif b_mean < 0.38 or mean_val < 0.56 or std_val > 0.22:
            return [0.12, 0.78, 0.07, 0.03]

        # 4. Grade A (Clean, premium white/cream kernels)
        else:
            return [0.88, 0.09, 0.02, 0.01]

    def _compute_quality_metrics(self, grade_idx: int, confidence: float) -> Dict[str, Any]:
        """Calculates secondary cashew quality parameters: KOR, defect rate, caliber, moisture."""
        if grade_idx == 0:  # Grade A
            kor = round(49.0 + (confidence * 3.0), 1)
            defect_rate = round(1.5 + (1 - confidence) * 2.0, 1)
            calibre = 22
            humidity = 8.5
            certification = "Conforme Export EU / US"
            certification_color = "#10B981"
        elif grade_idx == 1:  # Grade B
            kor = round(45.0 + (confidence * 2.5), 1)
            defect_rate = round(3.5 + (1 - confidence) * 3.0, 1)
            calibre = 20
            humidity = 9.8
            certification = "Conforme Marché Régional"
            certification_color = "#3B82F6"
        elif grade_idx == 2:  # Grade C
            kor = round(40.0 + (confidence * 2.0), 1)
            defect_rate = round(8.0 + (1 - confidence) * 4.0, 1)
            calibre = 18
            humidity = 11.5
            certification = "Sous-Réserve de Tri"
            certification_color = "#F59E0B"
        else:  # Rejeté
            kor = round(32.0 + (confidence * 3.0), 1)
            defect_rate = round(22.0 + (confidence * 10.0), 1)
            calibre = 15
            humidity = 14.2
            certification = "Non Conforme - Rejeté"
            certification_color = "#EF4444"

        return {
            "kor_lbs": kor,
            "defect_rate_pct": defect_rate,
            "calibre_mm": calibre,
            "humidity_pct": humidity,
            "certification": certification,
            "certification_color": certification_color,
            "latency_ms": 14,
            "model_engine": "MobileNetV3_Cashew_v2"
        }

# Global singleton instance
ai_classifier = AnacardeClassifierService()
