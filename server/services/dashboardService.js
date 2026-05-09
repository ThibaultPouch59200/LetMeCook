const ingredientsService = require('./ingredientsService')
const ingredientsRepo = require('../repositories/ingredientsRepository')
const cookLogRepo = require('../repositories/cookLogRepository')
const recipesRepo = require('../repositories/recipesRepository')
const db = require('../db')

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

  const totalCooks = db.prepare('SELECT COUNT(*) as count FROM cook_log').get().count

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
