from fastapi import APIRouter, Header, HTTPException
from supabase import create_client
from pydantic import BaseModel, EmailStr, Field
from typing import List, Literal, Optional
import os

router = APIRouter()
sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

VALID_PAYMENT_METHODS = {"momo", "cash", "card"}


def get_bearer_token(authorization: Optional[str]) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    prefix = "bearer "
    if not authorization.lower().startswith(prefix):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization[len(prefix):].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")

    return token
def get_user(token: str):
    try:
        auth_response = sb.auth.get_user(token)
        user = auth_response.user
        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Unauthorized")

class OrderItem(BaseModel):
    id: int | str
    name: str = Field(min_length=1)
    price: float = Field(gt=0)
    qty: int = Field(gt=0)
    image: str = ""


class OrderCreate(BaseModel):
    items: List[OrderItem]
    total: float = Field(gt=0)
    payment_method: Literal["momo", "cash", "card"]
    phone: str = Field(min_length=1)
    address: str = Field(min_length=1)
    city: str = Field(min_length=1)
    customer_name: str = Field(min_length=1)
    customer_email: EmailStr

@router.post("")
def create_order(order: OrderCreate, authorization: Optional[str] = Header(default=None)):
    token = get_bearer_token(authorization)
    user = get_user(token)
    if not order.items:
        raise HTTPException(status_code=400, detail="Order must include at least one item")
    if order.payment_method not in VALID_PAYMENT_METHODS:
        raise HTTPException(status_code=400, detail="Invalid payment method")
    server_total = round(sum(item.price * item.qty for item in order.items), 2)
    if server_total <= 0:
        raise HTTPException(status_code=400, detail="Order total must be greater than zero")
    if abs(server_total - float(order.total)) > 0.01:
        raise HTTPException(status_code=400, detail="Order total does not match cart items")

    try:
        result = sb.table("orders").insert({
            "user_id": user.id,
            "customer_name": order.customer_name.strip(),
            "customer_email": order.customer_email.strip(),
            "items": [item.model_dump() for item in order.items],
            "total": server_total,
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
def list_orders(authorization: Optional[str] = Header(default=None)):
    token = get_bearer_token(authorization)
    user = get_user(token)
    profile = sb.table("profiles").select("role").eq("id", user.id).single().execute()
    if profile.data["role"] == "market_rep":
        result = sb.table("orders").select("*").order("created_at", desc=True).execute()
    else:
        result = sb.table("orders").select("*").eq("user_id", user.id).order("created_at", desc=True).execute()
    return result.data

@router.put("/{order_id}")
def update_order(order_id: str, body: dict, authorization: Optional[str] = Header(default=None)):
    token = get_bearer_token(authorization)
    user = get_user(token)
    profile = sb.table("profiles").select("role").eq("id", user.id).single().execute()
    if profile.data["role"] != "market_rep":
        raise HTTPException(status_code=403, detail="Market reps only")
    result = sb.table("orders").update({"status": body["status"]}).eq("id", order_id).execute()
    return result.data[0]
