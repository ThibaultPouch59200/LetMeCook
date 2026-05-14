const express = require('express')
const router = express.Router()
const controller = require('../controllers/mealPlanController')

router.get('/', controller.getWeek)
router.put('/', controller.upsertSlot)
router.delete('/', controller.removeSlot)

module.exports = router
