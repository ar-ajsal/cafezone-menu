# QR Digital Menu System

## Overview

A full-stack QR code digital menu system for restaurants. Customers scan a QR code to view the restaurant menu on their mobile device. Restaurant owners manage everything from the admin panel.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **QR Code**: qrcode.react
- **Routing**: wouter

## Features

### Customer Menu (`/menu/:restaurantId`)
- Mobile-first design matching reference design
- Special Offers banner with offer count badge
- Horizontal filter pills: All / Veg / Non / Beverage
- Left sidebar with category thumbnails and active highlighting
- Menu items with veg/non-veg indicators, COMBO badges, price in ₹
- Grid/list view toggle
- Filter & Sort bottom sheet (Recommended, Price Low-High, Price High-Low, Spicy filter)
- Smooth scroll-based category highlighting

### Admin Panel (`/admin`)
- Dashboard with real stats (total items, categories, offers, veg/non-veg/combo counts)
- Restaurant profile management
- Category management (add/edit/delete with images)
- Menu item management (all fields: name, price, type, combo, spicy, available, image)
- Offers management (title, description, discount %, valid until)
- QR code generator with download capability

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── qr-menu/            # React + Vite frontend (customer + admin)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/
│       └── src/schema/
│           ├── restaurants.ts
│           ├── categories.ts
│           ├── menu_items.ts
│           └── offers.ts
```

## Routes

- `GET /api/restaurants` — list restaurants
- `POST /api/restaurants` — create restaurant
- `GET /api/restaurants/:id` — get restaurant
- `PUT /api/restaurants/:id` — update restaurant
- `GET /api/restaurants/:restaurantId/menu` — full public menu
- `GET /api/restaurants/:restaurantId/categories` — list categories
- `POST /api/restaurants/:restaurantId/categories` — create category
- `PUT /api/categories/:id` — update category
- `DELETE /api/categories/:id` — delete category
- `GET /api/restaurants/:restaurantId/items` — list items (with ?type, ?categoryId filters)
- `POST /api/restaurants/:restaurantId/items` — create item
- `PUT /api/items/:id` — update item
- `DELETE /api/items/:id` — delete item
- `GET /api/restaurants/:restaurantId/offers` — list offers
- `POST /api/restaurants/:restaurantId/offers` — create offer
- `PUT /api/offers/:id` — update offer
- `DELETE /api/offers/:id` — delete offer
- `GET /api/restaurants/:restaurantId/qr` — QR code URL data
- `GET /api/restaurants/:restaurantId/stats` — dashboard stats

## Database Tables

- `restaurants` — restaurant profiles with slug
- `categories` — menu categories with images and sort order
- `menu_items` — items with type (veg/non-veg/beverage), combo flags, pricing
- `offers` — special offers with discount percent and validity

## Seed Data

Restaurant "Snacky Cafe" (id=1) is pre-seeded with:
- 6 categories: Combo Deals, Shakes, Juice, Tea, Falooda, Mojito
- 18 menu items with realistic prices and Unsplash images
- 1 offer: Birthday Offer (10% off)
