const messagingService = require('./messaging.service');

async function getMessages(req, res, next) {
  try { res.json({ status: 'success', data: await messagingService.getMessages(req.params.threadId, req.user.id, req.query) }); }
  catch (err) { next(err); }
}
async function sendMessage(req, res, next) {
  try {
    const parts = req.params.threadId.split(':');
    const receiverId = req.user.id === parts[0] ? parts[1] : parts[0];
    res.status(201).json({ status: 'success', data: await messagingService.sendMessage(req.user.id, receiverId, req.body.content) });
  } catch (err) { next(err); }
}

module.exports = { getMessages, sendMessage };
