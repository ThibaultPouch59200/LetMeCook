const service = require('../services/cookLogService')

function list(req, res) { res.json(service.listCooks()) }

function create(req, res) {
  try { res.status(201).json(service.logCook(req.body)) }
  catch (e) { res.status(e.message === 'Recipe not found' ? 404 : 400).json({ error: e.message }) }
}

function remove(req, res) {
  try { service.deleteCook(Number(req.params.id)); res.status(204).end() }
  catch (e) { res.status(404).json({ error: e.message }) }
}

module.exports = { list, create, remove }
