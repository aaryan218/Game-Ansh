const tournamentsService = require('./tournaments.service');

async function createTournament(req, res, next) {
  try { res.status(201).json({ status: 'success', data: await tournamentsService.createTournament(req.user.id, req.body) }); }
  catch (err) { next(err); }
}
async function getTournament(req, res, next) {
  try { res.json({ status: 'success', data: await tournamentsService.getTournament(req.params.id) }); }
  catch (err) { next(err); }
}
async function updateTournament(req, res, next) {
  try { res.json({ status: 'success', data: await tournamentsService.updateTournament(req.params.id, req.user.id, req.body) }); }
  catch (err) { next(err); }
}
async function registerTeam(req, res, next) {
  try { res.status(201).json({ status: 'success', data: await tournamentsService.registerTeam(req.params.id, req.body.team_id, req.user.id) }); }
  catch (err) { next(err); }
}
async function getTournamentRegistrations(req, res, next) {
  try { res.json({ status: 'success', data: await tournamentsService.getTournamentRegistrations(req.params.id, req.user.id) }); }
  catch (err) { next(err); }
}
async function updateRegistration(req, res, next) {
  try { res.json({ status: 'success', data: await tournamentsService.updateRegistration(req.params.regId, req.user.id, req.body.status) }); }
  catch (err) { next(err); }
}

module.exports = { createTournament, getTournament, updateTournament, registerTeam, getTournamentRegistrations, updateRegistration };
