from fastapi import APIRouter, Query
from supabase import create_client
import os

router = APIRouter()
sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

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
