const discoveryService = require('./discovery.service');

async function discoverTeams(req, res, next) {
  try { res.json({ status: 'success', data: await discoveryService.discoverTeams(req.query) }); }
  catch (err) { next(err); }
}
async function discoverTournaments(req, res, next) {
  try { res.json({ status: 'success', data: await discoveryService.discoverTournaments(req.query) }); }
  catch (err) { next(err); }
}

module.exports = { discoverTeams, discoverTournaments };
