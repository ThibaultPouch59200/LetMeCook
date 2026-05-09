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
