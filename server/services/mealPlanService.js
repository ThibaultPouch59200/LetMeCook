const mealPlanRepository = require('../repositories/mealPlanRepository')

function getWeek(weekStart) {
  if (!weekStart) throw new Error('weekStart is required')
  return mealPlanRepository.getWeek(weekStart)
}

function upsertSlot(weekStart, day, mealType, recipeId) {
  if (!Number.isInteger(day) || day < 0 || day > 6) {
    throw new Error('day must be an integer between 0 and 6')
  }
  if (mealType !== 'lunch' && mealType !== 'dinner') {
    throw new Error('mealType must be lunch or dinner')
  }
  if (!mealPlanRepository.recipeExists(recipeId)) throw new Error('recipe not found')
  mealPlanRepository.upsert(weekStart, day, mealType, recipeId)
}

function removeSlot(weekStart, day, mealType) {
  mealPlanRepository.remove(weekStart, day, mealType)
}

module.exports = { getWeek, upsertSlot, removeSlot }
