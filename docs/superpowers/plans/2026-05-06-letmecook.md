# LetMeCook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal recipe and ingredient management web app with a Factorio-inspired UI, served by a single Node.js + Express + SQLite backend that also serves the compiled Vue 3 frontend.

**Architecture:** Express serves REST API routes under `/api/*` and serves the built Vue 3 frontend as static files in production. In development, Vite runs on port 5173 and proxies `/api/*` to Express on port 3000. The backend follows a routes → controllers → services → repositories layered architecture with better-sqlite3.

**Tech Stack:** Node.js, Express 4, better-sqlite3, Vue 3, Vue Router 4, Vite, concurrently, nodemon, Jest, Supertest

---

## File Map

**Server (created)**
- `server/index.js` — starts Express, binds port
- `server/app.js` — Express app setup, middleware, static files, route mounting
- `server/db.js` — SQLite singleton + schema creation
- `server/routes/ingredients.js`
- `server/routes/recipes.js`
- `server/routes/cookLog.js`
- `server/routes/dashboard.js`
- `server/controllers/ingredientsController.js`
- `server/controllers/recipesController.js`
- `server/controllers/cookLogController.js`
- `server/controllers/dashboardController.js`
- `server/services/ingredientsService.js`
- `server/services/recipesService.js`
- `server/services/cookLogService.js`
- `server/services/dashboardService.js`
- `server/repositories/ingredientsRepository.js`
- `server/repositories/recipesRepository.js`
- `server/repositories/cookLogRepository.js`
- `server/__tests__/ingredients.test.js`
- `server/__tests__/recipes.test.js`
- `server/__tests__/cookLog.test.js`

**Client (created)**
- `client/index.html`
- `client/vite.config.js`
- `client/package.json`
- `client/src/main.js`
- `client/src/App.vue`
- `client/src/router.js`
- `client/src/api.js`
- `client/src/styles/theme.css`
- `client/src/views/Dashboard.vue`
- `client/src/views/Ingredients.vue`
- `client/src/views/Recipes.vue`
- `client/src/views/RecipeDetail.vue`
- `client/src/views/CookLog.vue`
- `client/src/components/CookDeductModal.vue`
- `client/src/components/StepList.vue`
- `client/src/components/StockBadge.vue`

**Root (created)**
- `package.json` — root scripts

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `server/package.json`
- Create: `client/package.json`
- Create: `client/vite.config.js`
- Create: `client/index.html`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "letmecook",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "nodemon server/index.js",
    "dev:client": "cd client && npm run dev",
    "build": "cd client && npm run build",
    "start": "node server/index.js",
    "test": "cd server && npm test"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "nodemon": "^3.0.3"
  }
}
```

- [ ] **Step 2: Create server/package.json**

```json
{
  "name": "letmecook-server",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "jest --runInBand"
  },
  "dependencies": {
    "better-sqlite3": "^9.4.3",
    "cors": "^2.8.5",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.4"
  },
  "jest": {
    "testEnvironment": "node",
    "testMatch": ["**/__tests__/**/*.test.js"]
  }
}
```

- [ ] **Step 3: Create client/package.json**

```json
{
  "name": "letmecook-client",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.21",
    "vue-router": "^4.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.4",
    "vite": "^5.1.6"
  }
}
```

- [ ] **Step 4: Create client/vite.config.js**

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    outDir: '../server/public',
    emptyOutDir: true
  }
})
```

- [ ] **Step 5: Create client/index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LetMeCook</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Titillium+Web:wght@400;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 6: Install dependencies**

```bash
npm install
cd server && npm install
cd ../client && npm install
```

- [ ] **Step 7: Commit**

```bash
git init
git add package.json server/package.json client/package.json client/vite.config.js client/index.html
git commit -m "feat: project scaffolding — root, server, client packages"
```

---

## Task 2: Database Setup

**Files:**
- Create: `server/db.js`

- [ ] **Step 1: Create server/db.js**

```js
const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'letmecook.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.prepare(`CREATE TABLE IF NOT EXISTS ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  expiration_date TEXT,
  category TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`).run()

db.prepare(`CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  steps TEXT NOT NULL DEFAULT '[]',
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`).run()

db.prepare(`CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL
)`).run()

db.prepare(`CREATE TABLE IF NOT EXISTS cook_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  cooked_at TEXT NOT NULL
)`).run()

module.exports = db
```

- [ ] **Step 2: Verify DB file is gitignored — create .gitignore**

```
server/letmecook.db
server/letmecook.db-shm
server/letmecook.db-wal
node_modules/
server/node_modules/
client/node_modules/
server/public/
.superpowers/
```

- [ ] **Step 3: Commit**

```bash
git add server/db.js .gitignore
git commit -m "feat: SQLite schema with ingredients, recipes, recipe_ingredients, cook_log"
```

---

## Task 3: Ingredients API

**Files:**
- Create: `server/repositories/ingredientsRepository.js`
- Create: `server/services/ingredientsService.js`
- Create: `server/controllers/ingredientsController.js`
- Create: `server/routes/ingredients.js`
- Create: `server/__tests__/ingredients.test.js`

- [ ] **Step 1: Create server/repositories/ingredientsRepository.js**

```js
const db = require('../db')

function findAll() {
  return db.prepare('SELECT * FROM ingredients ORDER BY created_at DESC').all()
}

function findById(id) {
  return db.prepare('SELECT * FROM ingredients WHERE id = ?').get(id)
}

function findExpiringSoon(withinDays = 14) {
  return db.prepare(`
    SELECT * FROM ingredients
    WHERE expiration_date IS NOT NULL
      AND expiration_date <= date('now', '+' || ? || ' days')
      AND expiration_date >= date('now')
    ORDER BY expiration_date ASC
  `).all(withinDays)
}

function findRecent(limit = 5) {
  return db.prepare('SELECT * FROM ingredients ORDER BY created_at DESC LIMIT ?').all(limit)
}

function create({ name, quantity, unit, expiration_date, category }) {
  const result = db.prepare(`
    INSERT INTO ingredients (name, quantity, unit, expiration_date, category)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, quantity, unit, expiration_date || null, category || null)
  return findById(result.lastInsertRowid)
}

function update(id, { name, quantity, unit, expiration_date, category }) {
  db.prepare(`
    UPDATE ingredients SET name = ?, quantity = ?, unit = ?, expiration_date = ?, category = ?
    WHERE id = ?
  `).run(name, quantity, unit, expiration_date || null, category || null, id)
  return findById(id)
}

function remove(id) {
  return db.prepare('DELETE FROM ingredients WHERE id = ?').run(id)
}

function deductQuantity(id, amount) {
  db.prepare('UPDATE ingredients SET quantity = MAX(0, quantity - ?) WHERE id = ?').run(amount, id)
}

module.exports = { findAll, findById, findExpiringSoon, findRecent, create, update, remove, deductQuantity }
```

- [ ] **Step 2: Create server/services/ingredientsService.js**

```js
const repo = require('../repositories/ingredientsRepository')

function listIngredients() {
  return repo.findAll()
}

function getExpiringSoon() {
  return repo.findExpiringSoon(14)
}

function getRecent(limit = 5) {
  return repo.findRecent(limit)
}

function createIngredient(data) {
  if (!data.name || data.name.trim() === '') throw new Error('Name is required')
  if (data.quantity == null || isNaN(data.quantity)) throw new Error('Quantity must be a number')
  if (!data.unit || data.unit.trim() === '') throw new Error('Unit is required')
  return repo.create(data)
}

function updateIngredient(id, data) {
  if (!repo.findById(id)) throw new Error('Ingredient not found')
  if (!data.name || data.name.trim() === '') throw new Error('Name is required')
  if (data.quantity == null || isNaN(data.quantity)) throw new Error('Quantity must be a number')
  if (!data.unit || data.unit.trim() === '') throw new Error('Unit is required')
  return repo.update(id, data)
}

function deleteIngredient(id) {
  if (!repo.findById(id)) throw new Error('Ingredient not found')
  return repo.remove(id)
}

function applyDeductions(deductions) {
  for (const { ingredientId, quantityUsed } of deductions) {
    repo.deductQuantity(ingredientId, quantityUsed)
  }
}

module.exports = { listIngredients, getExpiringSoon, getRecent, createIngredient, updateIngredient, deleteIngredient, applyDeductions }
```

- [ ] **Step 3: Create server/controllers/ingredientsController.js**

```js
const service = require('../services/ingredientsService')

function list(req, res) {
  res.json(service.listIngredients())
}

function create(req, res) {
  try {
    res.status(201).json(service.createIngredient(req.body))
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

function update(req, res) {
  try {
    res.json(service.updateIngredient(Number(req.params.id), req.body))
  } catch (e) {
    const status = e.message === 'Ingredient not found' ? 404 : 400
    res.status(status).json({ error: e.message })
  }
}

function remove(req, res) {
  try {
    service.deleteIngredient(Number(req.params.id))
    res.status(204).end()
  } catch (e) {
    res.status(404).json({ error: e.message })
  }
}

module.exports = { list, create, update, remove }
```

- [ ] **Step 4: Create server/routes/ingredients.js**

```js
const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/ingredientsController')

router.get('/', ctrl.list)
router.post('/', ctrl.create)
router.put('/:id', ctrl.update)
router.delete('/:id', ctrl.remove)

module.exports = router
```

- [ ] **Step 5: Create server/app.js**

```js
const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/ingredients', require('./routes/ingredients'))

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
  })
}

