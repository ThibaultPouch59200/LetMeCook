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
