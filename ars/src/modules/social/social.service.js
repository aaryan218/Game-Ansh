const { query } = require('../../shared/db');
const { NotFoundError, ConflictError } = require('../../shared/errors');
const { buildCursorPage, parsePaginationParams } = require('../../shared/pagination');
const { emitToUser } = require('../../shared/socket');

async function follow(playerId, { target_type, target_id }) {
  const table = target_type === 'org' ? 'org' : 'team';
  const targetRes = await query(`SELECT id FROM "${table}" WHERE id = $1`, [target_id]);
  if (targetRes.rowCount === 0) throw new NotFoundError(target_type);

  const existing = await query(
    'SELECT id FROM follow WHERE player_id = $1 AND target_type = $2 AND target_id = $3',
    [playerId, target_type, target_id],
  );
  if (existing.rowCount > 0) throw new ConflictError('Already following');

  const result = await query(
    'INSERT INTO follow (player_id, target_type, target_id) VALUES ($1, $2, $3) RETURNING id, player_id, target_type, target_id, created_at',
    [playerId, target_type, target_id],
  );
  return result.rows[0];
}

async function unfollow(playerId, { target_type, target_id }) {
  const result = await query(
    'DELETE FROM follow WHERE player_id = $1 AND target_type = $2 AND target_id = $3 RETURNING id',
    [playerId, target_type, target_id],
  );
  if (result.rowCount === 0) throw new NotFoundError('Follow relationship');
  return { message: 'Unfollowed successfully' };
}

async function getFeed(playerId, queryParams) {
  const { limit, cursor } = parsePaginationParams(queryParams);
  const cursorClause = cursor ? `AND p.id > '${cursor}'` : '';
  const sql = `
    SELECT p.id, p.author_type, p.author_id, p.content, p.created_at,
           CASE WHEN p.author_type = 'org' THEN o.name WHEN p.author_type = 'team' THEN t.name END AS author_name
    FROM post p
    LEFT JOIN org o ON p.author_type = 'org' AND o.id = p.author_id
    LEFT JOIN team t ON p.author_type = 'team' AND t.id = p.author_id
    WHERE (
      (p.author_type = 'org' AND p.author_id IN (SELECT target_id FROM follow WHERE player_id = $1 AND target_type = 'org'))
      OR
      (p.author_type = 'team' AND p.author_id IN (SELECT target_id FROM follow WHERE player_id = $1 AND target_type = 'team'))
    )
    ${cursorClause}
    ORDER BY p.created_at DESC
    LIMIT $2
  `;
  const result = await query(sql, [playerId, limit + 1]);
  return buildCursorPage(result.rows, limit);
}

async function createPost(authorType, authorId, content) {
  const result = await query(
    `INSERT INTO post (author_type, author_id, content)
     VALUES ($1, $2, $3) RETURNING id, author_type, author_id, content, created_at`,
    [authorType, authorId, content],
  );
  const post = result.rows[0];

  // Notify followers
  const followers = await query(
    'SELECT player_id FROM follow WHERE target_type = $1 AND target_id = $2',
    [authorType, authorId],
  );
  for (const row of followers.rows) {
    emitToUser(row.player_id, 'new_post', post);
  }
  return post;
}

async function getPost(id) {
  const result = await query(
    'SELECT id, author_type, author_id, content, created_at FROM post WHERE id = $1',
    [id],
  );
  if (result.rowCount === 0) throw new NotFoundError('Post');
  return result.rows[0];
}

module.exports = { follow, unfollow, getFeed, createPost, getPost };