module.exports = app
```

- [ ] **Step 6: Create server/index.js**

```js
const app = require('./app')

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`LetMeCook server running on http://localhost:${PORT}`)
})
```

- [ ] **Step 7: Write tests — create server/__tests__/ingredients.test.js**

```js
const request = require('supertest')
const app = require('../app')
const db = require('../db')

beforeEach(() => {
  db.prepare('DELETE FROM ingredients').run()
})

describe('GET /api/ingredients', () => {
  it('returns empty array when no ingredients', async () => {
    const res = await request(app).get('/api/ingredients')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns all ingredients', async () => {
    db.prepare("INSERT INTO ingredients (name, quantity, unit) VALUES ('Flour', 500, 'g')").run()
    const res = await request(app).get('/api/ingredients')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].name).toBe('Flour')
  })
})

describe('POST /api/ingredients', () => {
  it('creates an ingredient', async () => {
    const res = await request(app)
      .post('/api/ingredients')
      .send({ name: 'Butter', quantity: 250, unit: 'g', category: 'Dairy' })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Butter')
    expect(res.body.id).toBeDefined()
  })

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/ingredients').send({ quantity: 100, unit: 'g' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })
})

describe('PUT /api/ingredients/:id', () => {
  it('updates an ingredient', async () => {
    const { lastInsertRowid } = db.prepare("INSERT INTO ingredients (name, quantity, unit) VALUES ('Salt', 100, 'g')").run()
    const res = await request(app)
      .put(`/api/ingredients/${lastInsertRowid}`)
      .send({ name: 'Salt', quantity: 50, unit: 'g' })
    expect(res.status).toBe(200)
    expect(res.body.quantity).toBe(50)
  })

  it('returns 404 for unknown id', async () => {
    const res = await request(app).put('/api/ingredients/9999').send({ name: 'X', quantity: 1, unit: 'g' })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/ingredients/:id', () => {
  it('deletes an ingredient', async () => {
    const { lastInsertRowid } = db.prepare("INSERT INTO ingredients (name, quantity, unit) VALUES ('Sugar', 200, 'g')").run()
    const res = await request(app).delete(`/api/ingredients/${lastInsertRowid}`)
    expect(res.status).toBe(204)
  })

  it('returns 404 for unknown id', async () => {
    const res = await request(app).delete('/api/ingredients/9999')
    expect(res.status).toBe(404)
  })
})
```

- [ ] **Step 8: Run tests**

```bash
cd server && npm test -- --testPathPattern=ingredients
```

Expected: 6 passing tests

- [ ] **Step 9: Commit**

```bash
git add server/
git commit -m "feat: ingredients CRUD API with tests"
```

---

## Task 4: Recipes API

**Files:**
- Create: `server/repositories/recipesRepository.js`
- Create: `server/services/recipesService.js`
- Create: `server/controllers/recipesController.js`
- Create: `server/routes/recipes.js`
- Create: `server/__tests__/recipes.test.js`

- [ ] **Step 1: Create server/repositories/recipesRepository.js**

```js
const db = require('../db')

function findAll() {
  return db.prepare('SELECT * FROM recipes ORDER BY created_at DESC').all()
    .map(r => ({ ...r, steps: JSON.parse(r.steps) }))
}

function findById(id) {
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id)
  if (!recipe) return null
  return { ...recipe, steps: JSON.parse(recipe.steps) }
}

function findRecent(limit = 5) {
  return db.prepare('SELECT * FROM recipes ORDER BY created_at DESC LIMIT ?').all(limit)
    .map(r => ({ ...r, steps: JSON.parse(r.steps) }))
}

function findIngredients(recipeId) {
  return db.prepare(`
    SELECT ri.*, i.name as ingredient_name, i.quantity as stock_quantity, i.unit as stock_unit
    FROM recipe_ingredients ri
    JOIN ingredients i ON i.id = ri.ingredient_id
    WHERE ri.recipe_id = ?
  `).all(recipeId)
}

function create({ name, steps, prep_time, cook_time, servings, notes, ingredients }) {
  const insert = db.transaction(() => {
    const { lastInsertRowid } = db.prepare(`
      INSERT INTO recipes (name, steps, prep_time, cook_time, servings, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, JSON.stringify(steps || []), prep_time || null, cook_time || null, servings || null, notes || null)
    const recipeId = lastInsertRowid
    for (const ing of (ingredients || [])) {
      db.prepare('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)')
        .run(recipeId, ing.ingredientId, ing.quantity, ing.unit)
    }
    return findById(recipeId)
  })
  return insert()
}

function update(id, { name, steps, prep_time, cook_time, servings, notes, ingredients }) {
  const doUpdate = db.transaction(() => {
    db.prepare('UPDATE recipes SET name = ?, steps = ?, prep_time = ?, cook_time = ?, servings = ?, notes = ? WHERE id = ?')
      .run(name, JSON.stringify(steps || []), prep_time || null, cook_time || null, servings || null, notes || null, id)
    db.prepare('DELETE FROM recipe_ingredients WHERE recipe_id = ?').run(id)
    for (const ing of (ingredients || [])) {
      db.prepare('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)')
        .run(id, ing.ingredientId, ing.quantity, ing.unit)
    }
    return findById(id)
  })
  return doUpdate()
}

function remove(id) {
  return db.prepare('DELETE FROM recipes WHERE id = ?').run(id)
}

module.exports = { findAll, findById, findRecent, findIngredients, create, update, remove }
```

- [ ] **Step 2: Create server/services/recipesService.js**

```js
const repo = require('../repositories/recipesRepository')

function listRecipes() {
  return repo.findAll().map(r => ({ ...r, ...checkStock(r.id) }))
}

function getRecipe(id) {
  const recipe = repo.findById(id)
  if (!recipe) throw new Error('Recipe not found')
  const ingredients = repo.findIngredients(id)
  const stockDetails = ingredients.map(ing => ({
    ...ing, hasEnough: ing.stock_quantity >= ing.quantity
  }))
  const canCook = stockDetails.length > 0 && stockDetails.every(i => i.hasEnough)
  return { ...recipe, ingredients: stockDetails, canCook }
}

function checkStock(id) {
  const ingredients = repo.findIngredients(id)
  if (ingredients.length === 0) return { canCook: false, missingCount: 0 }
  const missing = ingredients.filter(i => i.stock_quantity < i.quantity)
  return { canCook: missing.length === 0, missingCount: missing.length }
}

function createRecipe(data) {
  if (!data.name || data.name.trim() === '') throw new Error('Name is required')
  return repo.create(data)
}

function updateRecipe(id, data) {
  if (!repo.findById(id)) throw new Error('Recipe not found')
  if (!data.name || data.name.trim() === '') throw new Error('Name is required')
  return repo.update(id, data)
}

function deleteRecipe(id) {
  if (!repo.findById(id)) throw new Error('Recipe not found')
  return repo.remove(id)
}

module.exports = { listRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe }
```

- [ ] **Step 3: Create server/controllers/recipesController.js**

```js
const service = require('../services/recipesService')

function list(req, res) { res.json(service.listRecipes()) }

function get(req, res) {
  try { res.json(service.getRecipe(Number(req.params.id))) }
  catch (e) { res.status(404).json({ error: e.message }) }
}

function create(req, res) {
  try { res.status(201).json(service.createRecipe(req.body)) }
  catch (e) { res.status(400).json({ error: e.message }) }
}

function update(req, res) {
  try { res.json(service.updateRecipe(Number(req.params.id), req.body)) }
  catch (e) { res.status(e.message === 'Recipe not found' ? 404 : 400).json({ error: e.message }) }
}

function remove(req, res) {
  try { service.deleteRecipe(Number(req.params.id)); res.status(204).end() }
  catch (e) { res.status(404).json({ error: e.message }) }
}

module.exports = { list, get, create, update, remove }
```

- [ ] **Step 4: Create server/routes/recipes.js**

```js
const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/recipesController')

router.get('/', ctrl.list)
router.get('/:id', ctrl.get)
router.post('/', ctrl.create)
router.put('/:id', ctrl.update)
router.delete('/:id', ctrl.remove)

module.exports = router
```

- [ ] **Step 5: Mount route in server/app.js — add after ingredients route**

```js
app.use('/api/recipes', require('./routes/recipes'))
```

- [ ] **Step 6: Write tests — create server/__tests__/recipes.test.js**

```js
const request = require('supertest')
const app = require('../app')
const db = require('../db')

beforeEach(() => {
  db.prepare('DELETE FROM recipe_ingredients').run()
  db.prepare('DELETE FROM cook_log').run()
  db.prepare('DELETE FROM recipes').run()
  db.prepare('DELETE FROM ingredients').run()
})

describe('GET /api/recipes', () => {
  it('returns empty array when no recipes', async () => {
    const res = await request(app).get('/api/recipes')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('includes canCook in response', async () => {
    db.prepare("INSERT INTO recipes (name, steps) VALUES ('Pasta', '[]')").run()
    const res = await request(app).get('/api/recipes')
    expect(res.body[0]).toHaveProperty('canCook')
  })
})

describe('POST /api/recipes', () => {
  it('creates a recipe', async () => {
    const res = await request(app).post('/api/recipes')
      .send({ name: 'Omelette', steps: [{ text: 'Beat eggs', substeps: [] }], servings: 1 })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Omelette')
  })

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/recipes').send({ steps: [] })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/recipes/:id', () => {
  it('returns recipe with ingredient stock check', async () => {
    const { lastInsertRowid: ingId } = db.prepare("INSERT INTO ingredients (name, quantity, unit) VALUES ('Eggs', 6, 'pieces')").run()
    const { lastInsertRowid: recipeId } = db.prepare("INSERT INTO recipes (name, steps) VALUES ('Omelette', '[]')").run()
    db.prepare("INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, 2, 'pieces')").run(recipeId, ingId)
    const res = await request(app).get(`/api/recipes/${recipeId}`)
    expect(res.status).toBe(200)
    expect(res.body.canCook).toBe(true)
    expect(res.body.ingredients[0].hasEnough).toBe(true)
  })

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/recipes/9999')
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/recipes/:id', () => {
  it('deletes a recipe', async () => {
    const { lastInsertRowid } = db.prepare("INSERT INTO recipes (name, steps) VALUES ('Test', '[]')").run()
    const res = await request(app).delete(`/api/recipes/${lastInsertRowid}`)
    expect(res.status).toBe(204)
  })
})
```

- [ ] **Step 7: Run tests**

```bash
cd server && npm test -- --testPathPattern=recipes
```

Expected: 6 passing tests

- [ ] **Step 8: Commit**

```bash
git add server/
git commit -m "feat: recipes CRUD API with stock check and tests"
```

---

## Task 5: Cook Log API

**Files:**
- Create: `server/repositories/cookLogRepository.js`
- Create: `server/services/cookLogService.js`
- Create: `server/controllers/cookLogController.js`
- Create: `server/routes/cookLog.js`
- Create: `server/__tests__/cookLog.test.js`

- [ ] **Step 1: Create server/repositories/cookLogRepository.js**

```js
const db = require('../db')

function findAll() {
  return db.prepare(`
    SELECT cl.*, r.name as recipe_name FROM cook_log cl
    JOIN recipes r ON r.id = cl.recipe_id ORDER BY cl.cooked_at DESC
  `).all()
}

function findRecent(limit = 5) {
  return db.prepare(`
    SELECT cl.*, r.name as recipe_name FROM cook_log cl
    JOIN recipes r ON r.id = cl.recipe_id ORDER BY cl.cooked_at DESC LIMIT ?
  `).all(limit)
}

function create(recipeId, cookedAt) {
  const { lastInsertRowid } = db.prepare('INSERT INTO cook_log (recipe_id, cooked_at) VALUES (?, ?)').run(recipeId, cookedAt)
  return db.prepare('SELECT cl.*, r.name as recipe_name FROM cook_log cl JOIN recipes r ON r.id = cl.recipe_id WHERE cl.id = ?').get(lastInsertRowid)
}

function remove(id) {
  return db.prepare('DELETE FROM cook_log WHERE id = ?').run(id)
}

module.exports = { findAll, findRecent, create, remove }
```

- [ ] **Step 2: Create server/services/cookLogService.js**

```js
const cookLogRepo = require('../repositories/cookLogRepository')
const recipesRepo = require('../repositories/recipesRepository')
const ingredientsService = require('./ingredientsService')

function listCooks() { return cookLogRepo.findAll() }

function logCook({ recipeId, cookedAt, deductions }) {
  if (!recipesRepo.findById(recipeId)) throw new Error('Recipe not found')
  if (!cookedAt) throw new Error('cookedAt is required')
  const entry = cookLogRepo.create(recipeId, cookedAt)
  if (deductions && deductions.length > 0) {
    ingredientsService.applyDeductions(deductions)
  }
  return entry
}

function deleteCook(id) {
  const result = cookLogRepo.remove(id)
  if (result.changes === 0) throw new Error('Cook log entry not found')
}

module.exports = { listCooks, logCook, deleteCook }
```

- [ ] **Step 3: Create server/controllers/cookLogController.js**

```js
const service = require('../services/cookLogService')

function list(req, res) { res.json(service.listCooks()) }

function create(req, res) {
  try { res.status(201).json(service.logCook(req.body)) }
  catch (e) { res.status(e.message === 'Recipe not found' ? 404 : 400).json({ error: e.message }) }
}

function remove(req, res) {
  try { service.deleteCook(Number(req.params.id)); res.status(204).end() }
  catch (e) { res.status(404).json({ error: e.message }) }
}

module.exports = { list, create, remove }
```

- [ ] **Step 4: Create server/routes/cookLog.js**

```js
const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/cookLogController')

router.get('/', ctrl.list)
router.post('/', ctrl.create)
router.delete('/:id', ctrl.remove)

module.exports = router
```

- [ ] **Step 5: Write tests — create server/__tests__/cookLog.test.js**

```js
const request = require('supertest')
const app = require('../app')
const db = require('../db')

let recipeId, ingId

beforeEach(() => {
  db.prepare('DELETE FROM recipe_ingredients').run()
  db.prepare('DELETE FROM cook_log').run()
  db.prepare('DELETE FROM recipes').run()
  db.prepare('DELETE FROM ingredients').run()
  ingId = db.prepare("INSERT INTO ingredients (name, quantity, unit) VALUES ('Eggs', 6, 'pieces')").run().lastInsertRowid
  recipeId = db.prepare("INSERT INTO recipes (name, steps) VALUES ('Omelette', '[]')").run().lastInsertRowid
  db.prepare("INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, 2, 'pieces')").run(recipeId, ingId)
})

describe('GET /api/cook-log', () => {
  it('returns empty array when no entries', async () => {
    const res = await request(app).get('/api/cook-log')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe('POST /api/cook-log', () => {
  it('logs a cook and deducts ingredients', async () => {
    const res = await request(app).post('/api/cook-log').send({
      recipeId, cookedAt: '2026-05-06',
      deductions: [{ ingredientId: ingId, quantityUsed: 2 }]
    })
    expect(res.status).toBe(201)
    expect(res.body.recipe_name).toBe('Omelette')
    const ing = db.prepare('SELECT quantity FROM ingredients WHERE id = ?').get(ingId)
    expect(ing.quantity).toBe(4)
  })

  it('returns 404 for unknown recipe', async () => {
    const res = await request(app).post('/api/cook-log').send({ recipeId: 9999, cookedAt: '2026-05-06', deductions: [] })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/cook-log/:id', () => {
  it('deletes a cook log entry', async () => {
    const { lastInsertRowid } = db.prepare("INSERT INTO cook_log (recipe_id, cooked_at) VALUES (?, '2026-05-01')").run(recipeId)
    const res = await request(app).delete(`/api/cook-log/${lastInsertRowid}`)
    expect(res.status).toBe(204)
  })
})
```

- [ ] **Step 6: Mount routes in server/app.js — add after recipes route**

```js
app.use('/api/cook-log', require('./routes/cookLog'))
```

- [ ] **Step 7: Run tests**

```bash
cd server && npm test -- --testPathPattern=cookLog
```

Expected: 4 passing tests

- [ ] **Step 8: Commit**

```bash
git add server/
git commit -m "feat: cook log API with ingredient deduction and tests"
```

---

## Task 6: Dashboard API

**Files:**
- Create: `server/services/dashboardService.js`
- Create: `server/controllers/dashboardController.js`
- Create: `server/routes/dashboard.js`

- [ ] **Step 1: Create server/services/dashboardService.js**

```js
const ingredientsService = require('./ingredientsService')
const ingredientsRepo = require('../repositories/ingredientsRepository')
const cookLogRepo = require('../repositories/cookLogRepository')
const recipesRepo = require('../repositories/recipesRepository')

function getDashboard() {
  const recentIngredients = ingredientsService.getRecent(5)
  const expiringIngredients = ingredientsService.getExpiringSoon()
  const recentCooks = cookLogRepo.findRecent(5)

  const allRecipes = recipesRepo.findAll()
  const recentRecipeIds = [...new Set([
    ...recentCooks.map(c => c.recipe_id),
    ...recipesRepo.findRecent(5).map(r => r.id)
  ])].slice(0, 5)

  const recentRecipes = recentRecipeIds.map(id => {
    const recipe = recipesRepo.findById(id)
    const ings = recipesRepo.findIngredients(id)
    const missing = ings.filter(i => i.stock_quantity < i.quantity).length
    const lastCook = recentCooks.find(c => c.recipe_id === id)
    return { ...recipe, canCook: missing === 0 && ings.length > 0, missingCount: missing, lastCookedAt: lastCook ? lastCook.cooked_at : null }
  })

  const readyCount = allRecipes.filter(r => {
    const ings = recipesRepo.findIngredients(r.id)
    return ings.length > 0 && ings.every(i => i.stock_quantity >= i.quantity)
  }).length

  const totalCooks = require('../db').prepare('SELECT COUNT(*) as count FROM cook_log').get().count

  return {
    recentIngredients,
    expiringIngredients,
    recentRecipes,
    stats: {
      totalIngredients: ingredientsRepo.findAll().length,
      expiringCount: expiringIngredients.length,
      totalRecipes: allRecipes.length,
      readyCount,
      totalCooks
    }
  }
}

module.exports = { getDashboard }
```

- [ ] **Step 2: Create server/controllers/dashboardController.js**

```js
const service = require('../services/dashboardService')

function get(req, res) { res.json(service.getDashboard()) }

module.exports = { get }
```

- [ ] **Step 3: Create server/routes/dashboard.js**

```js
const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/dashboardController')

router.get('/', ctrl.get)

module.exports = router
```

- [ ] **Step 4: Mount route in server/app.js — add after cook-log route**

```js
app.use('/api/dashboard', require('./routes/dashboard'))
```

- [ ] **Step 5: Run all tests**

```bash
cd server && npm test
```

Expected: all previous tests still passing

- [ ] **Step 6: Commit**

```bash
git add server/
git commit -m "feat: dashboard API endpoint"
```

---

## Task 7: Vue App Shell

**Files:**
- Create: `client/src/main.js`
- Create: `client/src/router.js`
- Create: `client/src/api.js`
- Create: `client/src/styles/theme.css`
- Create: `client/src/App.vue`

- [ ] **Step 1: Create client/src/styles/theme.css**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #1e1e1e;
  --panel: #333;
  --toolbar: #3b3b3b;
  --border: #555;
  --border-dark: #2e2e2e;
  --text: #d8d8d0;
  --text-muted: #888;
  --text-bright: #e8e8e0;
  --accent: #f0a030;
  --accent-dark: #c88000;
  --green: #70d050;
  --green-bg: #1e4a18;
  --green-border: #50a030;
  --red: #ff6050;
  --red-bg: #3a1a14;
  --red-border: #c03020;
  --yellow: #f0a030;
  --yellow-bg: #4a3800;
  --yellow-border: #c88000;
  --row-alt: #363636;
  --row-hover: #3d3d3d;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Titillium Web', 'Trebuchet MS', sans-serif;
  font-size: 15px;
  min-height: 100vh;
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #2a2a2a; }
::-webkit-scrollbar-thumb { background: #555; }

.btn {
  background: #4a4a4a; border: 1px solid #606060; color: var(--text);
  font-family: inherit; font-size: 0.88rem; padding: 5px 16px;
  cursor: pointer; border-radius: 2px; height: 32px;
  display: inline-flex; align-items: center; gap: 5px;
}
.btn:hover { background: #5a5a5a; border-color: #888; }
.btn-sm { font-size: 0.82rem; padding: 3px 12px; height: 28px; }
.btn-active { background: var(--accent-dark); border-color: var(--accent); color: #fff; font-weight: 600; }
.btn-green { background: var(--green-bg); border-color: var(--green-border); color: var(--green); }
.btn-green:hover { background: #255c1e; }
.btn-danger { background: var(--red-bg); border-color: var(--red-border); color: var(--red); }
.btn-danger:hover { background: #4a1a14; }

.panel { background: var(--panel); border: 1px solid var(--border); }
.panel-title {
  background: var(--toolbar); border-bottom: 1px solid var(--border);
  padding: 7px 12px; font-weight: 600; font-size: 0.92rem; color: var(--text-bright);
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
}
.panel-title .accent { color: var(--accent); }

.trow {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px; border-bottom: 1px solid var(--border-dark); font-size: 0.88rem;
}
.trow:nth-child(even) { background: var(--row-alt); }
.trow:hover { background: var(--row-hover); }
.trow-name { color: var(--text-bright); font-weight: 600; }
.trow-meta { color: var(--text-muted); font-size: 0.78rem; margin-top: 2px; }

.badge {
  font-size: 0.7rem; padding: 2px 8px; border-radius: 1px;
  font-weight: 600; letter-spacing: 0.5px; white-space: nowrap;
}
.badge-red { background: var(--red-bg); border: 1px solid var(--red-border); color: var(--red); }
.badge-yellow { background: var(--yellow-bg); border: 1px solid var(--yellow-border); color: var(--yellow); }
.badge-green { background: var(--green-bg); border: 1px solid var(--green-border); color: var(--green); }
.badge-grey { background: #3a3a3a; border: 1px solid #555; color: #999; }

.section-label {
  padding: 5px 12px; background: #3a3a3a; border-bottom: 1px solid var(--border);
  font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted);
}
```

- [ ] **Step 2: Create client/src/router.js**

```js
import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import Ingredients from './views/Ingredients.vue'
import Recipes from './views/Recipes.vue'
import RecipeDetail from './views/RecipeDetail.vue'
import CookLog from './views/CookLog.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/ingredients', component: Ingredients },
  { path: '/recipes', component: Recipes },
  { path: '/recipes/:id', component: RecipeDetail },
  { path: '/cook-log', component: CookLog }
]

export default createRouter({ history: createWebHashHistory(), routes })
```

- [ ] **Step 3: Create client/src/api.js**

```js
const BASE = '/api'

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined
  })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  dashboard: { get: () => request('GET', '/dashboard') },
  ingredients: {
    list: () => request('GET', '/ingredients'),
    create: (data) => request('POST', '/ingredients', data),
    update: (id, data) => request('PUT', `/ingredients/${id}`, data),
    remove: (id) => request('DELETE', `/ingredients/${id}`)
  },
  recipes: {
    list: () => request('GET', '/recipes'),
    get: (id) => request('GET', `/recipes/${id}`),
    create: (data) => request('POST', '/recipes', data),
    update: (id, data) => request('PUT', `/recipes/${id}`, data),
    remove: (id) => request('DELETE', `/recipes/${id}`)
  },
  cookLog: {
    list: () => request('GET', '/cook-log'),
    create: (data) => request('POST', '/cook-log', data),
    remove: (id) => request('DELETE', `/cook-log/${id}`)
  }
}
```

- [ ] **Step 4: Create client/src/main.js**

```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/theme.css'

createApp(App).use(router).mount('#app')
```

- [ ] **Step 5: Create client/src/App.vue**

```vue
<template>
  <div id="layout">
    <nav class="toolbar">
      <div class="toolbar-logo">⚙ LETMECOOK</div>
      <router-link to="/" class="btn btn-sm" :class="{ 'btn-active': $route.path === '/' }">⌂ Dashboard</router-link>
      <router-link to="/ingredients" class="btn btn-sm" :class="{ 'btn-active': $route.path === '/ingredients' }">⬡ Ingredients</router-link>
      <router-link to="/recipes" class="btn btn-sm" :class="{ 'btn-active': $route.path.startsWith('/recipes') }">📋 Recipes</router-link>
      <router-link to="/cook-log" class="btn btn-sm" :class="{ 'btn-active': $route.path === '/cook-log' }">📅 Cook Log</router-link>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
#layout { display: flex; flex-direction: column; height: 100vh; }
.toolbar {
  background: var(--toolbar); border-bottom: 1px solid var(--border);
  display: flex; align-items: center; height: 46px; padding: 0 8px; gap: 2px; flex-shrink: 0;
}
.toolbar-logo {
  color: var(--accent); font-weight: 700; font-size: 1rem;
  padding: 0 14px 0 4px; margin-right: 6px; border-right: 1px solid var(--border);
}
.toolbar a { text-decoration: none; }
.main-content { flex: 1; overflow: hidden; }
</style>
```

- [ ] **Step 6: Start dev servers to confirm app loads**

```bash
# Terminal 1
cd server && node index.js
# Terminal 2
cd client && npm run dev
```

Open http://localhost:5173 — toolbar with 4 nav links visible.

- [ ] **Step 7: Commit**

```bash
git add client/src/
git commit -m "feat: Vue app shell with router, api client, and theme CSS"
```

---

## Task 8: Dashboard View

**Files:**
- Create: `client/src/views/Dashboard.vue`

- [ ] **Step 1: Create client/src/views/Dashboard.vue**

```vue
<template>
  <div class="dashboard">
    <div class="panel stat-bar" v-if="data">
      <div class="stat" v-for="s in stats" :key="s.label">
        <div class="stat-label">{{ s.label }}</div>
        <div class="stat-value" :style="{ color: s.color || 'var(--accent)' }">{{ s.value }}</div>
      </div>
    </div>

    <div class="row-2" v-if="data">
      <div class="panel">
        <div class="panel-title"><span class="accent">▶</span> Recently Added</div>
        <div class="trow" v-for="i in data.recentIngredients" :key="i.id">
          <div>
            <div class="trow-name">{{ i.name }}</div>
            <div class="trow-meta">{{ i.quantity }} {{ i.unit }} — added {{ timeAgo(i.created_at) }}</div>
          </div>
          <span class="badge badge-grey">{{ i.category || '—' }}</span>
        </div>
        <div class="trow" v-if="!data.recentIngredients.length" style="color:var(--text-muted)">No ingredients yet.</div>
      </div>

      <div class="panel">
        <div class="panel-title"><span class="accent">⚠</span> Expiring Soon</div>
        <div class="trow" v-for="i in data.expiringIngredients" :key="i.id">
          <div>
            <div class="trow-name">{{ i.name }}</div>
            <div class="trow-meta">{{ i.quantity }} {{ i.unit }} — expires {{ i.expiration_date }}</div>
          </div>
          <span class="badge" :class="expiryBadge(i.expiration_date)">{{ daysUntil(i.expiration_date) }}d</span>
        </div>
        <div class="trow" v-if="!data.expiringIngredients.length" style="color:var(--text-muted)">Nothing expiring soon.</div>
      </div>
    </div>

    <div class="panel" v-if="data">
      <div class="panel-title"><span class="accent">▶</span> Recent Dishes</div>
      <div class="dishes-grid">
        <router-link v-for="r in data.recentRecipes" :key="r.id" :to="`/recipes/${r.id}`" class="dish-card">
          <div class="dish-icon">🍽</div>
          <div class="dish-name">{{ r.name }}</div>
          <div class="dish-date">{{ r.lastCookedAt ? 'Last cooked: ' + r.lastCookedAt : 'Not cooked yet' }}</div>
          <div class="dish-status" :class="r.canCook ? 'ok' : 'missing'">
            {{ r.canCook ? '✔ Ready to cook' : `✘ Missing ${r.missingCount} item(s)` }}
          </div>
        </router-link>
        <div v-if="!data.recentRecipes.length" style="color:var(--text-muted);padding:12px">No recipes yet.</div>
      </div>
    </div>

    <div v-if="!data" style="padding:2rem;color:var(--text-muted)">Loading...</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../api'

const data = ref(null)
onMounted(async () => { data.value = await api.dashboard.get() })

const stats = computed(() => {
  if (!data.value) return []
  const s = data.value.stats
  return [
    { label: 'Total Ingredients', value: s.totalIngredients },
    { label: 'Expiring Soon', value: s.expiringCount, color: s.expiringCount > 0 ? 'var(--red)' : 'var(--green)' },
    { label: 'Recipes', value: s.totalRecipes },
    { label: 'Ready to Cook', value: s.readyCount, color: 'var(--green)' },
    { label: 'Times Cooked', value: s.totalCooks }
  ]
})

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (diff === 0) return 'today'
  if (diff === 1) return '1 day ago'
  return `${diff} days ago`
}

function daysUntil(dateStr) {
  return Math.max(0, Math.ceil((new Date(dateStr) - Date.now()) / 86400000))
}

function expiryBadge(dateStr) {
  const d = daysUntil(dateStr)
  if (d <= 3) return 'badge-red'
  if (d <= 7) return 'badge-yellow'
  return 'badge-green'
}
</script>

<style scoped>
.dashboard { padding: 12px; display: flex; flex-direction: column; gap: 10px; height: 100%; overflow-y: auto; }
.stat-bar { display: flex; }
.stat { flex: 1; padding: 8px 12px; border-right: 1px solid var(--border); }
.stat:last-child { border-right: none; }
.stat-label { color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
.stat-value { font-size: 1.1rem; font-weight: 700; }
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.dishes-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; background: #2a2a2a; }
.dish-card { background: var(--panel); padding: 12px; text-decoration: none; color: inherit; border: 1px solid transparent; }
.dish-card:hover { background: var(--row-hover); border-color: var(--accent); }
.dish-icon { font-size: 1.6rem; margin-bottom: 6px; }
.dish-name { color: var(--text-bright); font-weight: 600; font-size: 0.88rem; margin-bottom: 3px; }
.dish-date { color: var(--text-muted); font-size: 0.72rem; margin-bottom: 5px; }
.dish-status { font-size: 0.75rem; font-weight: 600; }
.dish-status.ok { color: var(--green); }
.dish-status.missing { color: var(--red); }
</style>
```

- [ ] **Step 2: Verify dashboard loads at http://localhost:5173**

- [ ] **Step 3: Commit**

```bash
git add client/src/views/Dashboard.vue
git commit -m "feat: dashboard view"
```

---

## Task 9: Ingredients View

**Files:**
- Create: `client/src/views/Ingredients.vue`

- [ ] **Step 1: Create client/src/views/Ingredients.vue**

```vue
<template>
  <div class="page">
    <div class="panel-title top-bar">
      <span><span class="accent">▶</span> Ingredients</span>
      <button class="btn btn-sm btn-green" @click="openAdd">+ Add Ingredient</button>
    </div>
    <div class="panel ing-list">
      <div class="trow header-row">
        <div style="flex:2">Name</div>
        <div style="flex:1">Quantity</div>
        <div style="flex:1">Category</div>
        <div style="flex:1">Expires</div>
        <div style="flex:0 0 80px">Actions</div>
      </div>
      <div class="trow" v-for="ing in ingredients" :key="ing.id" style="cursor:default">
        <div style="flex:2"><span class="trow-name">{{ ing.name }}</span></div>
        <div style="flex:1">{{ ing.quantity }} {{ ing.unit }}</div>
        <div style="flex:1">
          <span class="badge badge-grey" v-if="ing.category">{{ ing.category }}</span>
          <span v-else style="color:var(--text-muted)">—</span>
        </div>
        <div style="flex:1">
          <span v-if="ing.expiration_date" class="badge" :class="expiryBadge(ing.expiration_date)">{{ ing.expiration_date }}</span>
          <span v-else style="color:var(--text-muted)">—</span>
        </div>
        <div style="flex:0 0 80px;display:flex;gap:4px">
          <button class="btn btn-sm" @click="openEdit(ing)">✎</button>
          <button class="btn btn-sm btn-danger" @click="confirmDelete(ing)">✕</button>
        </div>
      </div>
      <div class="trow" v-if="!ingredients.length" style="color:var(--text-muted)">No ingredients yet. Add some!</div>
    </div>

    <div class="overlay" v-if="showForm" @click.self="showForm = false">
      <div class="modal">
        <div class="panel-title">{{ editing ? 'Edit Ingredient' : 'Add Ingredient' }}</div>
        <div class="modal-body">
          <label>Name *</label>
          <input v-model="form.name" class="input" placeholder="e.g. Ground Beef" />
          <div class="two-col">
            <div>
              <label>Quantity *</label>
              <input v-model.number="form.quantity" type="number" class="input" placeholder="500" />
            </div>
            <div>
              <label>Unit *</label>
              <input v-model="form.unit" class="input" placeholder="g, ml, pieces..." />
            </div>
          </div>
          <label>Category</label>
          <input v-model="form.category" class="input" placeholder="Dairy, Meat, Vegetables..." />
          <label>Expiration Date</label>
          <input v-model="form.expiration_date" type="date" class="input" />
          <div class="error" v-if="error">{{ error }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="showForm = false">Cancel</button>
          <button class="btn btn-green" @click="save">{{ editing ? 'Save' : 'Add' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'

const ingredients = ref([])
const showForm = ref(false)
const editing = ref(null)
const error = ref('')
const form = ref({ name: '', quantity: '', unit: '', category: '', expiration_date: '' })

onMounted(load)

async function load() { ingredients.value = await api.ingredients.list() }

function openAdd() {
  editing.value = null
  form.value = { name: '', quantity: '', unit: '', category: '', expiration_date: '' }
  error.value = ''
  showForm.value = true
}

function openEdit(ing) {
  editing.value = ing
  form.value = { name: ing.name, quantity: ing.quantity, unit: ing.unit, category: ing.category || '', expiration_date: ing.expiration_date || '' }
  error.value = ''
  showForm.value = true
}

async function save() {
  error.value = ''
  try {
    if (editing.value) await api.ingredients.update(editing.value.id, form.value)
    else await api.ingredients.create(form.value)
    showForm.value = false
    await load()
  } catch (e) { error.value = e.message }
}

async function confirmDelete(ing) {
  if (!confirm(`Delete "${ing.name}"?`)) return
  await api.ingredients.remove(ing.id)
  await load()
}

function daysUntil(dateStr) {
  return Math.max(0, Math.ceil((new Date(dateStr) - Date.now()) / 86400000))
}

function expiryBadge(dateStr) {
  const d = daysUntil(dateStr)
  if (d <= 3) return 'badge-red'
  if (d <= 7) return 'badge-yellow'
  return 'badge-green'
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; height: 100%; padding: 12px; }
.top-bar { background: var(--toolbar); border: 1px solid var(--border); border-bottom: none; }
.ing-list { flex: 1; overflow-y: auto; }
.header-row { background: #3a3a3a; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); cursor: default !important; }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: var(--panel); border: 1px solid var(--border); width: 420px; }
.modal-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.modal-body label { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: -6px; }
.input { background: #2a2a2a; border: 1px solid var(--border); color: var(--text-bright); font-family: inherit; font-size: 0.92rem; padding: 7px 10px; width: 100%; border-radius: 1px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.modal-footer { padding: 10px 16px; background: var(--toolbar); border-top: 1px solid var(--border); display: flex; gap: 6px; justify-content: flex-end; }
.error { color: var(--red); font-size: 0.82rem; }
</style>
```

- [ ] **Step 2: Test add/edit/delete in browser at http://localhost:5173/#/ingredients**

- [ ] **Step 3: Commit**

```bash
git add client/src/views/Ingredients.vue
git commit -m "feat: ingredients view with full CRUD"
```

---

## Task 10: Recipes List + StockBadge

**Files:**
- Create: `client/src/components/StockBadge.vue`
- Create: `client/src/views/Recipes.vue`

- [ ] **Step 1: Create client/src/components/StockBadge.vue**

```vue
<template>
  <span class="badge" :class="canCook ? 'badge-green' : 'badge-red'">
    {{ canCook ? '✔ Ready' : `✘ Missing ${missingCount}` }}
  </span>
</template>

<script setup>
defineProps({ canCook: Boolean, missingCount: { type: Number, default: 0 } })
</script>
```

- [ ] **Step 2: Create client/src/views/Recipes.vue**

```vue
<template>
  <div class="page">
    <div class="panel-title top-bar">
      <span><span class="accent">▶</span> Recipes</span>
      <button class="btn btn-sm btn-green" @click="openCreate">+ New Recipe</button>
    </div>
    <div class="panel recipe-list">
      <div class="trow header-row">
        <div style="flex:3">Name</div>
        <div style="flex:1">Prep</div>
        <div style="flex:1">Cook</div>
        <div style="flex:1">Servings</div>
        <div style="flex:1">Status</div>
        <div style="flex:0 0 60px"></div>
      </div>
      <router-link v-for="r in recipes" :key="r.id" :to="`/recipes/${r.id}`" class="trow recipe-row">
        <div style="flex:3"><span class="trow-name">{{ r.name }}</span></div>
        <div style="flex:1">{{ r.prep_time ? r.prep_time + ' min' : '—' }}</div>
        <div style="flex:1">{{ r.cook_time ? r.cook_time + ' min' : '—' }}</div>
        <div style="flex:1">{{ r.servings || '—' }}</div>
        <div style="flex:1"><StockBadge :canCook="r.canCook" :missingCount="r.missingCount" /></div>
        <div style="flex:0 0 60px" @click.prevent="confirmDelete(r)">
          <button class="btn btn-sm btn-danger">✕</button>
        </div>
      </router-link>
      <div class="trow" v-if="!recipes.length" style="color:var(--text-muted)">No recipes yet. Create one!</div>
    </div>

    <div class="overlay" v-if="showCreate" @click.self="showCreate = false">
      <div class="modal">
        <div class="panel-title">New Recipe</div>
        <div class="modal-body">
          <label>Name *</label>
          <input v-model="form.name" class="input" placeholder="e.g. Spaghetti Bolognese" />
          <div class="hint">Add ingredients and steps after creating the recipe.</div>
          <div class="error" v-if="error">{{ error }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="showCreate = false">Cancel</button>
          <button class="btn btn-green" @click="create">Create & Edit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import StockBadge from '../components/StockBadge.vue'

const router = useRouter()
const recipes = ref([])
const showCreate = ref(false)
const form = ref({ name: '' })
const error = ref('')

onMounted(load)
async function load() { recipes.value = await api.recipes.list() }

function openCreate() { form.value = { name: '' }; error.value = ''; showCreate.value = true }

async function create() {
  error.value = ''
  try {
    const recipe = await api.recipes.create({ name: form.value.name, steps: [] })
    showCreate.value = false
    router.push(`/recipes/${recipe.id}`)
  } catch (e) { error.value = e.message }
}

async function confirmDelete(r) {
  if (!confirm(`Delete recipe "${r.name}"?`)) return
  await api.recipes.remove(r.id)
  await load()
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; height: 100%; padding: 12px; }
.top-bar { background: var(--toolbar); border: 1px solid var(--border); border-bottom: none; }
.recipe-list { flex: 1; overflow-y: auto; }
.header-row { background: #3a3a3a; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); cursor: default !important; }
.recipe-row { text-decoration: none; color: inherit; }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: var(--panel); border: 1px solid var(--border); width: 400px; }
.modal-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.modal-body label { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: -6px; }
.input { background: #2a2a2a; border: 1px solid var(--border); color: var(--text-bright); font-family: inherit; font-size: 0.92rem; padding: 7px 10px; width: 100%; border-radius: 1px; }
.hint { color: var(--text-muted); font-size: 0.78rem; }
.modal-footer { padding: 10px 16px; background: var(--toolbar); border-top: 1px solid var(--border); display: flex; gap: 6px; justify-content: flex-end; }
.error { color: var(--red); font-size: 0.82rem; }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add client/src/views/Recipes.vue client/src/components/StockBadge.vue
git commit -m "feat: recipes list view with StockBadge"
```

---

## Task 11: StepList Component

**Files:**
- Create: `client/src/components/StepList.vue`

- [ ] **Step 1: Create client/src/components/StepList.vue**

```vue
<template>
  <div class="step-list">
    <div class="progress-wrap">
      <div class="progress-label">
        <span>Progress</span>
        <span>{{ completedMain }} / {{ steps.length }} steps</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
      </div>
    </div>

    <div class="step-item" v-for="(step, si) in localSteps" :key="si"
      :class="{ active: isActiveStep(si), done: step.checked }">
      <div class="step-main">
        <div class="step-check" :class="{ checked: step.checked }" @click="toggleStep(si)"></div>
        <div class="step-num">{{ si + 1 }}.</div>
        <div class="step-text" :class="{ done: step.checked }">{{ step.text }}</div>
        <div v-if="step.substeps && step.substeps.length" class="step-expand" @click="toggleExpand(si)">
          {{ step.expanded ? '▲' : '▼' }} {{ step.substeps.length }} sub-step{{ step.substeps.length > 1 ? 's' : '' }}
        </div>
      </div>
      <div class="substeps" v-if="step.expanded && step.substeps && step.substeps.length">
        <div class="substep" v-for="(sub, subi) in step.substeps" :key="subi">
          <div class="substep-check" :class="{ checked: step.subChecked[subi] }" @click="toggleSub(si, subi)"></div>
          <div class="substep-text" :class="{ done: step.subChecked[subi] }">{{ sub }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({ steps: { type: Array, default: () => [] } })
const localSteps = ref([])

watch(() => props.steps, (newSteps) => {
  localSteps.value = newSteps.map(s => ({
    ...s, checked: false, expanded: true,
    subChecked: (s.substeps || []).map(() => false)
  }))
}, { immediate: true })

const completedMain = computed(() => localSteps.value.filter(s => s.checked).length)
const progressPct = computed(() => {
  if (!localSteps.value.length) return 0
  return Math.round((completedMain.value / localSteps.value.length) * 100)
})

function isActiveStep(si) {
  if (localSteps.value[si].checked) return false
  for (let i = 0; i < si; i++) { if (!localSteps.value[i].checked) return false }
  return true
}

function toggleStep(si) { localSteps.value[si].checked = !localSteps.value[si].checked }
function toggleSub(si, subi) { localSteps.value[si].subChecked[subi] = !localSteps.value[si].subChecked[subi] }
function toggleExpand(si) { localSteps.value[si].expanded = !localSteps.value[si].expanded }
</script>

<style scoped>
.step-list { display: flex; flex-direction: column; }
.progress-wrap { padding: 9px 12px; background: #2e2e2e; border-bottom: 1px solid var(--border); }
.progress-label { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.82rem; color: var(--text-muted); }
.progress-track { height: 7px; background: #222; border: 1px solid #444; }
.progress-fill { height: 100%; background: var(--accent); }
.step-item { border-bottom: 1px solid var(--border-dark); }
.step-item:nth-child(even) { background: var(--row-alt); }
.step-item.active { background: #2a3020; border-left: 3px solid var(--accent); }
.step-item.done { opacity: 0.6; }
.step-main { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; }
.step-check {
  width: 22px; height: 22px; border: 2px solid #666; background: #2a2a2a;
  flex-shrink: 0; margin-top: 1px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.step-check.checked { background: var(--green-bg); border-color: var(--green-border); }
.step-check.checked::after { content: '✔'; color: var(--green); font-size: 0.82rem; font-weight: 700; }
.step-num { color: var(--accent); font-weight: 700; min-width: 24px; font-size: 0.95rem; }
.step-text { color: var(--text); font-size: 0.95rem; line-height: 1.5; flex: 1; }
.step-text.done { color: #666; text-decoration: line-through; }
.step-expand { color: #666; font-size: 0.78rem; white-space: nowrap; cursor: pointer; flex-shrink: 0; }
.step-expand:hover { color: var(--text-muted); }
.substeps { padding: 0 14px 10px 60px; display: flex; flex-direction: column; gap: 7px; }
.substep { display: flex; align-items: flex-start; gap: 10px; }
.substep-check {
  width: 17px; height: 17px; border: 1px solid #555; background: #2a2a2a;
  flex-shrink: 0; margin-top: 2px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.substep-check.checked { background: var(--green-bg); border-color: var(--green-border); }
.substep-check.checked::after { content: '✔'; color: var(--green); font-size: 0.68rem; font-weight: 700; }
.substep-text { color: #aaa; font-size: 0.88rem; line-height: 1.5; }
.substep-text.done { color: #555; text-decoration: line-through; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/StepList.vue
git commit -m "feat: StepList component with substeps and progress bar"
```

---

## Task 12: Recipe Detail View

**Files:**
- Create: `client/src/views/RecipeDetail.vue`

- [ ] **Step 1: Create client/src/views/RecipeDetail.vue**

```vue
<template>
  <div class="detail-layout" v-if="recipe">
    <!-- LEFT PANEL -->
    <div class="panel left-panel">
      <div class="panel-title">
        <span><span class="accent">▶</span> Recipe Info</span>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm" @click="showEdit = true">✎ Edit</button>
          <button class="btn btn-sm btn-green" @click="showCook = true">🍳 Log Cook</button>
        </div>
      </div>
      <div class="photo-area">
        <div style="font-size:3rem;opacity:0.35">🍽</div>
        <div style="color:#555;font-size:0.72rem;text-transform:uppercase;letter-spacing:1px">No photo</div>
      </div>
      <div class="panel-scroll">
        <div class="meta-section">
          <div class="recipe-name">{{ recipe.name }}</div>
          <div class="recipe-meta">
            <span>Prep: <b>{{ recipe.prep_time ? recipe.prep_time + ' min' : '—' }}</b></span>
            <span>Cook: <b>{{ recipe.cook_time ? recipe.cook_time + ' min' : '—' }}</b></span>
            <span>Servings: <b>{{ recipe.servings || '—' }}</b></span>
          </div>
        </div>
        <div class="stock-bar" :class="recipe.canCook ? 'ok' : 'missing'">
          <span :style="{ color: recipe.canCook ? 'var(--green)' : 'var(--red)', fontWeight:600 }">
            {{ recipe.canCook ? '✔ All ingredients in stock' : `✘ Missing ${missingCount} ingredient(s)` }}
          </span>
          <button class="btn btn-sm btn-green" @click="showCook = true" v-if="recipe.canCook">🍳 Log Cook</button>
        </div>
        <div class="section-label">Ingredients</div>
        <div class="trow" v-for="ing in recipe.ingredients" :key="ing.id">
          <div>
            <div class="trow-name">{{ ing.ingredient_name }}</div>
            <div class="trow-meta">needs {{ ing.quantity }} {{ ing.unit }}</div>
          </div>
          <div :style="{ color: ing.hasEnough ? 'var(--green)' : 'var(--red)', fontWeight:600, fontSize:'0.85rem' }">
            {{ ing.hasEnough ? '✔' : '✘' }} {{ ing.stock_quantity }} {{ ing.stock_unit }}
          </div>
        </div>
        <div class="trow" v-if="!recipe.ingredients.length" style="color:var(--text-muted)">No ingredients linked.</div>
        <div v-if="recipe.notes">
          <div class="section-label">Notes</div>
          <div style="padding:10px 12px;color:var(--text-muted);font-size:0.88rem">{{ recipe.notes }}</div>
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL -->
    <div class="panel right-panel">
      <div class="panel-title">
        <span><span class="accent">▶</span> Steps</span>
        <span style="color:var(--text-muted);font-size:0.78rem">{{ recipe.steps.length }} step{{ recipe.steps.length !== 1 ? 's' : '' }}</span>
      </div>
      <div style="flex:1;overflow-y:auto">
        <StepList :steps="recipe.steps" />
        <div v-if="!recipe.steps.length" style="padding:16px;color:var(--text-muted)">No steps defined. Edit the recipe to add steps.</div>
      </div>
    </div>

    <CookDeductModal v-if="showCook" :recipe="recipe" @close="showCook = false" @logged="onLogged" />

    <!-- EDIT MODAL -->
    <div class="overlay" v-if="showEdit" @click.self="showEdit = false">
      <div class="modal large-modal">
        <div class="panel-title">Edit Recipe: {{ recipe.name }}</div>
        <div class="modal-body">
          <label>Name *</label>
          <input v-model="editForm.name" class="input" />
          <div class="three-col">
            <div><label>Prep (min)</label><input v-model.number="editForm.prep_time" type="number" class="input" /></div>
            <div><label>Cook (min)</label><input v-model.number="editForm.cook_time" type="number" class="input" /></div>
            <div><label>Servings</label><input v-model.number="editForm.servings" type="number" class="input" /></div>
          </div>
          <label>Notes</label>
          <textarea v-model="editForm.notes" class="input textarea" rows="2"></textarea>

          <label>Ingredients</label>
          <div class="ing-edit-list">
            <div class="ing-edit-row" v-for="(ing, i) in editForm.ingredients" :key="i">
              <select v-model="ing.ingredientId" class="input" style="flex:2">
                <option value="">— Select —</option>
                <option v-for="opt in allIngredients" :key="opt.id" :value="opt.id">{{ opt.name }} ({{ opt.unit }})</option>
              </select>
              <input v-model.number="ing.quantity" type="number" class="input" placeholder="Qty" style="flex:1" />
              <input v-model="ing.unit" class="input" placeholder="Unit" style="flex:1" />
              <button class="btn btn-sm btn-danger" @click="editForm.ingredients.splice(i,1)">✕</button>
            </div>
            <button class="btn btn-sm" @click="editForm.ingredients.push({ ingredientId: '', quantity: '', unit: '' })">+ Add Ingredient</button>
          </div>

          <label>Steps</label>
          <div class="steps-edit-list">
            <div class="step-edit-block" v-for="(step, si) in editForm.steps" :key="si">
              <div class="step-edit-row">
                <span style="color:var(--accent);font-weight:700;min-width:24px">{{ si + 1 }}.</span>
                <input v-model="step.text" class="input" placeholder="Step description" style="flex:1" />
                <button class="btn btn-sm btn-danger" @click="editForm.steps.splice(si,1)">✕</button>
              </div>
              <div class="substep-edit-list">
                <div class="substep-edit-row" v-for="(sub, subi) in step.substeps" :key="subi">
                  <span style="color:var(--text-muted);padding:0 8px">↳</span>
                  <input v-model="step.substeps[subi]" class="input" placeholder="Sub-step" style="flex:1" />
                  <button class="btn btn-sm btn-danger" @click="step.substeps.splice(subi,1)">✕</button>
                </div>
                <button class="btn btn-sm" style="margin-left:28px;margin-top:4px" @click="step.substeps.push('')">+ Sub-step</button>
              </div>
            </div>
            <button class="btn btn-sm" @click="editForm.steps.push({ text: '', substeps: [] })">+ Add Step</button>
          </div>

          <div class="error" v-if="editError">{{ editError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="showEdit = false">Cancel</button>
          <button class="btn btn-green" @click="saveEdit">Save</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else style="padding:2rem;color:var(--text-muted)">Loading...</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api'
import StepList from '../components/StepList.vue'
import CookDeductModal from '../components/CookDeductModal.vue'

const route = useRoute()
const recipe = ref(null)
const allIngredients = ref([])
const showCook = ref(false)
const showEdit = ref(false)
const editForm = ref({})
const editError = ref('')

const missingCount = computed(() => recipe.value?.ingredients.filter(i => !i.hasEnough).length ?? 0)

onMounted(async () => {
  await load()
  allIngredients.value = await api.ingredients.list()
})

async function load() {
  recipe.value = await api.recipes.get(Number(route.params.id))
}

async function onLogged() {
  showCook.value = false
  await load()
}

watch(showEdit, (v) => {
  if (!v) return
  editError.value = ''
  editForm.value = {
    name: recipe.value.name,
    prep_time: recipe.value.prep_time,
    cook_time: recipe.value.cook_time,
    servings: recipe.value.servings,
    notes: recipe.value.notes || '',
    steps: JSON.parse(JSON.stringify(recipe.value.steps)),
    ingredients: recipe.value.ingredients.map(i => ({
      ingredientId: i.ingredient_id, quantity: i.quantity, unit: i.unit
    }))
  }
})

async function saveEdit() {
  editError.value = ''
  const steps = editForm.value.steps
    .filter(s => s.text.trim())
    .map(s => ({ text: s.text, substeps: s.substeps.filter(sub => sub.trim()) }))
  const ingredients = editForm.value.ingredients.filter(i => i.ingredientId && i.quantity)
  try {
    await api.recipes.update(recipe.value.id, { ...editForm.value, steps, ingredients })
    showEdit.value = false
    await load()
  } catch (e) { editError.value = e.message }
}
</script>

<style scoped>
.detail-layout { display: flex; gap: 10px; padding: 12px; height: 100%; }
.left-panel { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; overflow: hidden; }
.right-panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.panel-scroll { overflow-y: auto; flex: 1; }
.photo-area { height: 150px; background: #2a2a2a; border-bottom: 1px solid var(--border); flex-shrink: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 6px; }
.meta-section { padding: 10px 12px; border-bottom: 1px solid #444; }
.recipe-name { font-size: 1.1rem; font-weight: 700; color: var(--text-bright); margin-bottom: 6px; }
.recipe-meta { display: flex; gap: 14px; flex-wrap: wrap; color: var(--text-muted); font-size: 0.82rem; }
.recipe-meta b { color: var(--text); }
.stock-bar { padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; border-bottom: 1px solid; font-size: 0.85rem; }
.stock-bar.ok { background: #1a3514; border-color: #3a6030; }
.stock-bar.missing { background: var(--red-bg); border-color: var(--red-border); }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: var(--panel); border: 1px solid var(--border); width: 420px; max-height: 85vh; display: flex; flex-direction: column; }
.large-modal { width: 620px; }
.modal-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; flex: 1; }
.modal-body label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); }
.input { background: #2a2a2a; border: 1px solid var(--border); color: var(--text-bright); font-family: inherit; font-size: 0.92rem; padding: 7px 10px; width: 100%; border-radius: 1px; }
.textarea { resize: vertical; }
.three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.modal-footer { padding: 10px 16px; background: var(--toolbar); border-top: 1px solid var(--border); display: flex; gap: 6px; justify-content: flex-end; flex-shrink: 0; }
.error { color: var(--red); font-size: 0.82rem; }
.ing-edit-list { display: flex; flex-direction: column; gap: 6px; }
.ing-edit-row { display: flex; gap: 6px; align-items: center; }
.steps-edit-list { display: flex; flex-direction: column; gap: 10px; }
.step-edit-block { background: #2a2a2a; border: 1px solid #444; padding: 8px; }
.step-edit-row { display: flex; gap: 6px; align-items: center; margin-bottom: 6px; }
.substep-edit-list { display: flex; flex-direction: column; gap: 5px; }
.substep-edit-row { display: flex; gap: 4px; align-items: center; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add client/src/views/RecipeDetail.vue
git commit -m "feat: recipe detail view with two-panel layout and edit modal"
```

---

## Task 13: Cook Deduct Modal

**Files:**
- Create: `client/src/components/CookDeductModal.vue`

- [ ] **Step 1: Create client/src/components/CookDeductModal.vue**

```vue
<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="panel-title"><span class="accent">🍳</span> Log Cook — Deduct Ingredients</div>
      <div class="modal-note">Adjust quantities actually used. Click USE ALL to use the full required amount.</div>
      <div class="modal-scroll">
        <div class="deduct-row" v-for="ing in deductions" :key="ing.ingredient_id">
          <div class="deduct-name">{{ ing.ingredient_name }}</div>
          <div class="deduct-controls">
            <span class="deduct-label">Used:</span>
            <input v-model.number="ing.used" type="number" class="qty-input" min="0" :max="ing.stock_quantity" />
            <span class="qty-unit">{{ ing.unit }}</span>
            <button class="use-all" @click="ing.used = ing.quantity">USE ALL</button>
          </div>
          <div class="deduct-stock">In stock: {{ ing.stock_quantity }} {{ ing.stock_unit }}</div>
        </div>
        <div v-if="!deductions.length" style="padding:16px;color:var(--text-muted)">No linked ingredients.</div>
      </div>
      <div class="modal-footer">
        <button class="btn" @click="$emit('close')">Cancel</button>
        <button class="btn btn-green" @click="confirm">✔ Confirm & Deduct</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../api'

const props = defineProps({ recipe: Object })
const emit = defineEmits(['close', 'logged'])

const deductions = ref(
  (props.recipe.ingredients || []).map(ing => ({
    ingredient_id: ing.ingredient_id,
    ingredient_name: ing.ingredient_name,
    quantity: ing.quantity,
    unit: ing.unit,
    stock_quantity: ing.stock_quantity,
    stock_unit: ing.stock_unit,
    used: ing.quantity
  }))
)

async function confirm() {
  const today = new Date().toISOString().slice(0, 10)
  await api.cookLog.create({
    recipeId: props.recipe.id,
    cookedAt: today,
    deductions: deductions.value
      .filter(d => d.used > 0)
      .map(d => ({ ingredientId: d.ingredient_id, quantityUsed: d.used }))
  })
  emit('logged')
}
</script>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal { background: var(--panel); border: 1px solid var(--border); width: 420px; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.6); }
.modal-note { padding: 9px 14px; background: #2a2a2a; border-bottom: 1px solid #3a3a3a; color: var(--text-muted); font-size: 0.82rem; }
.modal-scroll { overflow-y: auto; flex: 1; }
.deduct-row { padding: 11px 14px; border-bottom: 1px solid var(--border-dark); }
.deduct-row:nth-child(even) { background: var(--row-alt); }
.deduct-name { color: var(--text-bright); font-weight: 600; font-size: 0.92rem; margin-bottom: 6px; }
.deduct-controls { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; }
.deduct-label { color: var(--text-muted); font-size: 0.82rem; }
.qty-input { background: #2a2a2a; border: 1px solid var(--border); color: var(--text-bright); font-family: inherit; font-size: 0.92rem; padding: 5px 10px; width: 80px; border-radius: 1px; }
.qty-unit { color: #777; font-size: 0.82rem; }
.use-all { margin-left: auto; background: #3a3a3a; border: 1px solid #555; color: #999; font-size: 0.75rem; padding: 3px 10px; cursor: pointer; border-radius: 1px; }
.use-all:hover { background: #4a4a4a; color: var(--text); }
.deduct-stock { color: var(--text-muted); font-size: 0.75rem; }
.modal-footer { padding: 12px 14px; background: var(--toolbar); border-top: 1px solid var(--border); display: flex; gap: 8px; justify-content: flex-end; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/CookDeductModal.vue
git commit -m "feat: CookDeductModal component"
```

---

## Task 14: Cook Log View

**Files:**
- Create: `client/src/views/CookLog.vue`

- [ ] **Step 1: Create client/src/views/CookLog.vue**

```vue
<template>
  <div class="page">
    <div class="panel-title top-bar">
      <span><span class="accent">▶</span> Cook Log</span>
      <span style="color:var(--text-muted);font-size:0.82rem">{{ entries.length }} entries</span>
    </div>
    <div class="panel log-list">
      <div class="trow header-row">
        <div style="flex:3">Recipe</div>
        <div style="flex:1">Date</div>
        <div style="flex:0 0 60px"></div>
      </div>
      <div class="trow" v-for="entry in entries" :key="entry.id" style="cursor:default">
        <div style="flex:3">
          <router-link :to="`/recipes/${entry.recipe_id}`" class="recipe-link">{{ entry.recipe_name }}</router-link>
        </div>
        <div style="flex:1">{{ entry.cooked_at }}</div>
        <div style="flex:0 0 60px">
          <button class="btn btn-sm btn-danger" @click="confirmDelete(entry)">✕</button>
        </div>
      </div>
      <div class="trow" v-if="!entries.length" style="color:var(--text-muted)">No cooks logged yet.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'

const entries = ref([])
onMounted(load)
async function load() { entries.value = await api.cookLog.list() }

async function confirmDelete(entry) {
  if (!confirm(`Delete cook log entry for "${entry.recipe_name}" on ${entry.cooked_at}?`)) return
  await api.cookLog.remove(entry.id)
  await load()
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; height: 100%; padding: 12px; }
.top-bar { background: var(--toolbar); border: 1px solid var(--border); border-bottom: none; }
.log-list { flex: 1; overflow-y: auto; }
.header-row { background: #3a3a3a; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); cursor: default !important; }
.recipe-link { color: var(--accent); text-decoration: none; font-weight: 600; }
.recipe-link:hover { text-decoration: underline; }
</style>
```

- [ ] **Step 2: Run all backend tests**

```bash
cd server && npm test
```

Expected: all tests passing

- [ ] **Step 3: Commit**

```bash
git add client/src/views/CookLog.vue
git commit -m "feat: cook log view"
```

---

## Task 15: Production Build

- [ ] **Step 1: Build the frontend**

```bash
npm run build
```

Expected: `server/public/` created with compiled assets

- [ ] **Step 2: Start in production mode**

```bash
NODE_ENV=production npm start
```

Open http://localhost:3000 — full app works, all 4 pages load.

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete LetMeCook — ingredients, recipes, cook log, dashboard"
```
