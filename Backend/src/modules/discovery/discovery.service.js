const { query } = require('../../shared/db');
const { buildCursorPage, parsePaginationParams } = require('../../shared/pagination');

async function discoverTeams(queryParams) {
  const { limit, cursor } = parsePaginationParams(queryParams);
  const conditions = ['1=1'];
  const values = [];

  if (queryParams.game) { values.push(`%${queryParams.game}%`); conditions.push(`t.game ILIKE $${values.length}`); }
  if (queryParams.status) { values.push(queryParams.status); conditions.push(`t.status = $${values.length}`); }
  if (queryParams.name) { values.push(`%${queryParams.name}%`); conditions.push(`t.name ILIKE $${values.length}`); }
  if (cursor) { values.push(cursor); conditions.push(`t.id > $${values.length}`); }

  values.push(limit + 1);
  const sql = `
    SELECT t.id, t.name, t.game, t.status, t.org_id, o.name AS org_name, t.created_at
    FROM team t
    LEFT JOIN org o ON o.id = t.org_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY t.id
    LIMIT $${values.length}
  `;
  const result = await query(sql, values);
  return buildCursorPage(result.rows, limit);
}

async function discoverTournaments(queryParams) {
  const { limit, cursor } = parsePaginationParams(queryParams);
  const conditions = ['1=1'];
  const values = [];

  if (queryParams.game) { values.push(`%${queryParams.game}%`); conditions.push(`t.game ILIKE $${values.length}`); }
  if (queryParams.status) { values.push(queryParams.status); conditions.push(`t.status = $${values.length}`); }
  if (queryParams.name) { values.push(`%${queryParams.name}%`); conditions.push(`t.name ILIKE $${values.length}`); }
  if (cursor) { values.push(cursor); conditions.push(`t.id > $${values.length}`); }

  values.push(limit + 1);
  const sql = `
    SELECT t.id, t.name, t.game, t.start_date, t.status, t.organizer_id,
           o.name AS organizer_name, t.created_at
    FROM tournament t
    JOIN tournament_organizer o ON o.id = t.organizer_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY t.id
    LIMIT $${values.length}
  `;
  const result = await query(sql, values);
  return buildCursorPage(result.rows, limit);
}

module.exports = { discoverTeams, discoverTournaments };
