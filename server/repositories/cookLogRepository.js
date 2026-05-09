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
