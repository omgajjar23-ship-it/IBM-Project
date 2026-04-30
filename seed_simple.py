import sys, os
import django

# Setup Django environment
backend_dir = os.path.join(os.getcwd(), 'backend')
sys.path.insert(0, backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

email = "admin@incomeinsight.com"
password = "Admin123"

User.objects.filter(email=email).delete()
User.objects.create_user(
    email=email,
    name="Admin Executive",
    password=password,
    role="admin",
    is_active=True,
)
print(f"Admin user {email} seeded successfully.")
