"""
Fetches real product images from Open Food Facts API for each product.
Generates a SQL file to update Supabase products table.
Run: python fetch_images.py
Then paste the output SQL into Supabase SQL Editor.
"""
import json
import urllib.request
import urllib.parse
import time
import sys

CATEGORY_FALLBACKS = {
    "Alcoholic Drinks":       "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop",
    "Baby Products":          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop",
    "Cleaning & Sanitary":    "https://images.unsplash.com/photo-1585421514284-efb74320b7c3?w=400&h=400&fit=crop",
    "Cosmetics & Personal Care": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop",
    "Food Products":          "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop",
    "General":                "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?w=400&h=400&fit=crop",
    "Kitchen Storage":        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
    "Kitchenware & Electronics": "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&h=400&fit=crop",
    "Pet Care":               "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop",
    "Sports & Wellness":      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop",
}

def search_off(name):
    """Search Open Food Facts for a product image by name."""
    try:
        query = urllib.parse.urlencode({
            'search_terms': name,
            'json': '1',
            'page_size': '3',
            'fields': 'product_name,image_front_small_url,image_small_url',
        })
        url = f"https://world.openfoodfacts.org/cgi/search.pl?{query}"
        req = urllib.request.Request(url, headers={'User-Agent': 'SimbaApp/1.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
        for p in data.get('products', []):
            img = p.get('image_front_small_url') or p.get('image_small_url')
            if img and img.startswith('http'):
                return img
    except Exception:
        pass
    return None

def main():
    with open('simba_products.json', encoding='utf-8') as f:
        data = json.load(f)

    products = data['products']
    total = len(products)
    updates = []
    found = 0

    print(f"Searching images for {total} products...", file=sys.stderr)

    for i, product in enumerate(products):
        img = search_off(product['name'])
        if img:
            found += 1
        else:
            img = CATEGORY_FALLBACKS.get(product['category'],
                  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop")

        updates.append((product['id'], img))

        if (i + 1) % 20 == 0:
            print(f"  {i+1}/{total} done ({found} real images so far)...", file=sys.stderr)

        time.sleep(0.3)

    # Write SQL
    with open('update_images.sql', 'w', encoding='utf-8') as f:
        f.write("-- Run this in Supabase SQL Editor to update product images\n")
        for pid, url in updates:
            safe = url.replace("'", "''")
            f.write(f"UPDATE products SET image = '{safe}' WHERE id = {pid};\n")

    print(f"\nDone! {found}/{total} real images found.", file=sys.stderr)
    print(f"SQL written to update_images.sql", file=sys.stderr)

if __name__ == '__main__':
    main()
