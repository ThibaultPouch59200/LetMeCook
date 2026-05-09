const service = require('../services/dashboardService')

function get(req, res) { res.json(service.getDashboard()) }

module.exports = { get }
