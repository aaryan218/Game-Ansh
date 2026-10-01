const { Router } = require('express');
const { createPosting, getTeamPostings, applyToPosting, updateApplicationStatus, getApplication, closePosting } = require('./recruitment.controller');
const { authenticate, authorize } = require('../../shared/auth/middleware');
const { validate } = require('../../shared/validation');
const { createPostingSchema, updateApplicationSchema } = require('./recruitment.schema');
const { strictLimiter } = require('../../shared/ratelimit');

const router = Router();

router.post('/teams/:teamId/postings', authenticate, authorize(['org', 'admin', 'root']), strictLimiter, validate(createPostingSchema), createPosting);
router.get('/teams/:teamId/postings', getTeamPostings);
router.patch('/postings/:postingId/close', authenticate, authorize(['org', 'admin', 'root']), closePosting);
router.post('/postings/:postingId/apply', authenticate, authorize(['player', 'admin', 'root']), applyToPosting);
router.get('/applications/:id', authenticate, getApplication);
router.patch('/applications/:id', authenticate, authorize(['org', 'admin', 'root']), validate(updateApplicationSchema), updateApplicationStatus);


module.exports = router;