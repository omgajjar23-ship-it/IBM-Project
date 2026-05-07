from django.urls import path
from .views import (
    RegisterView, PredictionView, CustomTokenObtainPairView, LogoutView,
    AnalyticsView, ExportView, BatchSubmitView, BatchStatusView, BatchResultView,
    AdminUserView, AdminUserToggleView, AdminLogView, AdminNukeView,
    AdminPredictionView, AdminUserDeleteView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('auth/login', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/logout', LogoutView.as_view(), name='auth_logout'),
    path('auth/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register', RegisterView.as_view(), name='auth_register'),
    
    path('predict', PredictionView.as_view(), name='predict'),
    path('predict/', PredictionView.as_view(), name='predict_trailing'),
    path('predict/history', PredictionView.as_view(), name='predict_history'),
    
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
    
    path('export/', ExportView.as_view(), name='export'),
    
    path('batch/submit', BatchSubmitView.as_view(), name='batch_submit'),
    path('batch/status/<str:job_id>', BatchStatusView.as_view(), name='batch_status'),
    path('batch/results/<str:job_id>', BatchResultView.as_view(), name='batch_results'),
    
    path('admin/users', AdminUserView.as_view(), name='admin_users'),
    path('admin/db/users/<int:pk>', AdminUserDeleteView.as_view(), name='admin_user_delete'),
    path('admin/users/<int:user_id>/toggle', AdminUserToggleView.as_view(), name='admin_user_toggle'),
    path('admin/logs', AdminLogView.as_view(), name='admin_logs'),
    path('admin/db/predictions', AdminPredictionView.as_view(), name='admin_predictions'),
    path('admin/db/predictions/<int:pk>', AdminPredictionView.as_view(), name='admin_prediction_delete'),
    path('admin/db/nuke', AdminNukeView.as_view(), name='admin_nuke'),
]
