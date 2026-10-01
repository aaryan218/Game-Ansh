const { Router } = require('express');
const { verifyOrg, verifyOrganizer, listUsers } = require('./admin.controller');
const { authenticate, authorize } = require('../../shared/auth/middleware');

const router = Router();

router.use(authenticate, authorize(['admin', 'root']));
router.patch('/orgs/:id/verify', verifyOrg);
router.patch('/organizers/:id/verify', verifyOrganizer);
router.get('/users', listUsers);

module.exports = router;
