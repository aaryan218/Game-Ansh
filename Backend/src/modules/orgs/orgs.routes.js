const { Router } = require('express');
const { getOrg, updateOrg, getOrgTeams, getOrgPlayers } = require('./orgs.controller');
const { authenticate, authorize } = require('../../shared/auth/middleware');

const router = Router();

router.get('/:id', getOrg);
router.put('/:id', authenticate, authorize('org'), updateOrg);
router.get('/:id/teams', getOrgTeams);
router.get('/:id/players', getOrgPlayers);

module.exports = router;
