const { Router } = require('express');
const { follow, unfollow, getFeed, createPost, getPost } = require('./social.controller');
const { authenticate, authorize } = require('../../shared/auth/middleware');
const { validate } = require('../../shared/validation');
const { followSchema, createPostSchema } = require('./social.schema');
const { writeLimiter } = require('../../shared/ratelimit');

const router = Router();

router.post('/follow', authenticate, authorize('player'), validate(followSchema), follow);
router.delete('/follow', authenticate, authorize('player'), validate(followSchema), unfollow);
router.get('/feed', authenticate, authorize('player'), getFeed);
router.post('/posts', authenticate, authorize('org'), writeLimiter, validate(createPostSchema), createPost);
router.get('/posts/:id', getPost);

module.exports = router;
