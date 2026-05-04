import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import products, orders, dashboard, contact, reviews, ai

app = FastAPI(title="Simba 2.0 API")

frontend_url = os.environ.get("FRONTEND_URL", "*")
if frontend_url.startswith("http://localhost"):
    origins = [f"http://localhost:{p}" for p in range(5170, 5180)]
else:
    origins = [frontend_url] if frontend_url != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(contact.router, prefix="/api/contact", tags=["contact"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(ai.router, prefix="/api/ai/chat", tags=["ai"])

@app.get("/")
def root():
    return {"status": "ok", "service": "Simba 2.0 API"}
