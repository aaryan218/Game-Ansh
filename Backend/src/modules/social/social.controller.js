const socialService = require('./social.service');

async function follow(req, res, next) {
  try { res.status(201).json({ status: 'success', data: await socialService.follow(req.user.id, req.body) }); }
  catch (err) { next(err); }
}
async function unfollow(req, res, next) {
  try { res.json({ status: 'success', data: await socialService.unfollow(req.user.id, req.body) }); }
  catch (err) { next(err); }
}
async function getFeed(req, res, next) {
  try { res.json({ status: 'success', data: await socialService.getFeed(req.user.id, req.query) }); }
  catch (err) { next(err); }
}
async function createPost(req, res, next) {
  try { res.status(201).json({ status: 'success', data: await socialService.createPost(req.user.role, req.user.id, req.body.content) }); }
  catch (err) { next(err); }
}
async function getPost(req, res, next) {
  try { res.json({ status: 'success', data: await socialService.getPost(req.params.id) }); }
  catch (err) { next(err); }
}

module.exports = { follow, unfollow, getFeed, createPost, getPost };
