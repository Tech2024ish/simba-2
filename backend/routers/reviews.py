from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from supabase import create_client
import os

router = APIRouter()
sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

class ReviewCreate(BaseModel):
    user_id: Optional[str] = None
    user_name: str
    rating: int
    comment: str

@router.get("")
def list_reviews():
    result = sb.table("reviews").select("*").order("created_at", desc=True).execute()
    return result.data

@router.post("")
def create_review(body: ReviewCreate):
    result = sb.table("reviews").insert({
        "user_id": body.user_id,
        "user_name": body.user_name.strip(),
        "rating": body.rating,
        "comment": body.comment.strip(),
    }).execute()
    return result.data[0]
