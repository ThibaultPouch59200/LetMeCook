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
