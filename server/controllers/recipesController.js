const service = require('../services/recipesService')

function list(req, res) { res.json(service.listRecipes()) }

function get(req, res) {
  try { res.json(service.getRecipe(Number(req.params.id))) }
  catch (e) { res.status(404).json({ error: e.message }) }
}

function create(req, res) {
  try { res.status(201).json(service.createRecipe(req.body)) }
  catch (e) { res.status(400).json({ error: e.message }) }
}

function update(req, res) {
  try { res.json(service.updateRecipe(Number(req.params.id), req.body)) }
  catch (e) { res.status(e.message === 'Recipe not found' ? 404 : 400).json({ error: e.message }) }
}

function remove(req, res) {
  try { service.deleteRecipe(Number(req.params.id)); res.status(204).end() }
  catch (e) { res.status(404).json({ error: e.message }) }
}

module.exports = { list, get, create, update, remove }
