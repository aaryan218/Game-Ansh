const { query } = require('../../shared/db');
const { NotFoundError, ForbiddenError } = require('../../shared/errors');

async function getPlayer(id) {
  const result = await query(
    `SELECT p.id, p.username, p.email, p.game_ign, p.team_id, p.org_id, p.created_at,
            t.name AS team_name, o.name AS org_name
     FROM player p
     LEFT JOIN team t ON t.id = p.team_id
     LEFT JOIN org o ON o.id = p.org_id
     WHERE p.id = $1`,
    [id],
  );
  if (result.rowCount === 0) throw new NotFoundError('Player');
  return result.rows[0];
}

async function updatePlayer(id, requesterId, data) {
  if (id !== requesterId) throw new ForbiddenError("Cannot edit another player's profile");
  const sets = [];
  const values = [];
  if (data.username !== undefined) { sets.push(`username = $${sets.length + 1}`); values.push(data.username); }
  if (data.game_ign !== undefined) { sets.push(`game_ign = $${sets.length + 1}`); values.push(data.game_ign); }
  if (sets.length === 0) throw new Error('No fields to update');
  values.push(id);
  const result = await query(
    `UPDATE player SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING id, username, email, game_ign, team_id, org_id, created_at`,
    values,
  );
  return result.rows[0];
}

module.exports = { getPlayer, updatePlayer };
