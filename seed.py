"""
seed.py — Idempotent database seeder.
Creates the default admin account if it doesn't already exist.
Run once after first startup: python seed.py
"""
import sys
import urllib.request
import urllib.error
import json

REGISTER_URL = "http://localhost:8000/api/v1/auth/register"

ADMIN_PAYLOAD = {
    "email":    "admin@incomeinsight.com",
    "name":     "Admin Executive",
    "password": "Admin123",
    "role":     "admin"
}

def seed():
    print("Income Insight - Database Seeder")
    print("=" * 40)

    # Try to register via API
    try:
        data = json.dumps(ADMIN_PAYLOAD).encode("utf-8")
        req  = urllib.request.Request(
            REGISTER_URL,
            data    = data,
            headers = {"Content-Type": "application/json"},
            method  = "POST",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            print(f"✅ User registered via API: {body.get('email')} (role: {body.get('role')})")

    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        if e.code == 400 and "already exists" in body:
            print("ℹ️  Admin user already exists — ensuring password is up to date...")
            _direct_db_seed()
        else:
            print(f"⚠️  API returned HTTP {e.code}: {body}")
            print("   Attempting direct DB insert as fallback...")
            _direct_db_seed()

    except urllib.error.URLError as e:
        print(f"⚠️  Could not reach backend at {REGISTER_URL}")
        print(f"   Reason: {e.reason}")
        print("   Make sure the server is running before seeding, or use direct DB insert.")
        print("   Attempting direct DB insert as fallback...")
        _direct_db_seed()

    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)


def _direct_db_seed():
    """Fallback: directly insert admin into DB using Django ORM."""
    try:
        import sys, os
        import django
        
        # Setup Django environment
        backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
        sys.path.insert(0, backend_dir)
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
        django.setup()
        
        from django.contrib.auth import get_user_model
        User = get_user_model()

        existing = User.objects.filter(email="admin@incomeinsight.com").first()
        if existing:
            print("ℹ️  Admin exists in DB — updating password.")
            existing.set_password(ADMIN_PAYLOAD["password"])
            existing.save()
            return

        admin = User.objects.create_user(
            email="admin@incomeinsight.com",
            name="Admin Executive",
            password=ADMIN_PAYLOAD["password"],
            role="admin",
            is_active=True,
        )
        print("✅ Admin user created directly in DB.")

    except Exception as e:
        print(f"❌ Direct DB seed also failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    seed()
