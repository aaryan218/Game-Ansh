const { query } = require('../../shared/db');
const { NotFoundError, ForbiddenError } = require('../../shared/errors');

async function getOrg(id) {
  const result = await query('SELECT id, name, email, verified, created_at FROM org WHERE id = $1', [id]);
  if (result.rowCount === 0) throw new NotFoundError('Org');
  return result.rows[0];
}

async function updateOrg(id, requesterId, data) {
  if (id !== requesterId) throw new ForbiddenError('Cannot edit another org');
  const result = await query(
    'UPDATE org SET name = COALESCE($1, name) WHERE id = $2 RETURNING id, name, email, verified, created_at',
    [data.name ?? null, id],
  );
  return result.rows[0];
}

async function getOrgTeams(id) {
  const result = await query(
    'SELECT id, name, game, status, created_at FROM team WHERE org_id = $1 ORDER BY created_at DESC',
    [id],
  );
  return result.rows;
}

async function getOrgPlayers(id) {
  const result = await query(
    'SELECT id, username, email, game_ign, created_at FROM player WHERE org_id = $1 ORDER BY created_at DESC',
    [id],
  );
  return result.rows;
}

module.exports = { getOrg, updateOrg, getOrgTeams, getOrgPlayers };
