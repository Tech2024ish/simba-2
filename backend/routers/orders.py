from fastapi import APIRouter, Header, HTTPException
from supabase import create_client
from pydantic import BaseModel
from typing import List, Any
import os

router = APIRouter()
sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

def get_user(token: str):
    try:
        user = sb.auth.get_user(token)
        return user.user
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
    result = sb.table("orders").insert({
        "user_id": user.id,
        "customer_name": order.customer_name,
        "customer_email": order.customer_email,
        "items": order.items,
        "total": order.total,
        "payment_method": order.payment_method,
        "phone": order.phone,
        "address": order.address,
        "city": order.city,
        "status": "pending"
    }).execute()
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
