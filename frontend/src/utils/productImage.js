const CATEGORY_PHOTOS = {
  "Alcoholic Drinks": [
    "photo-1510812431401-41d2bd2722f3","photo-1436076863939-06870fe779c2",
    "photo-1569529465841-dfecdab7503b","photo-1572490122747-3e9613d8b913",
    "photo-1527281400683-1aae777175f8","photo-1574096079513-d8259312b785",
  ],
  "Baby Products": [
    "photo-1515488042361-ee00e0ddd4e4","photo-1555252333-9f8e92e65df9",
    "photo-1584553421349-3557471bed79","photo-1519689680058-324335c77eba",
  ],
  "Cleaning & Sanitary": [
    "photo-1585421514284-efb74320b7c3","photo-1563453392212-326f5e854473",
    "photo-1556909114-44e3e70034e2","photo-1558618666-fcd25c85cd64",
  ],
  "Cosmetics & Personal Care": [
    "photo-1522335789203-aabd1fc54bc9","photo-1571781926291-c477ebfd024b",
    "photo-1596462502278-27bfdc403348","photo-1512207736890-6ffed8a84e8d",
    "photo-1556228453-efd6c1ff04f6","photo-1570194065650-d99fb4bedf0a",
  ],
  "Food Products": [
    "photo-1542838132-92c53300491e","photo-1512621776951-a57141f2eefd",
    "photo-1498837167922-ddd27525d352","photo-1546069901-ba9599a7e63c",
    "photo-1567306226416-28f0efdc88ce","photo-1540420773420-3366772f4999",
  ],
  "General": [
    "photo-1604719312566-8912e9c8a213","photo-1578916171728-46686eac8d58",
    "photo-1579113800032-c38bd7635818","photo-1556742393-d75f468bfcb0",
  ],
  "Kitchen Storage": [
    "photo-1556909114-f6e7ad7d3136","photo-1547592180-85f173990554",
    "photo-1565183928294-7063f23ce0f8","photo-1584308666744-24d5c474f2ae",
  ],
  "Kitchenware & Electronics": [
    "photo-1556909172-54557c7e4fb7","photo-1528735602780-2552fd46c7af",
    "photo-1590794056226-79ef3a8147e1","photo-1585771724684-38269d6639fd",
  ],
  "Pet Care": [
    "photo-1601758228041-f3b2795255f1","photo-1548199973-03cce0bbc87b",
    "photo-1514888286974-6c03e2ca1dba","photo-1450778869180-41d0601e046e",
  ],
  "Sports & Wellness": [
    "photo-1571019614242-c5c5dee9f50b","photo-1517836357463-d25dfeac3438",
    "photo-1534438327276-14e5300c3a48","photo-1576678927484-cc907957088c",
  ],
}

export function getProductImage(product, size = 400) {
  if (!product.image || product.image.includes('placehold.co')) {
    const photos = CATEGORY_PHOTOS[product.category] || CATEGORY_PHOTOS["Food Products"]
    const photoId = photos[product.id % photos.length]
    return `https://images.unsplash.com/${photoId}?w=${size}&h=${size}&fit=crop&auto=format`
  }
  return product.image
}
