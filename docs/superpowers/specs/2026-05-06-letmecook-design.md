# LetMeCook — Design Spec

**Date:** 2026-05-06

## Overview

A personal recipe and ingredient management web app with a Factorio-inspired UI. Single Node.js server that serves both the API and the built Vue 3 frontend. Designed for local personal use.

---

## Architecture

### Stack

- **Backend:** Node.js + Express + better-sqlite3
- **Frontend:** Vue 3 + Vue Router + Vite
- **Database:** SQLite (single file `server/letmecook.db`)

### Project Structure

```
LetMeCook/
├── server/
│   ├── index.js                      ← entry point, starts Express
│   ├── app.js                        ← Express app setup, middleware, route mounting
│   ├── db.js                         ← SQLite connection singleton
│   ├── routes/
│   │   ├── ingredients.js
│   │   ├── recipes.js
│   │   └── cookLog.js
│   ├── controllers/
│   │   ├── ingredientsController.js
│   │   ├── recipesController.js
│   │   └── cookLogController.js
│   ├── services/
│   │   ├── ingredientsService.js     ← expiry checks, stock queries
│   │   ├── recipesService.js         ← stock check, ingredient deduction
│   │   └── cookLogService.js
│   ├── repositories/
│   │   ├── ingredientsRepository.js  ← all SQL for ingredients
│   │   ├── recipesRepository.js
│   │   └── cookLogRepository.js
│   └── letmecook.db
├── client/
│   ├── src/
│   │   ├── main.js
│   │   ├── App.vue                   ← layout shell (toolbar + router-view)
│   │   ├── router.js                 ← 4 routes
│   │   ├── api.js                    ← fetch wrapper for all API calls
│   │   ├── views/
│   │   │   ├── Dashboard.vue
│   │   │   ├── Ingredients.vue
│   │   │   ├── Recipes.vue
│   │   │   ├── RecipeDetail.vue
│   │   │   └── CookLog.vue
│   │   └── components/
│   │       ├── CookDeductModal.vue   ← centered ingredient deduction popup
│   │       ├── StepList.vue          ← steps + substeps with checkboxes
│   │       └── StockBadge.vue        ← green/red ingredient status badge
│   └── vite.config.js                ← proxies /api/* to Express in dev
├── package.json                      ← root scripts: dev, build, start
└── ui.md
```

### Dev vs Prod

- **Dev:** `npm run dev` starts both Vite (port 5173) and Express (port 3000). Vite proxies `/api/*` to Express.
- **Prod:** `npm run build` compiles Vue into `client/dist`. `npm start` runs Express, which serves `client/dist` as static files — one process, one port.

---

## Data Model

### `ingredients`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | auto-increment |
| name | TEXT NOT NULL | |
| quantity | REAL NOT NULL | current stock amount |
| unit | TEXT NOT NULL | g, ml, pieces, etc. |
| expiration_date | TEXT | ISO date string, nullable |
| category | TEXT | dairy, meat, vegetables, etc. |
| created_at | TEXT | ISO datetime |

### `recipes`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| name | TEXT NOT NULL | |
| steps | TEXT NOT NULL | JSON array of step objects (see below) |
| prep_time | INTEGER | minutes |
| cook_time | INTEGER | minutes |
| servings | INTEGER | |
| notes | TEXT | nullable |
| created_at | TEXT | ISO datetime |

**Step object structure:**
```json
{
  "text": "Brown the ground beef and build the sauce.",
  "substeps": [
    "Heat olive oil in a pan over medium-high heat.",
    "Add ground beef, break apart, cook until browned."
  ]
}
```
Substeps are optional. A step with no substeps has an empty array.

### `recipe_ingredients`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| recipe_id | INTEGER FK | references recipes(id) |
| ingredient_id | INTEGER FK | references ingredients(id) |
| quantity | REAL NOT NULL | required amount |
| unit | TEXT NOT NULL | |

