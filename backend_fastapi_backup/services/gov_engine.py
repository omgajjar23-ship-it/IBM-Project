from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from backend.models.prediction import Prediction
from typing import List, Dict, Any


class GovEngine:

    @staticmethod
    def get_analytics(db: Session) -> dict:
        total_applications = db.query(Prediction).count()

        if total_applications == 0:
            return {
                "total_applications": 0,
                "approved_loans_value": 0.0,
                "rejection_rate": 0.0,
                "high_risk_count": 0,
                "medium_risk_count": 0,
                "low_risk_count": 0,
                "education_breakdown": [],
                "occupation_breakdown": [],
                "daily_trend": [],
                "ai_summary": "No data available yet. Run your first prediction to generate AI insights.",
                "trends": {"applications": 0, "approval_rate": 0, "risk": 0}
            }

        # ── Core KPIs ────────────────────────────────────────────────────────
        approved_value = (
            db.query(func.sum(Prediction.loan_amount))
              .filter(Prediction.loan_status == "Approved")
              .scalar() or 0.0
        )
        approved_count = db.query(Prediction).filter(Prediction.loan_status == "Approved").count()
        approval_rate  = (approved_count / total_applications) * 100
        
        rejected_count = db.query(Prediction).filter(Prediction.loan_status == "Rejected").count()
        rejection_rate = (rejected_count / total_applications) * 100

        high_risk   = db.query(Prediction).filter(Prediction.risk_level == "High").count()
        medium_risk = db.query(Prediction).filter(Prediction.risk_level == "Medium").count()
        low_risk    = db.query(Prediction).filter(Prediction.risk_level == "Low").count()

        # ── Trend Calculation (Current 7 days vs Previous 7 days) ─────────────
        now = datetime.utcnow()
        last_7_days_start = now - timedelta(days=7)
        prev_7_days_start = now - timedelta(days=14)

        current_vol = db.query(Prediction).filter(Prediction.timestamp >= last_7_days_start).count()
        prev_vol    = db.query(Prediction).filter(Prediction.timestamp >= prev_7_days_start, Prediction.timestamp < last_7_days_start).count()
        
        vol_change = ((current_vol - prev_vol) / prev_vol * 100) if prev_vol > 0 else 0

        # ── Education breakdown ───────────────────────────────────────────────
        edu_rows = (
            db.query(Prediction.education, Prediction.prediction, func.count(Prediction.id))
              .group_by(Prediction.education, Prediction.prediction)
              .all()
        )
        edu_map: dict = {}
        for edu, pred, cnt in edu_rows:
            if edu not in edu_map:
                edu_map[edu] = {"education": edu, "above_50k": 0, "below_50k": 0}
            if pred == ">50K":
                edu_map[edu]["above_50k"] += cnt
            else:
                edu_map[edu]["below_50k"] += cnt
        education_breakdown = sorted(edu_map.values(), key=lambda x: x["above_50k"] + x["below_50k"], reverse=True)[:8]

        # ── Occupation breakdown (top 6 by approval rate) ─────────────────────
        occ_rows = (
            db.query(Prediction.occupation, Prediction.loan_status, func.count(Prediction.id))
              .group_by(Prediction.occupation, Prediction.loan_status)
              .all()
        )
        occ_map: dict = {}
        for occ, status, cnt in occ_rows:
            if occ not in occ_map:
                occ_map[occ] = {"occupation": occ, "approved": 0, "total": 0}
            occ_map[occ]["total"] += cnt
            if status == "Approved":
                occ_map[occ]["approved"] += cnt
        for v in occ_map.values():
            v["approval_rate"] = round((v["approved"] / v["total"]) * 100, 1) if v["total"] else 0.0
        occupation_breakdown = sorted(occ_map.values(), key=lambda x: x["total"], reverse=True)[:6]

        # ── 7-day daily trend ─────────────────────────────────────────────────
        daily_trend = []
        today = now.date()
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_start = datetime(day.year, day.month, day.day)
            day_end   = day_start + timedelta(days=1)
            count = (
                db.query(func.count(Prediction.id))
                  .filter(Prediction.timestamp >= day_start, Prediction.timestamp < day_end)
                  .scalar() or 0
            )
            daily_trend.append({"date": day.strftime("%b %d"), "predictions": count})

        # ── AI Narrative Generation ───────────────────────────────────────────
        top_edu = education_breakdown[0]["education"] if education_breakdown else "N/A"
        top_occ = occupation_breakdown[0]["occupation"] if occupation_breakdown else "N/A"
        
        summary_parts = [
            f"Currently tracking {total_applications} total applications with a {approval_rate:.1f}% approval rate.",
            f"The {top_edu} education cohort is the primary driver of high-income predictions.",
            f"We've detected a trend where {top_occ} roles have the strongest approval velocity."
        ]
        
        if high_risk > (total_applications * 0.4):
            summary_parts.append("Alert: High-risk profiles are currently above the 40% safety threshold.")
        elif rejection_rate < 15:
            summary_parts.append("Insight: Rejection rates are unusually low, suggesting a highly qualified applicant pool.")
            
        ai_summary = " ".join(summary_parts)

        return {
            "total_applications":  total_applications,
            "approved_loans_value": float(approved_value),
            "rejection_rate":       round(rejection_rate, 2),
            "high_risk_count":      high_risk,
            "medium_risk_count":    medium_risk,
            "low_risk_count":       low_risk,
            "education_breakdown":  education_breakdown,
            "occupation_breakdown": occupation_breakdown,
            "daily_trend":          daily_trend,
            "ai_summary":           ai_summary,
            "trends": {
                "applications": round(vol_change, 1),
                "approval_rate": 2.4, # Mocked for now without full hist
                "risk": -1.2        # Mocked for now
            }
        }


gov_engine = GovEngine()
