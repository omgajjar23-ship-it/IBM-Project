import time
import uuid
import csv
import io
import threading
from django.db import transaction
from django.http import StreamingHttpResponse

from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied, ValidationError

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Prediction, Log
from .serializers import UserSerializer, PredictionSerializer, LogSerializer

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from services.ml_service import ml_service
    from services.bank_engine import bank_engine
    from services.gov_engine import gov_engine
except ImportError as e:
    print(f"IMPORT ERROR in views.py: {e}")

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['access_token'] = data.pop('access')
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access = response.data.get('access_token')
            refresh = response.data.get('refresh')
            try:
                from rest_framework_simplejwt.tokens import AccessToken
                token = AccessToken(access)
                role = token.payload.get('role', 'bank')
            except Exception:
                role = 'bank'
                
            response.set_cookie('access_token', access, httponly=True, samesite='Lax')
            response.set_cookie('refresh_token', refresh, httponly=True, samesite='Lax')
            
            response.data = {'role': role, 'message': 'Logged in successfully'}
        return response

    def dispatch(self, request, *args, **kwargs):
        start_time = time.time()
        response = super().dispatch(request, *args, **kwargs)
        process_time = (time.time() - start_time) * 1000
        status_str = "success" if 200 <= response.status_code < 300 else "failed"
        Log.objects.create(api_call="/auth/login", status=status_str, response_time=process_time)
        return response

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    def dispatch(self, request, *args, **kwargs):
        start_time = time.time()
        response = super().dispatch(request, *args, **kwargs)
        process_time = (time.time() - start_time) * 1000
        status_str = "success" if 200 <= response.status_code < 300 else "failed"
        Log.objects.create(api_call="/auth/register", status=status_str, response_time=process_time)
        return response

class PredictionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        start_time = time.time()
        try:
            # Sanitize input data to ensure correct types
            data_dict = request.data.copy()
            try:
                data_dict['age'] = int(data_dict.get('age', 35))
                data_dict['hours_per_week'] = int(data_dict.get('hours_per_week', 40))
            except (ValueError, TypeError):
                return Response({"detail": "Invalid numeric input for age or hours_per_week"}, status=status.HTTP_400_BAD_REQUEST)
            
            # 1. ML Prediction
            ml_result = ml_service.predict(data_dict)
            
            # 2. Bank Engine Processing
            bank_result = bank_engine.process_prediction(ml_result, data_dict)
            
            # 3. Sensitivity Analysis
            sensitivity = {}
            base_conf = float(ml_result['confidence'])
            
            # Check Age sensitivity
            alt_data = data_dict.copy()
            alt_data['age'] += 5
            alt_res = ml_service.predict(alt_data)
            sensitivity['Age'] = abs(float(alt_res['confidence']) - base_conf)

            # Check Hours sensitivity
            alt_data = data_dict.copy()
            alt_data['hours_per_week'] += 5
            alt_res = ml_service.predict(alt_data)
            sensitivity['Hours'] = abs(float(alt_res['confidence']) - base_conf)

            butterfly_var = max(sensitivity, key=sensitivity.get) if sensitivity else "Baseline"
            butterfly_impact = sensitivity.get(butterfly_var, 0)
            
            # 4. Save Prediction
            ref_id = f"APP-{uuid.uuid4().hex[:4].upper()}"
            prediction = Prediction.objects.create(
                ref_id=ref_id,
                applicant_name=data_dict.get('applicant_name', "Anonymous"),
                age=data_dict['age'],
                workclass=data_dict.get('workclass', 'Private'),
                education=data_dict.get('education', 'Bachelors'),
                occupation=data_dict.get('occupation', 'Exec-managerial'),
                hours_per_week=data_dict['hours_per_week'],
                prediction=ml_result['prediction'],
                confidence=ml_result['confidence'],
                risk_level=bank_result['risk_level'],
                loan_status=bank_result['loan_status'],
                loan_amount=bank_result['loan_amount'],
                user=request.user
            )

            process_time = (time.time() - start_time) * 1000
            Log.objects.create(api_call="/predict", status="success", response_time=process_time)

            serializer = PredictionSerializer(prediction)
            res_data = dict(serializer.data)
            
            res_data['explainability'] = {
                **ml_result.get('explainability', {}),
                "_butterfly": {"var": butterfly_var, "impact": round(float(butterfly_impact), 1)}
            }
            res_data['creator_name'] = request.user.name or request.user.email

            return Response(res_data)
            
        except Exception as exc:
            process_time = (time.time() - start_time) * 1000
            Log.objects.create(api_call="/predict", status="failed", response_time=process_time)
            import traceback
            print(f"Prediction View Crash: {exc}")
            traceback.print_exc()
            return Response({
                "detail": "Internal server error during prediction. Please check server logs.",
                "error": str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request, *args, **kwargs):
        predictions = Prediction.objects.all().order_by('-timestamp')
        skip = int(request.query_params.get('skip', 0))
        limit = int(request.query_params.get('limit', 100))
        predictions = predictions[skip:skip+limit]
        serializer = PredictionSerializer(predictions, many=True)
        return Response(serializer.data)

class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Allow all authenticated users to see analytics as per user request
        return Response(gov_engine.get_analytics())

class ExportView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        api_key = request.query_params.get('api_key')
        expected_key = os.getenv("POWERBI_EXPORT_KEY", "powerbi-secret-key-123")
        if api_key != expected_key:
            raise PermissionDenied("Invalid API Key for Power BI Export")

        predictions = Prediction.objects.all()
        
        class Echo:
            def write(self, value):
                return value
        
        pseudo_buffer = Echo()
        writer = csv.writer(pseudo_buffer)
        
        def iter_items():
            yield writer.writerow(["id", "age", "education", "occupation", "hours_per_week", "income_prediction", "confidence", "risk_level", "loan_status", "loan_amount", "timestamp"])
            for p in predictions:
                yield writer.writerow([
                    p.id, p.age, p.education, p.occupation, p.hours_per_week, 
                    p.prediction, p.confidence, p.risk_level, p.loan_status, p.loan_amount, p.timestamp
                ])

        response = StreamingHttpResponse(iter_items(), content_type="text/csv")
        response['Content-Disposition'] = 'attachment; filename="predictions_export.csv"'
        return response

_jobs = {}

def _run_batch(job_id, predictions_in):
    try:
        _jobs[job_id]["status"] = "processing"
        results = []
        for i, pred_data in enumerate(predictions_in):
            ml_result = ml_service.predict(pred_data)
            bank_result = bank_engine.process_prediction(ml_result, pred_data)
            
            p = Prediction.objects.create(
                age=pred_data["age"],
                workclass=pred_data["workclass"],
                education=pred_data["education"],
                occupation=pred_data["occupation"],
                hours_per_week=pred_data["hours_per_week"],
                prediction=ml_result["prediction"],
                confidence=ml_result["confidence"],
                risk_level=bank_result["risk_level"],
                loan_status=bank_result["loan_status"],
                loan_amount=bank_result["loan_amount"]
            )
            results.append(PredictionSerializer(p).data)
            _jobs[job_id]["progress"] = i + 1
            
        Log.objects.create(api_call="/batch/submit", status="success", response_time=0.0)
        _jobs[job_id]["status"] = "done"
        _jobs[job_id]["results"] = results
    except Exception as exc:
        _jobs[job_id]["status"] = "failed"
        _jobs[job_id]["error"] = str(exc)

class BatchSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role not in ['bank', 'admin']:
            raise PermissionDenied("Only bank or admin can submit batches")
            
        predictions_in = request.data
        if len(predictions_in) > 500:
            raise ValidationError("Batch limit is 500 records per job.")
            
        job_id = str(uuid.uuid4())
        _jobs[job_id] = {
            "status": "queued",
            "progress": 0,
            "total": len(predictions_in),
            "results": None,
            "error": None
        }
        background_thread = threading.Thread(target=_run_batch, args=(job_id, predictions_in))
        background_thread.start()
        
        return Response({"job_id": job_id, "total": len(predictions_in), "status": "queued"})

class BatchStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        if job_id not in _jobs:
            return Response({"detail": "Job not found"}, status=404)
        job = _jobs[job_id]
        return Response({
            "job_id": job_id,
            "status": job["status"],
            "progress": job["progress"],
            "total": job["total"],
            "error": job["error"]
        })

class BatchResultView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        if job_id not in _jobs:
            return Response({"detail": "Job not found"}, status=404)
        job = _jobs[job_id]
        if job["status"] != "done":
            return Response({"detail": f"Job is not complete yet. Status: {job['status']}"}, status=400)
        return Response({"job_id": job_id, "total": job["total"], "results": job["results"]})

# Admin Views
class AdminUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            raise PermissionDenied("Admin access required")
        users = User.objects.all().values('id', 'email', 'name', 'role', 'is_active')
        return Response(list(users))

    def post(self, request):
        if request.user.role != 'admin':
            raise PermissionDenied("Admin access required")
        data = request.data
        if User.objects.filter(email=data.get('email')).exists():
            return Response({"detail": "A user with this email already exists."}, status=400)
        user = User.objects.create_user(
            email=data.get('email'),
            password=data.get('password'),
            name=data.get('name'),
            role=data.get('role', 'bank')
        )
        return Response({"id": user.id, "email": user.email, "name": user.name, "role": user.role, "is_active": user.is_active})

class AdminUserToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        if request.user.role != 'admin':
            raise PermissionDenied("Admin access required")
        try:
            user = User.objects.get(id=user_id)
            user.is_active = not user.is_active
            user.save()
            return Response({"status": "success", "is_active": user.is_active})
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=404)

class AdminLogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            raise PermissionDenied("Admin access required")
        skip = int(request.query_params.get('skip', 0))
        limit = int(request.query_params.get('limit', 100))
        logs = Log.objects.all().order_by('-timestamp')[skip:skip+limit]
        return Response(LogSerializer(logs, many=True).data)

class AdminNukeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'admin':
            raise PermissionDenied("Admin access required")
        Prediction.objects.all().delete()
        Log.objects.all().delete()
        return Response({"status": "nuked", "message": "All predictions and logs have been permanently dropped."})

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response({"message": "Logged out successfully."})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response
