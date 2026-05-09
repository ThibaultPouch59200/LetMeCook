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
