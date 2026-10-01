const playersService = require('./players.service');

async function getPlayer(req, res, next) {
  try { res.json({ status: 'success', data: await playersService.getPlayer(req.params.id) }); }
  catch (err) { next(err); }
}

async function updatePlayer(req, res, next) {
  try { res.json({ status: 'success', data: await playersService.updatePlayer(req.params.id, req.user.id, req.body) }); }
  catch (err) { next(err); }
}

module.exports = { getPlayer, updatePlayer };
