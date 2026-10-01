const { query } = require('../../shared/db');
const { NotFoundError, ForbiddenError, BadRequestError, ConflictError } = require('../../shared/errors');
const { emitToUser } = require('../../shared/socket');

function assertForwardTransition(current, next) {
  if (current === 'accepted' || current === 'rejected') {
    throw new BadRequestError('Application is already in a terminal state');
  }
  if (next === 'applied') {
    throw new BadRequestError('Cannot move status back to applied');
  }
  if (current === 'shortlisted' && next === 'shortlisted') {
    throw new BadRequestError('Application is already shortlisted');
  }
  if (current === 'applied' && next === 'accepted') {
    throw new BadRequestError('Cannot skip shortlisting — move to shortlisted first');
  }
}

async function createPosting(teamId, orgId, { role, description }) {
  const teamRes = await query('SELECT id, org_id FROM team WHERE id = $1', [teamId]);
  if (teamRes.rowCount === 0) throw new NotFoundError('Team');
  if (teamRes.rows[0].org_id !== orgId) throw new ForbiddenError('You do not own this team');
  const result = await query(
    `INSERT INTO role_posting (team_id, role, description)
     VALUES ($1, $2, $3) RETURNING id, team_id, role, description, status, created_at`,
    [teamId, role, description ?? null],
  );
  return result.rows[0];
}

async function getTeamPostings(teamId) {
  const result = await query(
    'SELECT id, team_id, role, description, status, created_at FROM role_posting WHERE team_id = $1 ORDER BY created_at DESC',
    [teamId],
  );
  return result.rows;
}

async function applyToPosting(playerId, postingId) {
  const postingRes = await query('SELECT id, status FROM role_posting WHERE id = $1', [postingId]);
  if (postingRes.rowCount === 0) throw new NotFoundError('Posting');
  if (postingRes.rows[0].status === 'closed') throw new BadRequestError('This posting is closed');

  const existing = await query(
    'SELECT id FROM application WHERE player_id = $1 AND posting_id = $2',
    [playerId, postingId],
  );
  if (existing.rowCount > 0) throw new ConflictError('Already applied to this posting');

  const result = await query(
    `INSERT INTO application (player_id, posting_id)
     VALUES ($1, $2) RETURNING id, player_id, posting_id, status, created_at`,
    [playerId, postingId],
  );
  return result.rows[0];
}

async function updateApplicationStatus(applicationId, orgId, {newStatus, message}) {
  const appRes = await query(
    `SELECT a.id, a.status, a.player_id, rp.team_id, t.org_id
     FROM application a
     JOIN role_posting rp ON rp.id = a.posting_id
     JOIN team t ON t.id = rp.team_id
     WHERE a.id = $1`,
    [applicationId],
  );
  if (appRes.rowCount === 0) throw new NotFoundError('Application');
  const app = appRes.rows[0];
  if (app.org_id !== orgId) throw new ForbiddenError('You do not own the team for this application');

  assertForwardTransition(app.status, newStatus);

  const result = await query(
    `UPDATE application SET status = $1, updated_at = NOW()
     WHERE id = $2 RETURNING id, player_id, posting_id, status, updated_at`,
    [newStatus, applicationId],
  );
  const updated = result.rows[0];
  emitToUser(app.player_id, 'application_status_changed', { applicationId, newStatus });
  return updated;
}

async function getApplication(applicationId, requesterId, role) {
  const result = await query(
    `SELECT a.id, a.player_id, a.posting_id, a.status, a.created_at, a.updated_at,
            rp.role, rp.team_id, t.org_id
     FROM application a
     JOIN role_posting rp ON rp.id = a.posting_id
     JOIN team t ON t.id = rp.team_id
     WHERE a.id = $1`,
    [applicationId],
  );
  if (result.rowCount === 0) throw new NotFoundError('Application');
  const app = result.rows[0];
  if (role === 'player' && app.player_id !== requesterId) throw new ForbiddenError('Access denied');
  if (role === 'org' && app.org_id !== requesterId) throw new ForbiddenError('Access denied');
  return app;
}

async function closePosting(postingId, orgId) {
  const res = await query(
    `SELECT rp.id, t.org_id FROM role_posting rp
     JOIN team t ON t.id = rp.team_id WHERE rp.id = $1`,
    [postingId],
  );
  if (res.rowCount === 0) throw new NotFoundError('Posting');
  if (res.rows[0].org_id !== orgId) throw new ForbiddenError('Access denied');
  const result = await query(
    "UPDATE role_posting SET status = 'closed' WHERE id = $1 RETURNING *",
    [postingId],
  );
  return result.rows[0];
}

module.exports = {
  assertForwardTransition,
  createPosting,
  getTeamPostings,
  applyToPosting,
  updateApplicationStatus,
  getApplication,
  closePosting,
};
