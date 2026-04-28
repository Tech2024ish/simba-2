from fastapi import APIRouter, Header, HTTPException
from supabase import create_client
from pydantic import BaseModel
from typing import List, Any
import os

router = APIRouter()
sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

def get_user(token: str):
    try:
        auth_response = sb.auth.get_user(token)
        user = auth_response.user
        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Unauthorized")

class OrderCreate(BaseModel):
    items: List[Any]
    total: float
    payment_method: str
    phone: str
    address: str
    city: str
    customer_name: str
    customer_email: str

@router.post("")
def create_order(order: OrderCreate, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user = get_user(token)
    if not order.items:
        raise HTTPException(status_code=400, detail="Order must include at least one item")
    if order.total <= 0:
        raise HTTPException(status_code=400, detail="Order total must be greater than zero")

    try:
        result = sb.table("orders").insert({
            "user_id": user.id,
            "customer_name": order.customer_name.strip(),
            "customer_email": order.customer_email.strip(),
            "items": order.items,
            "total": order.total,
            "payment_method": order.payment_method.strip(),
            "phone": order.phone.strip(),
            "address": order.address.strip(),
            "city": order.city.strip(),
            "status": "pending"
        }).execute()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to create order: {exc}")

    if not result.data:
        raise HTTPException(status_code=500, detail="Order could not be created")
    return result.data[0]

@router.get("")
def list_orders(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user = get_user(token)
    profile = sb.table("profiles").select("role").eq("id", user.id).single().execute()
    if profile.data["role"] == "market_rep":
        result = sb.table("orders").select("*").order("created_at", desc=True).execute()
    else:
        result = sb.table("orders").select("*").eq("user_id", user.id).order("created_at", desc=True).execute()
    return result.data

@router.put("/{order_id}")
def update_order(order_id: str, body: dict, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user = get_user(token)
    profile = sb.table("profiles").select("role").eq("id", user.id).single().execute()
    if profile.data["role"] != "market_rep":
        raise HTTPException(status_code=403, detail="Market reps only")
    result = sb.table("orders").update({"status": body["status"]}).eq("id", order_id).execute()
    return result.data[0]
