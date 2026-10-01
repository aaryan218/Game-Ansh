const adminService = require('./admin.service');

async function verifyOrg(req, res, next) {
  try { res.json({ status: 'success', data: await adminService.verifyOrg(req.params.id) }); }
  catch (err) { next(err); }
}
async function verifyOrganizer(req, res, next) {
  try { res.json({ status: 'success', data: await adminService.verifyOrganizer(req.params.id) }); }
  catch (err) { next(err); }
}
async function listUsers(req, res, next) {
  try { res.json({ status: 'success', data: await adminService.listUsers() }); }
  catch (err) { next(err); }
}

module.exports = { verifyOrg, verifyOrganizer, listUsers };
