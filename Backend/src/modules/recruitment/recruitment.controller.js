const recruitmentService = require('./recruitment.service');

async function createPosting(req, res, next) {
  try { res.status(201).json({ status: 'success', data: await recruitmentService.createPosting(req.params.teamId, req.user.id, req.body) }); }
  catch (err) { next(err); }
}
async function getTeamPostings(req, res, next) {
  try { res.json({ status: 'success', data: await recruitmentService.getTeamPostings(req.params.teamId) }); }
  catch (err) { next(err); }
}
async function applyToPosting(req, res, next) {
  try { res.status(201).json({ status: 'success', data: await recruitmentService.applyToPosting(req.user.id, req.params.postingId) }); }
  catch (err) { next(err); }
}
async function updateApplicationStatus(req, res, next) {
  try { res.json({ status: 'success', data: await recruitmentService.updateApplicationStatus(req.params.id, req.user.id, req.body.status) }); }
  catch (err) { next(err); }
}
async function getApplication(req, res, next) {
  try { res.json({ status: 'success', data: await recruitmentService.getApplication(req.params.id, req.user.id, req.user.role) }); }
  catch (err) { next(err); }
}
async function closePosting(req, res, next) {
  try { res.json({ status: 'success', data: await recruitmentService.closePosting(req.params.postingId, req.user.id) }); }
  catch (err) { next(err); }
}

module.exports = { createPosting, getTeamPostings, applyToPosting, updateApplicationStatus, getApplication, closePosting };
