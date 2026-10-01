const { query } = require('../../shared/db');
const { NotFoundError, ForbiddenError, ConflictError } = require('../../shared/errors');

async function createTournament(organizerId, { name, game, start_date }) {
  const result = await query(
    `INSERT INTO tournament (organizer_id, name, game, start_date)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [organizerId, name, game, start_date ?? null],
  );
  return result.rows[0];
}

async function getTournament(id) {
  const result = await query(
    `SELECT t.id, t.name, t.game, t.start_date, t.status,
            o.id AS organizer_id, o.name AS organizer_name, t.created_at
     FROM tournament t
     JOIN tournament_organizer o ON o.id = t.organizer_id
     WHERE t.id = $1`,
    [id],
  );
  if (result.rowCount === 0) throw new NotFoundError('Tournament');
  return result.rows[0];
}

async function updateTournament(id, organizerId, data) {
  const tourney = await query('SELECT id, organizer_id FROM tournament WHERE id = $1', [id]);
  if (tourney.rowCount === 0) throw new NotFoundError('Tournament');
  if (tourney.rows[0].organizer_id !== organizerId) throw new ForbiddenError('Not your tournament');
  const result = await query(
    `UPDATE tournament SET
       name = COALESCE($1, name), game = COALESCE($2, game),
       start_date = COALESCE($3, start_date), status = COALESCE($4, status)
     WHERE id = $5 RETURNING *`,
    [data.name ?? null, data.game ?? null, data.start_date ?? null, data.status ?? null, id],
  );
  return result.rows[0];
}

async function registerTeam(tournamentId, teamId, orgId) {
  const tourneyRes = await query('SELECT id FROM tournament WHERE id = $1', [tournamentId]);
  if (tourneyRes.rowCount === 0) throw new NotFoundError('Tournament');

  const teamRes = await query('SELECT id, org_id FROM team WHERE id = $1', [teamId]);
  if (teamRes.rowCount === 0) throw new NotFoundError('Team');
  if (teamRes.rows[0].org_id !== orgId) throw new ForbiddenError('You do not own this team');

  const existing = await query(
    'SELECT id FROM registration WHERE tournament_id = $1 AND team_id = $2',
    [tournamentId, teamId],
  );
  if (existing.rowCount > 0) throw new ConflictError('Team already registered');

  const result = await query(
    `INSERT INTO registration (tournament_id, team_id)
     VALUES ($1, $2) RETURNING id, tournament_id, team_id, status, registered_at`,
    [tournamentId, teamId],
  );
  return result.rows[0];
}

async function getTournamentRegistrations(tournamentId, organizerId) {
  const tourney = await query('SELECT id, organizer_id FROM tournament WHERE id = $1', [tournamentId]);
  if (tourney.rowCount === 0) throw new NotFoundError('Tournament');
  if (tourney.rows[0].organizer_id !== organizerId) throw new ForbiddenError('Not your tournament');
  const result = await query(
    `SELECT r.id, r.team_id, t.name AS team_name, r.status, r.registered_at
     FROM registration r JOIN team t ON t.id = r.team_id
     WHERE r.tournament_id = $1 ORDER BY r.registered_at ASC`,
    [tournamentId],
  );
  return result.rows;
}

async function updateRegistration(regId, organizerId, status) {
  const regRes = await query(
    `SELECT r.id, t.organizer_id FROM registration r
     JOIN tournament t ON t.id = r.tournament_id WHERE r.id = $1`,
    [regId],
  );
  if (regRes.rowCount === 0) throw new NotFoundError('Registration');
  if (regRes.rows[0].organizer_id !== organizerId) throw new ForbiddenError('Not your tournament');
  const result = await query('UPDATE registration SET status = $1 WHERE id = $2 RETURNING *', [status, regId]);
  return result.rows[0];
}

module.exports = { createTournament, getTournament, updateTournament, registerTeam, getTournamentRegistrations, updateRegistration };
