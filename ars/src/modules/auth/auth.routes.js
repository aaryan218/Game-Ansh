const { Router } = require('express');
const { signup, login } = require('./auth.controller');
const { validate } = require('../../shared/validation');
const { loginSchema, playerSignupSchema, orgSignupSchema, organizerSignupSchema } = require('./auth.schema');

const router = Router();

function pickSignupSchema(req, res, next) {
  const { type } = req.params;
  if (type === 'player') return validate(playerSignupSchema)(req, res, next);
  if (type === 'org') return validate(orgSignupSchema)(req, res, next);
  if (type === 'organizer') return validate(organizerSignupSchema)(req, res, next);
  next(); // unknown type handled by controller
}

router.post('/signup/:type', pickSignupSchema, signup);
router.post('/login', validate(loginSchema), login);

module.exports = router;
