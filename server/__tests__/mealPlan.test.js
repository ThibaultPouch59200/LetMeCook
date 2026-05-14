const request = require('supertest')
const app = require('../app')
const db = require('../db')

beforeEach(() => {
  db.prepare('DELETE FROM meal_plan').run()
  db.prepare('DELETE FROM recipe_ingredients').run()
  db.prepare('DELETE FROM cook_log').run()
  db.prepare('DELETE FROM recipes').run()
  db.prepare('DELETE FROM ingredients').run()
})

function createRecipe(name = 'Test Recipe') {
  return db.prepare("INSERT INTO recipes (name, steps) VALUES (?, '[]')").run(name).lastInsertRowid
}

describe('GET /api/meal-plan', () => {
  it('returns empty array for a week with no plan', async () => {
    const res = await request(app).get('/api/meal-plan?week=2026-05-18')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns filled slots with recipe info', async () => {
    const recipeId = createRecipe('Pasta Bolognese')
    db.prepare('INSERT INTO meal_plan (week_start, day, meal_type, recipe_id) VALUES (?, ?, ?, ?)')
      .run('2026-05-18', 0, 'lunch', recipeId)
    const res = await request(app).get('/api/meal-plan?week=2026-05-18')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0]).toMatchObject({
      day: 0,
      mealType: 'lunch',
      recipe: { id: recipeId, name: 'Pasta Bolognese' }
    })
  })
})

describe('PUT /api/meal-plan', () => {
  it('creates a meal slot', async () => {
    const recipeId = createRecipe()
    const res = await request(app).put('/api/meal-plan').send({
      weekStart: '2026-05-18', day: 1, mealType: 'dinner', recipeId
    })
    expect(res.status).toBe(200)
    const row = db.prepare(
      'SELECT * FROM meal_plan WHERE week_start = ? AND day = ? AND meal_type = ?'
    ).get('2026-05-18', 1, 'dinner')
    expect(row.recipe_id).toBe(recipeId)
  })

  it('replaces an existing slot', async () => {
    const id1 = createRecipe('A')
    const id2 = createRecipe('B')
    db.prepare('INSERT INTO meal_plan (week_start, day, meal_type, recipe_id) VALUES (?, ?, ?, ?)')
      .run('2026-05-18', 0, 'lunch', id1)
    await request(app).put('/api/meal-plan').send({
      weekStart: '2026-05-18', day: 0, mealType: 'lunch', recipeId: id2
    })
    const row = db.prepare(
      'SELECT * FROM meal_plan WHERE week_start = ? AND day = ? AND meal_type = ?'
    ).get('2026-05-18', 0, 'lunch')
    expect(row.recipe_id).toBe(id2)
  })

  it('rejects day outside 0-6', async () => {
    const recipeId = createRecipe()
    const res = await request(app).put('/api/meal-plan').send({
      weekStart: '2026-05-18', day: 7, mealType: 'lunch', recipeId
    })
    expect(res.status).toBe(400)
  })

  it('rejects invalid mealType', async () => {
    const recipeId = createRecipe()
    const res = await request(app).put('/api/meal-plan').send({
      weekStart: '2026-05-18', day: 0, mealType: 'breakfast', recipeId
    })
    expect(res.status).toBe(400)
  })

  it('rejects non-existent recipeId', async () => {
    const res = await request(app).put('/api/meal-plan').send({
      weekStart: '2026-05-18', day: 0, mealType: 'lunch', recipeId: 99999
    })
    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/meal-plan', () => {
  it('returns 200 when slot does not exist (no-op)', async () => {
    const res = await request(app).delete('/api/meal-plan').send({
      weekStart: '2026-05-18', day: 0, mealType: 'lunch'
    })
    expect(res.status).toBe(200)
  })

  it('clears a slot', async () => {
    const recipeId = createRecipe()
    db.prepare('INSERT INTO meal_plan (week_start, day, meal_type, recipe_id) VALUES (?, ?, ?, ?)')
      .run('2026-05-18', 0, 'lunch', recipeId)
    const res = await request(app).delete('/api/meal-plan').send({
      weekStart: '2026-05-18', day: 0, mealType: 'lunch'
    })
    expect(res.status).toBe(200)
    const row = db.prepare(
      'SELECT * FROM meal_plan WHERE week_start = ? AND day = ? AND meal_type = ?'
    ).get('2026-05-18', 0, 'lunch')
    expect(row).toBeUndefined()
  })
})
