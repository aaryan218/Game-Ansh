const { Router } = require('express');
const { createTeam, getTeam, updateTeam, addPlayer, removePlayer } = require('./teams.controller');
const { authenticate, authorize } = require('../../shared/auth/middleware');
const { validate } = require('../../shared/validation');
const { createTeamSchema, addPlayerSchema } = require('./teams.schema');

const router = Router();

router.post('/', authenticate, authorize('org'), validate(createTeamSchema), createTeam);
router.get('/:id', getTeam);
router.put('/:id', authenticate, authorize('org'), updateTeam);
router.post('/:id/players', authenticate, authorize('org'), validate(addPlayerSchema), addPlayer);
router.delete('/:id/players/:playerId', authenticate, authorize('org'), removePlayer);

module.exports = router;
