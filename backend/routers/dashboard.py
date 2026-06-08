from fastapi import APIRouter, Header, HTTPException
from supabase import create_client
import os

router = APIRouter()
sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

def require_staff(token: str):
    try:
        user = sb.auth.get_user(token).user
        profile = sb.table("profiles").select("role, branch").eq("id", user.id).single().execute()
        if profile.data["role"] not in ("admin", "branch_manager"):
            raise HTTPException(status_code=403, detail="Staff only")
        return profile.data
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Unauthorized")

@router.get("/stats")
def get_stats(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    staff = require_staff(token)
    query = sb.table("orders").select("*")
    if staff["role"] == "branch_manager":
        query = query.eq("branch", staff.get("branch"))
    orders = query.execute().data
    total = len(orders)
    pending = sum(1 for o in orders if o["status"] == "pending")
    approved = sum(1 for o in orders if o["status"] in ("approved", "delivered"))
    revenue = sum(o["total"] for o in orders if o["status"] != "rejected")
    product_count = sb.table("products").select("id", count="exact").execute().count

    # Top products by quantity sold
    product_sales = {}
    category_revenue = {}
    for order in orders:
        if order["status"] == "rejected":
            continue
        items = order.get("items") or []
        if not isinstance(items, list):
            continue
        for item in items:
            name = item.get("name", "Unknown")
            qty = int(item.get("qty", 0))
            price = float(item.get("price", 0))
            category = item.get("category", "General")
            rev = qty * price
            if name not in product_sales:
                product_sales[name] = {"name": name, "qty": 0, "revenue": 0}
            product_sales[name]["qty"] += qty
            product_sales[name]["revenue"] += rev
            category_revenue[category] = category_revenue.get(category, 0) + rev

    top_products = sorted(product_sales.values(), key=lambda x: x["qty"], reverse=True)[:6]
    top_categories = sorted(
        [{"category": k, "revenue": v} for k, v in category_revenue.items()],
        key=lambda x: x["revenue"], reverse=True
    )[:6]

    return {
        "total_orders": total,
        "pending_orders": pending,
        "approved_orders": approved,
        "total_revenue": revenue,
        "product_count": product_count,
        "top_products": top_products,
        "top_categories": top_categories,
    }
