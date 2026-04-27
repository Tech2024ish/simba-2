from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import products, orders, dashboard
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Simba 2.0 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

@app.get("/")
def root():
    return {"status": "ok", "service": "Simba 2.0 API"}
