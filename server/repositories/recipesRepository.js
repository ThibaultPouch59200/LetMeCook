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
