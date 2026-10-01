const teamsService = require('./teams.service');

async function createTeam(req, res, next) {
  try { res.status(201).json({ status: 'success', data: await teamsService.createTeam(req.user.id, req.body) }); }
  catch (err) { next(err); }
}
async function getTeam(req, res, next) {
  try { res.json({ status: 'success', data: await teamsService.getTeam(req.params.id) }); }
  catch (err) { next(err); }
}
async function updateTeam(req, res, next) {
  try { res.json({ status: 'success', data: await teamsService.updateTeam(req.params.id, req.user.id, req.body) }); }
  catch (err) { next(err); }
}
async function addPlayer(req, res, next) {
  try { res.json({ status: 'success', data: await teamsService.addPlayerToTeam(req.params.id, req.body.player_id, req.user.id) }); }
  catch (err) { next(err); }
}
async function removePlayer(req, res, next) {
  try { res.json({ status: 'success', data: await teamsService.removePlayerFromTeam(req.params.id, req.params.playerId, req.user.id) }); }
  catch (err) { next(err); }
}

module.exports = { createTeam, getTeam, updateTeam, addPlayer, removePlayer };
