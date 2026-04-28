from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_SERVICE_KEY"]
sb = create_client(url, key)

TEST_USERS = [
    {
        "email": "buyer@test.com",
        "password": "password123",
        "full_name": "Test Buyer",
        "role": "buyer",
        "phone": "+250700000001",
        "address": "KN 343 St",
        "city": "Kigali",
    },
    {
        "email": "admin@test.com",
        "password": "admin123",
        "full_name": "Admin User",
        "role": "market_rep",
        "phone": "+250700000002",
        "address": "KN 5 Rd",
        "city": "Kigali",
    },
]


def find_user_by_email(email: str):
    users = sb.auth.admin.list_users()
    for user in users:
        if user.email == email:
            return user
    return None


def sync_profile(user_id: str, full_name: str, role: str, phone: str, address: str, city: str):
    sb.table("profiles").upsert({
        "id": user_id,
        "full_name": full_name,
        "role": role,
        "phone": phone,
        "address": address,
        "city": city,
    }).execute()


for test_user in TEST_USERS:
    payload = {
        "email": test_user["email"],
        "password": test_user["password"],
        "user_metadata": {
            "full_name": test_user["full_name"],
            "role": test_user["role"],
            "phone": test_user["phone"],
            "address": test_user["address"],
            "city": test_user["city"],
        },
        "email_confirm": True,
    }

    try:
        existing_user = find_user_by_email(test_user["email"])
        if existing_user:
            response = sb.auth.admin.update_user_by_id(existing_user.id, payload)
            user_id = response.user.id
            action = "updated"
        else:
            response = sb.auth.admin.create_user(payload)
            user_id = response.user.id
            action = "created"

        sync_profile(
            user_id,
            test_user["full_name"],
            test_user["role"],
            test_user["phone"],
            test_user["address"],
            test_user["city"],
        )
        print(
            f"{test_user['email']} {action} with phone {test_user['phone']} "
            f"and address {test_user['address']}, {test_user['city']}"
        )
    except Exception as e:
        print(f"{test_user['email']} error: {e}")
print("Done!")
