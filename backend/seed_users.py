from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_SERVICE_KEY"]
sb = create_client(url, key)

try:
    sb.auth.admin.create_user({
        "email": "buyer@test.com",
        "password": "password123",
        "user_metadata": {"full_name": "Test Buyer", "role": "buyer"},
        "email_confirm": True
    })
    print("Buyer created: buyer@test.com / password123")
except Exception as e:
    print(f"Buyer already exists or error: {e}")

try:
    sb.auth.admin.create_user({
        "email": "admin@test.com",
        "password": "admin123",
        "user_metadata": {"full_name": "Admin User", "role": "market_rep"},
        "email_confirm": True
    })
    print("Admin created: admin@test.com / admin123")
except Exception as e:
    print(f"Admin already exists or error: {e}")

print("Done!")
