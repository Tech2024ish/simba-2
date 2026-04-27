from fastapi import APIRouter, Header, HTTPException
from supabase import create_client
import os

router = APIRouter()
sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

def require_market_rep(token: str):
    try:
        user = sb.auth.get_user(token).user
        profile = sb.table("profiles").select("role").eq("id", user.id).single().execute()
        if profile.data["role"] != "market_rep":
            raise HTTPException(status_code=403, detail="Market reps only")
        return user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Unauthorized")

@router.get("/stats")
def get_stats(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    require_market_rep(token)
    orders = sb.table("orders").select("*").execute().data
    total = len(orders)
    pending = sum(1 for o in orders if o["status"] == "pending")
    approved = sum(1 for o in orders if o["status"] in ("approved", "delivered"))
    revenue = sum(o["total"] for o in orders if o["status"] != "rejected")
    product_count = sb.table("products").select("id", count="exact").execute().count
    return {
        "total_orders": total,
        "pending_orders": pending,
        "approved_orders": approved,
        "total_revenue": revenue,
        "product_count": product_count
    }
