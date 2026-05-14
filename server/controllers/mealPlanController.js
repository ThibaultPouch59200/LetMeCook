const mealPlanService = require('../services/mealPlanService')

function getWeek(req, res) {
  try {
    res.json(mealPlanService.getWeek(req.query.week))
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

function upsertSlot(req, res) {
  try {
    const { weekStart, day, mealType, recipeId } = req.body
    mealPlanService.upsertSlot(weekStart, day, mealType, recipeId)
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

function removeSlot(req, res) {
  try {
    const { weekStart, day, mealType } = req.body
    mealPlanService.removeSlot(weekStart, day, mealType)
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

module.exports = { getWeek, upsertSlot, removeSlot }
