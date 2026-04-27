import json
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_SERVICE_KEY"]
sb = create_client(url, key)

with open("../simba_products.json") as f:
    data = json.load(f)

products = data["products"]
batch_size = 100
for i in range(0, len(products), batch_size):
    batch = products[i:i+batch_size]
    rows = [{
        "id": p["id"],
        "name": p["name"],
        "price": p["price"],
        "category": p["category"],
        "subcategory_id": p["subcategoryId"],
        "in_stock": p["inStock"],
        "image": p["image"],
        "unit": p.get("unit", "Pcs")
    } for p in batch]
    sb.table("products").upsert(rows).execute()
    print(f"Seeded {i+len(batch)}/{len(products)}")

print("Done!")
