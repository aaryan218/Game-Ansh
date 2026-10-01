const { query } = require('../../shared/db');
const { BadRequestError } = require('../../shared/errors');
const { buildCursorPage, parsePaginationParams } = require('../../shared/pagination');
const { emitToUser } = require('../../shared/socket');

function getParticipants(threadId) {
  const parts = threadId.split(':');
  if (parts.length !== 2) throw new BadRequestError('Invalid thread ID format');
  return [parts[0], parts[1]];
}

async function getMessages(threadId, requesterId, queryParams) {
  const [p1, p2] = getParticipants(threadId);
  if (requesterId !== p1 && requesterId !== p2) {
    throw new BadRequestError('You are not part of this conversation');
  }

  const { limit, cursor } = parsePaginationParams(queryParams);
  const cursorClause = cursor ? `AND m.id > '${cursor}'` : '';

  const result = await query(
    `SELECT m.id, m.sender_id, m.receiver_id, m.content, m.read, m.created_at
     FROM message m
     WHERE ((m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1))
     ${cursorClause}
     ORDER BY m.created_at ASC
     LIMIT $3`,
    [p1, p2, limit + 1],
  );

  const otherId = requesterId === p1 ? p2 : p1;
  await query(
    'UPDATE message SET read = true WHERE receiver_id = $1 AND sender_id = $2 AND read = false',
    [requesterId, otherId],
  );

  return buildCursorPage(result.rows, limit);
}

async function sendMessage(senderId, receiverId, content) {
  if (senderId === receiverId) throw new BadRequestError('Cannot message yourself');
  const result = await query(
    `INSERT INTO message (sender_id, receiver_id, content)
     VALUES ($1, $2, $3) RETURNING id, sender_id, receiver_id, content, read, created_at`,
    [senderId, receiverId, content],
  );
  const message = result.rows[0];
  emitToUser(receiverId, 'new_message', message);
  return message;
}

module.exports = { getMessages, sendMessage };
