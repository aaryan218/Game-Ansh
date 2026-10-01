const { Router } = require('express');
const { createTournament, getTournament, updateTournament, registerTeam, getTournamentRegistrations, updateRegistration } = require('./tournaments.controller');
const { authenticate, authorize } = require('../../shared/auth/middleware');
const { validate } = require('../../shared/validation');
const { createTournamentSchema, updateTournamentSchema, registerTeamSchema, updateRegistrationSchema } = require('./tournaments.schema');
const { strictLimiter } = require('../../shared/ratelimit');

const router = Router();

router.post('/', authenticate, authorize('organizer'), strictLimiter, validate(createTournamentSchema), createTournament);
router.get('/:id', getTournament);
router.patch('/:id', authenticate, authorize('organizer'), validate(updateTournamentSchema), updateTournament);
router.post('/:id/register', authenticate, authorize('org'), validate(registerTeamSchema), registerTeam);
router.get('/:id/registrations', authenticate, authorize('organizer'), getTournamentRegistrations);
router.patch('/:id/registrations/:regId', authenticate, authorize('organizer'), validate(updateRegistrationSchema), updateRegistration);

module.exports = router;
