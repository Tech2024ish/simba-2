from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from supabase import create_client
import os

router = APIRouter()
sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

class ContactCreate(BaseModel):
    name: str
    email: str
    subject: Optional[str] = ""
    message: str
    user_id: Optional[str] = None

@router.post("")
def create_contact_message(body: ContactCreate):
    result = sb.table("contact_messages").insert({
        "name": body.name.strip(),
        "email": body.email.strip(),
        "subject": (body.subject or "").strip(),
        "message": body.message.strip(),
        "user_id": body.user_id,
    }).execute()
    return result.data[0]
