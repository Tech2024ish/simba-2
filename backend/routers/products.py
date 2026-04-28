from fastapi import APIRouter, Query, Header, HTTPException
from supabase import create_client
from pydantic import BaseModel
from typing import Optional
import os

router = APIRouter()
sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

def require_market_rep(token: str):
    try:
        user = sb.auth.get_user(token).user
    except Exception:
        raise HTTPException(status_code=401, detail="Unauthorized")
    profile = sb.table("profiles").select("role").eq("id", user.id).single().execute()
    if profile.data.get("role") != "market_rep":
        raise HTTPException(status_code=403, detail="Market reps only")
    return user

class ProductBody(BaseModel):
    name: str
    price: float
    category: str
    unit: str = "Pcs"
    image: Optional[str] = None
    in_stock: bool = True

def get_next_product_id() -> int:
    result = sb.table("products").select("id").order("id", desc=True).limit(1).execute()
    if result.data:
        return int(result.data[0]["id"]) + 1
    return 1

@router.get("")
def list_products(
    category: str = None,
    search: str = None,
    page: int = 1,
    limit: int = 20,
    sort: str = None
):
    query = sb.table("products").select("*", count="exact")
    if category:
        query = query.eq("category", category)
    if search:
        query = query.ilike("name", f"%{search}%")
    if sort == "price_asc":
        query = query.order("price", desc=False)
    elif sort == "price_desc":
        query = query.order("price", desc=True)
    elif sort == "name_asc":
        query = query.order("name", desc=False)
    else:
        query = query.order("id")
    offset = (page - 1) * limit
    result = query.range(offset, offset + limit - 1).execute()
    return {
        "products": result.data,
        "total": result.count,
        "page": page,
        "limit": limit,
        "pages": -(-result.count // limit) if result.count else 0
    }

@router.get("/categories")
def get_categories():
    result = sb.table("products").select("category").execute()
    from collections import Counter
    counts = Counter(p["category"] for p in result.data)
    return [{"name": cat, "count": count} for cat, count in sorted(counts.items())]

@router.get("/{product_id}")
def get_product(product_id: int):
    result = sb.table("products").select("*").eq("id", product_id).single().execute()
    return result.data

@router.post("")
def create_product(body: ProductBody, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    require_market_rep(token)
    result = sb.table("products").insert({
        "id": get_next_product_id(),
        "name": body.name,
        "price": body.price,
        "category": body.category,
        "unit": body.unit,
        "image": body.image or "",
        "in_stock": body.in_stock,
    }).execute()
    return result.data[0]

@router.put("/{product_id}")
def update_product(product_id: int, body: ProductBody, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    require_market_rep(token)
    result = sb.table("products").update({
        "name": body.name,
        "price": body.price,
        "category": body.category,
        "unit": body.unit,
        "image": body.image or "",
        "in_stock": body.in_stock,
    }).eq("id", product_id).execute()
    return result.data[0]

@router.delete("/{product_id}")
def delete_product(product_id: int, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    require_market_rep(token)
    sb.table("products").delete().eq("id", product_id).execute()
    return {"ok": True}
