# LetMeCook

A personal recipe and ingredient management app with a Factorio-inspired UI.

## Stack

- **Backend:** Node.js + Express + SQLite (better-sqlite3)
- **Frontend:** Vue 3 + Vue Router + Vite

## Getting started

```bash
npm install
cd server && npm install
cd ../client && npm install
```

```bash
# Dev mode — Express on :3000, Vite on :5173
npm run dev

# Production build + start — everything on :3000
npm run build
NODE_ENV=production npm start
```

## Features

- **Ingredients** — track stock quantities, units, categories, and expiry dates
- **Recipes** — link ingredients with required quantities; see at a glance if you have everything in stock
- **Cook Log** — log a cook session, deduct ingredient quantities from stock
- **Dashboard** — overview of stock stats, expiring items, and recent dishes
