const { Router } = require('express');
const { getOrg, updateOrg, getOrgTeams, getOrgPlayers } = require('./orgs.controller');
const { authenticate, authorize } = require('../../shared/auth/middleware');

const router = Router();

router.get('/:id', getOrg);
router.put('/:id', authenticate, authorize(['org', 'admin', 'root']), updateOrg);
router.get('/:id/teams', authenticate, authorize(['org', 'admin', 'root']), getOrgTeams);
router.get('/:id/players', authenticate, authorize(['org', 'admin', 'root']), getOrgPlayers);

module.exports = router;