### `cook_log`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| recipe_id | INTEGER FK | references recipes(id) |
| cooked_at | TEXT | ISO date |

When a cook is logged, the deduction popup applies changes directly to `ingredients.quantity`. No separate deduction history is stored.

---

## API Routes

### Ingredients
```
GET    /api/ingredients           List all ingredients
POST   /api/ingredients           Create ingredient
PUT    /api/ingredients/:id       Update ingredient
DELETE /api/ingredients/:id       Delete ingredient
```

### Recipes
```
GET    /api/recipes               List all recipes
GET    /api/recipes/:id           Get recipe with per-ingredient stock check
POST   /api/recipes               Create recipe (with ingredient list)
PUT    /api/recipes/:id           Update recipe
DELETE /api/recipes/:id           Delete recipe
```

The `GET /api/recipes/:id` response includes a `canCook` boolean and a `ingredients` array where each entry has `hasEnough: boolean` and `inStock: number`.

### Cook Log
```
GET    /api/cook-log              List all cook log entries (with recipe name)
POST   /api/cook-log              Log a cook + apply ingredient deductions
DELETE /api/cook-log/:id          Delete a cook log entry
```

The `POST /api/cook-log` body includes `{ recipeId, cookedAt, deductions: [{ ingredientId, quantityUsed }] }`.

### Dashboard
```
GET    /api/dashboard             Returns { recentIngredients, expiringIngredients, recentCooks }
```

`expiringIngredients` = ingredients with `expiration_date` within the next 14 days, sorted by soonest first.

---

## Pages

### Dashboard
- Stat bar: total ingredients, expiring count, recipe count, ready-to-cook count, total cooks
- Two side-by-side panels: Recently Added Ingredients + Expiring Soon
- Recent Dishes row: cards showing recipe name, last cooked date, and ready/missing status

### Ingredients
- Full list of ingredients with quantity, unit, category, expiration date
- Add / edit / delete actions

### Recipes
- List of all recipes with stock status indicator
- Click a recipe → RecipeDetail view

### RecipeDetail
- **Left panel:** photo (placeholder if none), recipe name, prep/cook time, servings, stock status bar (green if all in stock, red if missing), ingredient list with per-item stock check
- **Right panel:** step list with checkboxes (progress bar at top), steps support nested substeps (each with their own checkbox), active step highlighted in orange
- "Log Cook" button triggers CookDeductModal

### CookLog
- Chronological list of all logged cooks with recipe name and date
- Delete entries

---

## Key Interactions

### Stock Check (Recipe Detail)
`recipesService.checkStock(recipeId)` fetches `recipe_ingredients` joined with `ingredients`, compares `required quantity` vs `current quantity`, returns `canCook` and per-ingredient `hasEnough`.

### Cook Deduction Modal
Centered overlay modal. Pre-filled with each required ingredient and its recipe quantity. User can adjust each quantity (partial use) or click "USE ALL" to keep the full amount. On confirm, sends `POST /api/cook-log` with the adjusted deductions, which calls `ingredientsService.applyDeductions()` to subtract from stock.

### Step Progress
Checkbox state is local to the Vue component (not persisted). Checking a step/substep updates a local progress counter. The progress bar reflects completed main steps only.

---

## UI

Factorio-inspired style as defined in `ui.md`, refined to match actual Factorio aesthetics:
- Background: `#1e1e1e`, panel background: `#333`, toolbar: `#3b3b3b`
- Borders: `#555` (thin, 1px, grey — not orange)
- Text: `#d8d8d0` (clean off-white)
- Orange `#f0a030` used sparingly: active nav tab, section arrows, stat highlight values
- Green `#70d050` for "in stock" / "ready to cook"
- Red `#ff6050` for "missing" / "expiring"
- Font: Titillium Web (clean sans-serif, not monospace)
- Alternating table rows, flat panels, no gradients or textures
