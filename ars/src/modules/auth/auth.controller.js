const authService = require('./auth.service');
const { BadRequestError } = require('../../shared/errors');

async function signup(req, res, next) {
  try {
    const { type } = req.params;
    let result;
    if (type === 'player') result = await authService.signupPlayer(req.body);
    else if (type === 'org') result = await authService.signupOrg(req.body);
    else if (type === 'organizer') result = await authService.signupOrganizer(req.body);
    else return next(new BadRequestError(`Unknown account type: ${type}`));
    res.status(201).json({ status: 'success', data: result });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) { next(err); }
}

module.exports = { signup, login };
