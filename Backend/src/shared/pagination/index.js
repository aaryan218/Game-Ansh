function encodeCursor(id) {
  return Buffer.from(id).toString('base64url');
}

function decodeCursor(cursor) {
  return Buffer.from(cursor, 'base64url').toString('utf8');
}

function buildCursorPage(rows, limit) {
  const hasMore = rows.length > (limit + 1);
  const data = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? encodeCursor(data[data.length - 1].id) : null;
  return { data, nextCursor, hasMore };
}

function parsePaginationParams(query) {
  const limit = Math.min(Number(query.limit), 100);
  const cursor = typeof query.cursor === 'string' ? decodeCursor(query.cursor) : null;
  return { limit, cursor };
}

module.exports = { encodeCursor, decodeCursor, buildCursorPage, parsePaginationParams };
