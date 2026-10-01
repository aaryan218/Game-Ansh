const { query } = require('../../shared/db');
const { NotFoundError } = require('../../shared/errors');

async function verifyOrg(id) {
  const result = await query(
    'UPDATE org SET verified = true WHERE id = $1 RETURNING id, name, email, verified', [id],
  );
  if (result.rowCount === 0) throw new NotFoundError('Org');
  return result.rows[0];
}

async function verifyOrganizer(id) {
  const result = await query(
    'UPDATE tournament_organizer SET verified = true WHERE id = $1 RETURNING id, name, email, verified', [id],
  );
  if (result.rowCount === 0) throw new NotFoundError('Tournament organizer');
  return result.rows[0];
}

async function listUsers() {
  const [players, orgs, organizers] = await Promise.all([
    query('SELECT id, username, email, created_at FROM player ORDER BY created_at DESC LIMIT 50'),
    query('SELECT id, name, email, verified, created_at FROM org ORDER BY created_at DESC LIMIT 50'),
    query('SELECT id, name, email, verified, created_at FROM tournament_organizer ORDER BY created_at DESC LIMIT 50'),
  ]);
  return { players: players.rows, orgs: orgs.rows, organizers: organizers.rows };
}

module.exports = { verifyOrg, verifyOrganizer, listUsers };
