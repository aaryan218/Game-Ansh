const { query, withTransaction } = require('../../shared/db');
const { NotFoundError, ForbiddenError, BadRequestError, ConflictError } = require('../../shared/errors');

async function createTeam(orgId, { name, game }) {
  const result = await query(
    `INSERT INTO team (org_id, name, game) VALUES ($1, $2, $3)
     RETURNING id, org_id, name, game, status, created_at`,
    [orgId, name, game],
  );
  return result.rows[0];
}

async function getTeam(id) {
  const result = await query(
    `SELECT t.id, t.name, t.game, t.status, t.org_id, t.created_at,
            o.name AS org_name,
            COALESCE(json_agg(json_build_object('id', p.id, 'username', p.username, 'game_ign', p.game_ign))
              FILTER (WHERE p.id IS NOT NULL), '[]') AS players
     FROM team t
     LEFT JOIN org o ON o.id = t.org_id
     LEFT JOIN player p ON p.team_id = t.id
     WHERE t.id = $1
     GROUP BY t.id, o.name`,
    [id],
  );
  if (result.rowCount === 0) throw new NotFoundError('Team');
  return result.rows[0];
}

async function updateTeam(id, orgId, data) {
  const team = await query('SELECT id, org_id FROM team WHERE id = $1', [id]);
  if (team.rowCount === 0) throw new NotFoundError('Team');
  if (team.rows[0].org_id !== orgId) throw new ForbiddenError('You do not own this team');
  const result = await query(
    `UPDATE team SET name = COALESCE($1, name), game = COALESCE($2, game)
     WHERE id = $3 RETURNING id, org_id, name, game, status, created_at`,
    [data.name ?? null, data.game ?? null, id],
  );
  return result.rows[0];
}

async function addPlayerToTeam(teamId, playerId, orgId) {
  return withTransaction(async (client) => {
    const teamRes = await client.query('SELECT id, org_id, status FROM team WHERE id = $1', [teamId]);
    if (teamRes.rowCount === 0) throw new NotFoundError('Team');
    const team = teamRes.rows[0];
    if (team.org_id !== orgId) throw new ForbiddenError('You do not own this team');

    const playerRes = await client.query('SELECT id, team_id FROM player WHERE id = $1', [playerId]);
    if (playerRes.rowCount === 0) throw new NotFoundError('Player');
    if (playerRes.rows[0].team_id) throw new ConflictError('Player is already on a team');

    await client.query('UPDATE player SET team_id = $1, org_id = NULL WHERE id = $2', [teamId, playerId]);

    const countRes = await client.query('SELECT COUNT(*) AS cnt FROM player WHERE team_id = $1', [teamId]);
    const memberCount = Number(countRes.rows[0].cnt);

    if (memberCount >= 5 && team.status === 'draft') {
      await client.query("UPDATE team SET status = 'active' WHERE id = $1", [teamId]);
    }

    const updatedTeam = await client.query(
      'SELECT id, org_id, name, game, status, created_at FROM team WHERE id = $1',
      [teamId],
    );
    return updatedTeam.rows[0];
  });
}

async function removePlayerFromTeam(teamId, playerId, orgId) {
  const teamRes = await query('SELECT id, org_id FROM team WHERE id = $1', [teamId]);
  if (teamRes.rowCount === 0) throw new NotFoundError('Team');
  if (teamRes.rows[0].org_id !== orgId) throw new ForbiddenError('You do not own this team');

  const playerRes = await query('SELECT id, team_id FROM player WHERE id = $1', [playerId]);
  if (playerRes.rowCount === 0) throw new NotFoundError('Player');
  if (playerRes.rows[0].team_id !== teamId) throw new BadRequestError('Player is not on this team');

  await query('UPDATE player SET team_id = NULL WHERE id = $1', [playerId]);
  return { message: 'Player removed from team' };
}

module.exports = { createTeam, getTeam, updateTeam, addPlayerToTeam, removePlayerFromTeam };
