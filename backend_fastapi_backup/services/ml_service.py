import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any

class MLService:
    def __init__(self):
        try:
            model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../ml_pipeline/model.joblib')
            self.model = joblib.load(model_path)
            self.is_loaded = True
            self._extract_feature_importances()
        except Exception as e:
            print(f"Warning: ML Model not found or failed to load. Run ml_pipeline/train_model.py first. Error: {e}")
            self.is_loaded = False
            self.feature_importances = None

    def _extract_feature_importances(self):
        """Extract and cache real feature importances from the trained RandomForest pipeline."""
        try:
            preprocessor = self.model.named_steps['preprocessor']
            classifier = self.model.named_steps['classifier']

            # Numeric feature names: age, hours-per-week
            numeric_names = ['age', 'hours-per-week']

            # One-hot encoded feature names from the pipeline
            ohe = preprocessor.named_transformers_['cat'].named_steps['onehot']
            cat_names = list(ohe.get_feature_names_out(['workclass', 'education', 'occupation']))

            all_feature_names = numeric_names + cat_names
            importances = classifier.feature_importances_

            # Build a dict of base_feature → aggregated importance
            base_map = {
                'age': 'Age & Experience',
                'hours-per-week': 'Work Capacity',
                'workclass': 'Work Class',
                'education': 'Education Level',
                'occupation': 'Occupation Type',
            }
            aggregated = {v: 0.0 for v in base_map.values()}
            for name, imp in zip(all_feature_names, importances):
                for prefix, label in base_map.items():
                    if name == prefix or name.startswith(f"{prefix}_"):
                        aggregated[label] += imp
                        break

            self.feature_importances = aggregated
        except Exception as e:
            print(f"Warning: Could not extract feature importances: {e}")
            self.feature_importances = None

    def _get_explainability(self, input_data: dict) -> dict:
        """Return real model-based feature importances, normalised to 100%."""
        if self.feature_importances:
            total = sum(self.feature_importances.values())
            if total > 0:
                result = {k: round((v / total) * 100, 1) for k, v in self.feature_importances.items()}
                return dict(sorted(result.items(), key=lambda x: x[1], reverse=True))

        # Fallback (no model loaded): rule-based approximation
        base_factors = {
            "Age & Experience": min(35, max(10, input_data['age'] * 0.5)),
            "Education Level": 28 if input_data['education'] in ['Bachelors', 'Masters', 'Doctorate'] else 10,
            "Work Capacity": min(20, input_data['hours_per_week'] * 0.4),
            "Occupation Type": 15 if input_data['occupation'] in ['Exec-managerial', 'Prof-specialty'] else 5,
            "Work Class": 10,
        }
        total = sum(base_factors.values())
        result = {k: round((v / total) * 100, 1) for k, v in base_factors.items()}
        return dict(sorted(result.items(), key=lambda x: x[1], reverse=True))

    def predict(self, input_data: dict) -> Dict[str, Any]:
        if not self.is_loaded:
            # Fallback mock when no model is present
            prediction = ">50K" if input_data.get("hours_per_week", 40) > 40 else "<=50K"
            return {
                "prediction": prediction,
                "confidence": 72.0,
                "explainability": self._get_explainability(input_data),
            }

        df = pd.DataFrame([{
            'age': input_data['age'],
            'workclass': input_data['workclass'],
            'education': input_data['education'],
            'occupation': input_data['occupation'],
            'hours-per-week': input_data['hours_per_week'],
        }])

        pred_class = self.model.predict(df)[0]
        proba = self.model.predict_proba(df)[0]

        prediction = ">50K" if pred_class == 1 else "<=50K"
        confidence = float(proba[1] if pred_class == 1 else proba[0]) * 100

        return {
            "prediction": prediction,
            "confidence": round(confidence, 2),
            "explainability": self._get_explainability(input_data),
        }

ml_service = MLService()
