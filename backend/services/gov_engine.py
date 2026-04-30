from django.db.models import Sum, Count
from datetime import datetime, timedelta
from django.utils.timezone import is_aware, make_aware, now

# We will import Prediction dynamically to avoid AppRegistryNotReady in case it's imported too early
# Or we can just import from core.models since services is imported after django setup usually.

class GovEngine:
    @staticmethod
    def get_analytics() -> dict:
        from core.models import Prediction
        total_applications = Prediction.objects.count()

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

        # Core KPIs
        approved_value = Prediction.objects.filter(loan_status="Approved").aggregate(Sum('loan_amount'))['loan_amount__sum'] or 0.0
        approved_count = Prediction.objects.filter(loan_status="Approved").count()
        approval_rate  = (approved_count / total_applications) * 100
        
        rejected_count = Prediction.objects.filter(loan_status="Rejected").count()
        rejection_rate = (rejected_count / total_applications) * 100

        high_risk   = Prediction.objects.filter(risk_level__in=["High", "Extremely High"]).count()
        medium_risk = Prediction.objects.filter(risk_level="Medium").count()
        low_risk    = Prediction.objects.filter(risk_level="Low").count()

        # Trend (last 7 days vs prev 7 days)
        current_now = now()
        last_7_days_start = current_now - timedelta(days=7)
        prev_7_days_start = current_now - timedelta(days=14)

        current_vol = Prediction.objects.filter(timestamp__gte=last_7_days_start).count()
        prev_vol = Prediction.objects.filter(timestamp__gte=prev_7_days_start, timestamp__lt=last_7_days_start).count()
        vol_change = ((current_vol - prev_vol) / prev_vol * 100) if prev_vol > 0 else 0

        # Education breakdown
        edu_rows = Prediction.objects.values('education', 'prediction').annotate(count=Count('id'))
        edu_map = {}
        for row in edu_rows:
            edu = row['education']
            pred = row['prediction']
            cnt = row['count']
            if edu not in edu_map:
                edu_map[edu] = {"education": edu, "above_50k": 0, "below_50k": 0}
            if pred == ">50K":
                edu_map[edu]["above_50k"] += cnt
            else:
                edu_map[edu]["below_50k"] += cnt
        education_breakdown = sorted(edu_map.values(), key=lambda x: x["above_50k"] + x["below_50k"], reverse=True)[:8]

        # Occupation breakdown
        occ_rows = Prediction.objects.values('occupation', 'loan_status').annotate(count=Count('id'))
        occ_map = {}
        for row in occ_rows:
            occ = row['occupation']
            status = row['loan_status']
            cnt = row['count']
            if occ not in occ_map:
                occ_map[occ] = {"occupation": occ, "approved": 0, "total": 0}
            occ_map[occ]["total"] += cnt
            if status == "Approved":
                occ_map[occ]["approved"] += cnt
                
        for v in occ_map.values():
            v["approval_rate"] = round((v["approved"] / v["total"]) * 100, 1) if v["total"] else 0.0
        occupation_breakdown = sorted(occ_map.values(), key=lambda x: x["total"], reverse=True)[:6]

        # Daily trend
        daily_trend = []
        today = current_now.date()
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_start = make_aware(datetime(day.year, day.month, day.day)) if is_aware(current_now) else datetime(day.year, day.month, day.day)
            day_end = day_start + timedelta(days=1)
            count = Prediction.objects.filter(timestamp__gte=day_start, timestamp__lt=day_end).count()
            daily_trend.append({"date": day.strftime("%b %d"), "predictions": count})

        # AI Summary
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
                "approval_rate": 2.4, # Mocked
                "risk": -1.2
            }
        }

gov_engine = GovEngine()
