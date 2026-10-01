const { Router } = require('express');
const { discoverTeams, discoverTournaments } = require('./discovery.controller');

const router = Router();

router.get('/teams', discoverTeams);
router.get('/tournaments', discoverTournaments);

module.exports = router;
