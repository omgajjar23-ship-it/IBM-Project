from typing import Dict, Any

# Education tiers used for risk/loan adjustments
_HIGH_EDU = {'Doctorate', 'Masters', 'Prof-school'}
_MED_EDU  = {'Bachelors', 'Some-college', 'Assoc-acdm', 'Assoc-voc'}

class BankEngine:

    @staticmethod
    def evaluate_risk(confidence: float, prediction: str) -> str:
        if prediction == ">50K":
            return "Low" if confidence >= 75 else "Medium"
        else:
            return "High" if confidence >= 75 else "Medium"

    @staticmethod
    def evaluate_loan_status(risk_level: str) -> str:
        mapping = {
            "Low": "Approved",
            "Medium": "Review Required",
            "High": "Rejected",
            "Extremely High": "KYC / Fraud Review",
        }
        return mapping.get(risk_level, "Rejected")

    @staticmethod
    def calculate_loan_amount(
        prediction: str, confidence: float, hours_per_week: int, education: str
    ) -> float:
        """
        Realistic tiered loan calculation.

        >50K earners:
          Base $75,000 + confidence bonus (up to $100,000) + hours bonus (up to $50,000)
          Education premium: high-edu → +15%, mid-edu → +5%
          Hard cap: $250,000

        ≤50K earners:
          Base $15,000 + confidence bonus (up to $20,000) + hours bonus (up to $15,000)
          Education premium: high-edu → +10%, mid-edu → +3%
          Hard cap: $50,000
        """
        confidence_ratio = confidence / 100.0          # 0–1
        hours_ratio = min(hours_per_week, 60) / 60.0   # 0–1 (capped at 60 hrs)

        if prediction == ">50K":
            base   = 75_000
            conf_b = 100_000 * confidence_ratio
            hour_b = 50_000  * hours_ratio
            amount = base + conf_b + hour_b

            if education in _HIGH_EDU:
                amount *= 1.15
            elif education in _MED_EDU:
                amount *= 1.05

            amount = min(amount, 250_000)
        else:
            base   = 15_000
            conf_b = 20_000 * confidence_ratio
            hour_b = 15_000 * hours_ratio
            amount = base + conf_b + hour_b

            if education in _HIGH_EDU:
                amount *= 1.10
            elif education in _MED_EDU:
                amount *= 1.03

            amount = min(amount, 50_000)

        return round(amount, 2)

    @staticmethod
    def process_prediction(ml_result: dict, inputs: dict) -> Dict[str, Any]:
        hours_per_week = inputs.get('hours_per_week', 40)
        age            = inputs.get('age', 30)
        education      = inputs.get('education', '')

        # Fraud / anomaly detection
        if (
            (age < 23 and education in _HIGH_EDU) or
            (age < 18 and hours_per_week > 60) or
            (hours_per_week > 90)
        ):
            return {
                "risk_level": "Extremely High",
                "loan_status": "KYC / Fraud Review",
                "loan_amount": 0.0,
            }

        risk_level  = BankEngine.evaluate_risk(ml_result['confidence'], ml_result['prediction'])
        loan_status = BankEngine.evaluate_loan_status(risk_level)

        if loan_status == "Rejected":
            loan_amount = 0.0
        else:
            loan_amount = BankEngine.calculate_loan_amount(
                ml_result['prediction'],
                ml_result['confidence'],
                hours_per_week,
                education,
            )

        return {
            "risk_level":  risk_level,
            "loan_status": loan_status,
            "loan_amount": loan_amount,
        }

bank_engine = BankEngine()
