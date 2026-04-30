from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def root_view(request):
    return JsonResponse({"message": "Welcome to Income Insight Platform API. APIs are at /api/v1/"})

urlpatterns = [
    path('', root_view),
    path('admin/', admin.site.urls),
    path('api/v1/', include('core.urls')),
]
