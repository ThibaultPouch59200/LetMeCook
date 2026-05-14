const db = require('../db')

function getWeek(weekStart) {
  return db.prepare(`
    SELECT mp.day, mp.meal_type AS mealType, r.id AS recipeId, r.name AS recipeName
    FROM meal_plan mp
    JOIN recipes r ON r.id = mp.recipe_id
    WHERE mp.week_start = ?
    ORDER BY mp.day, mp.meal_type
  `).all(weekStart).map(row => ({
    day: row.day,
    mealType: row.mealType,
    recipe: { id: row.recipeId, name: row.recipeName }
  }))
}

function upsert(weekStart, day, mealType, recipeId) {
  db.prepare(`
    INSERT INTO meal_plan (week_start, day, meal_type, recipe_id) VALUES (?, ?, ?, ?)
    ON CONFLICT(week_start, day, meal_type) DO UPDATE SET recipe_id = excluded.recipe_id
  `).run(weekStart, day, mealType, recipeId)
}

function remove(weekStart, day, mealType) {
  db.prepare('DELETE FROM meal_plan WHERE week_start = ? AND day = ? AND meal_type = ?')
    .run(weekStart, day, mealType)
}

function recipeExists(id) {
  return !!db.prepare('SELECT id FROM recipes WHERE id = ?').get(id)
}

module.exports = { getWeek, upsert, remove, recipeExists }
