# 🦁 Simba Supermarket — Rwanda's Online Grocery Platform

Live Demo: [simba-2-nu.vercel.app](https://simba-2-nu.vercel.app)

## Overview

Simba Supermarket is a full-stack e-commerce web application built for Rwanda's largest supermarket chain. It enables customers to browse 552+ real products, place orders, and track deliveries — all from their browser.

## Features

### Buyer Experience
- Browse 552+ real products from Simba Supermarket, Kigali
- Filter by 10 categories, sort by price/name, search by keyword
- Product detail pages with related products
- Shopping cart with quantity management
- Checkout with delivery info and payment method selection (MTN MoMo, Cash, Card)
- Order success confirmation

### Market Rep Dashboard (`/admin`)
- Secure login required (role: `market_rep`)
- View all orders with status badges (Pending / Approved / Rejected / Delivered)
- **Accept orders** → click "Approve" on any Pending order
- **Reject orders** → click "Reject" on any Pending order
- **Mark as Delivered** → click "Mark Delivered" on Approved orders
- Product management: Add, Edit, Delete products
- Revenue and order statistics

### Multi-language Support (EN / FR / RW)
The app is fully translated in **3 languages**:
| Language | Code | Label |
|----------|------|-------|
| English | `en` | 🇬🇧 English |
| French | `fr` | 🇫🇷 Français |
| Kinyarwanda | `rw` | 🇷🇼 Kinyarwanda |

Switch language using the **🇬🇧 EN / 🇫🇷 FR / 🇷🇼 RW** dropdown in the top navigation bar. All pages, buttons, labels, and messages are translated including the dashboard.

### Store Locator
- 10 branch locations across Rwanda (Kigali + Gisenyi)
- Interactive Google Maps embed — select a branch from the dropdown to view its map
- "Get Directions" links for each branch

### Additional Pages
- `/about` — Company history, mission, and statistics
- `/reviews` — Customer reviews with star ratings (submit your own when logged in)
- `/contact` — Contact form with name, email, subject, and message

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | FastAPI (Python) deployed on Render |
| Database | Supabase (PostgreSQL + Auth) |
| Hosting | Vercel (frontend) + Render (backend) |
| Payments | MTN MoMo (UI integrated) |

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Environment Variables

**Frontend** (`frontend/.env`):
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=your_backend_url
```

**Backend** (`.env`):
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (with pagination, filter, search) |
| GET | `/api/products/categories` | Get product categories |
| GET | `/api/products/{id}` | Get single product |
| POST | `/api/products` | Create product (market_rep only) |
| PUT | `/api/products/{id}` | Update product (market_rep only) |
| DELETE | `/api/products/{id}` | Delete product (market_rep only) |
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | List orders |
| PUT | `/api/orders/{id}` | Update order status (market_rep only) |
| GET | `/api/dashboard/stats` | Dashboard statistics (market_rep only) |
| POST | `/api/contact` | Submit contact message |
| GET | `/api/reviews` | List customer reviews |
| POST | `/api/reviews` | Submit a review |

## Branches

| Branch | Location |
|--------|----------|
| City Center (UTC) | Union Trade Centre, KN 4 Ave, Kigali |
| KN 5 Road | KN 5 Rd, Kigali |
| Kimironko | 342F+3V5, Kimironko, Kigali |
| Nyamirambo | 23H4+26V, Kigali |
| Remera | 24Q5+R2R, Kigali |
| Gisozi | 24G3+MCV, Kigali |
| Kicukiro | 24J3+Q3, Kigali |
| KK 35 | KK 35 Ave, Kigali |
| KG 541 | KG 541 St, Kigali |
| Gisenyi | 8754+P7W, Gisenyi (Rubavu) |

## Author

**ISHIMWE Jean Claude** — University of Rwanda
