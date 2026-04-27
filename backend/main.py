import os
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
import httpx

app = Flask(__name__)

frontend_url = os.environ.get("FRONTEND_URL", "*")
if frontend_url.startswith("http://localhost"):
    CORS(app, origins=[f"http://localhost:{p}" for p in range(5170, 5180)])
else:
    CORS(app, origins=[frontend_url] if frontend_url != "*" else "*")

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]


def service_headers():
    return {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def get_user(token):
    r = httpx.get(f"{SUPABASE_URL}/auth/v1/user",
                  headers={"apikey": SUPABASE_SERVICE_KEY, "Authorization": f"Bearer {token}"})
    if r.status_code != 200:
        return None
    return r.json()


def get_profile(user_id):
    r = httpx.get(f"{SUPABASE_URL}/rest/v1/profiles",
                  headers=service_headers(),
                  params={"id": f"eq.{user_id}", "select": "role"})
    data = r.json()
    return data[0] if data else None


@app.get("/")
def root():
    return jsonify({"status": "ok", "service": "Simba 2.0 API"})


# ── Products ──────────────────────────────────────────────────────────────────

@app.get("/api/products/categories")
def categories():
    r = httpx.get(f"{SUPABASE_URL}/rest/v1/products",
                  headers=service_headers(),
                  params={"select": "category"})
    from collections import Counter
    counts = Counter(p["category"] for p in r.json())
    result = [{"name": c, "count": n} for c, n in sorted(counts.items())]
    return jsonify(result)


@app.get("/api/products/<int:product_id>")
def get_product(product_id):
    r = httpx.get(f"{SUPABASE_URL}/rest/v1/products",
                  headers={**service_headers(), "Accept": "application/vnd.pgrst.object+json"},
                  params={"id": f"eq.{product_id}", "select": "*"})
    return jsonify(r.json()), r.status_code


@app.get("/api/products")
def list_products():
    category = request.args.get("category")
    search = request.args.get("search")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    sort = request.args.get("sort", "")

    params = {"select": "*"}
    if category:
        params["category"] = f"eq.{category}"
    if search:
        params["name"] = f"ilike.*{search}*"

    order_map = {"price_asc": "price.asc", "price_desc": "price.desc", "name_asc": "name.asc"}
    params["order"] = order_map.get(sort, "id.asc")
    params["offset"] = (page - 1) * limit
    params["limit"] = limit

    headers = {**service_headers(), "Prefer": "count=exact"}
    r = httpx.get(f"{SUPABASE_URL}/rest/v1/products", headers=headers, params=params)

    total = 0
    content_range = r.headers.get("content-range", "")
    if "/" in content_range:
        total = int(content_range.split("/")[1])

    pages = -(-total // limit) if total else 0
    return jsonify({"products": r.json(), "total": total, "page": page, "limit": limit, "pages": pages})


# ── Orders ────────────────────────────────────────────────────────────────────

@app.post("/api/orders")
def create_order():
    auth = request.headers.get("Authorization", "")
    user = get_user(auth.replace("Bearer ", ""))
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    body = request.json
    payload = {
        "user_id": user["id"],
        "customer_name": body["customer_name"],
        "customer_email": body["customer_email"],
        "items": body["items"],
        "total": body["total"],
        "payment_method": body["payment_method"],
        "phone": body["phone"],
        "address": body["address"],
        "city": body["city"],
        "status": "pending",
    }
    r = httpx.post(f"{SUPABASE_URL}/rest/v1/orders", headers=service_headers(), json=payload)
    data = r.json()
    return jsonify(data[0] if isinstance(data, list) else data), 201


@app.get("/api/orders")
def list_orders():
    auth = request.headers.get("Authorization", "")
    user = get_user(auth.replace("Bearer ", ""))
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    profile = get_profile(user["id"])
    params = {"select": "*", "order": "created_at.desc"}
    if not profile or profile.get("role") != "market_rep":
        params["user_id"] = f"eq.{user['id']}"

    r = httpx.get(f"{SUPABASE_URL}/rest/v1/orders", headers=service_headers(), params=params)
    return jsonify(r.json())


@app.put("/api/orders/<order_id>")
def update_order(order_id):
    auth = request.headers.get("Authorization", "")
    user = get_user(auth.replace("Bearer ", ""))
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    profile = get_profile(user["id"])
    if not profile or profile.get("role") != "market_rep":
        return jsonify({"error": "Forbidden"}), 403

    body = request.json
    r = httpx.patch(f"{SUPABASE_URL}/rest/v1/orders",
                    headers=service_headers(),
                    params={"id": f"eq.{order_id}"},
                    json={"status": body["status"]})
    data = r.json()
    return jsonify(data[0] if isinstance(data, list) else data)


# ── Dashboard ─────────────────────────────────────────────────────────────────

@app.get("/api/dashboard/stats")
def dashboard_stats():
    auth = request.headers.get("Authorization", "")
    user = get_user(auth.replace("Bearer ", ""))
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    profile = get_profile(user["id"])
    if not profile or profile.get("role") != "market_rep":
        return jsonify({"error": "Forbidden"}), 403

    orders_r = httpx.get(f"{SUPABASE_URL}/rest/v1/orders",
                         headers={**service_headers(), "Prefer": "count=exact"},
                         params={"select": "status,total"})
    orders = orders_r.json()

    prod_r = httpx.get(f"{SUPABASE_URL}/rest/v1/products",
                       headers={**service_headers(), "Prefer": "count=exact"},
                       params={"select": "id", "limit": 1})
    prod_range = prod_r.headers.get("content-range", "0/0")
    product_count = int(prod_range.split("/")[1]) if "/" in prod_range else 0

    return jsonify({
        "total_orders": len(orders),
        "pending_orders": sum(1 for o in orders if o["status"] == "pending"),
        "approved_orders": sum(1 for o in orders if o["status"] in ("approved", "delivered")),
        "total_revenue": sum(o["total"] for o in orders if o["status"] != "rejected"),
        "product_count": product_count,
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
