const { Router } = require('express');
const { getPlayer, updatePlayer } = require('./players.controller');
const { authenticate } = require('../../shared/auth/middleware');
const { validate } = require('../../shared/validation');
const { updatePlayerSchema } = require('./players.schema');

const router = Router();

router.get('/:id', getPlayer);
router.put('/:id', authenticate, validate(updatePlayerSchema), updatePlayer);

module.exports = router;
