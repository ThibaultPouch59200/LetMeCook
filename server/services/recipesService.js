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
