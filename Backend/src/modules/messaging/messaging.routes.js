const { Router } = require('express');
const { getMessages, sendMessage } = require('./messaging.controller');
const { authenticate, authorize } = require('../../shared/auth/middleware');
const { validate } = require('../../shared/validation');
const { sendMessageSchema } = require('./messaging.schema');
const { writeLimiter } = require('../../shared/ratelimit');

const router = Router();

router.get('/:threadId', authenticate, authorize(['player', 'admin', 'root']), getMessages);
router.post('/:threadId', authenticate, authorize(['player', 'admin', 'root']   ), writeLimiter, validate(sendMessageSchema), sendMessage);

module.exports = router;
