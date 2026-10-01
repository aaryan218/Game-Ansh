const orgsService = require('./orgs.service');

async function getOrg(req, res, next) {
  try { res.json({ status: 'success', data: await orgsService.getOrg(req.params.id) }); }
  catch (err) { next(err); }
}
async function updateOrg(req, res, next) {
  try { res.json({ status: 'success', data: await orgsService.updateOrg(req.params.id, req.user.id, req.body) }); }
  catch (err) { next(err); }
}
async function getOrgTeams(req, res, next) {
  try { res.json({ status: 'success', data: await orgsService.getOrgTeams(req.params.id) }); }
  catch (err) { next(err); }
}
async function getOrgPlayers(req, res, next) {
  try { res.json({ status: 'success', data: await orgsService.getOrgPlayers(req.params.id) }); }
  catch (err) { next(err); }
}

module.exports = { getOrg, updateOrg, getOrgTeams, getOrgPlayers };
