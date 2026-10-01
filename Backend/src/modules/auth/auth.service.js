const bcrypt = require('bcrypt');
const { query } = require('../../shared/db');
const { signToken } = require('../../shared/auth/jwt');
const { ConflictError, UnauthorizedError, BadRequestError } = require('../../shared/errors');

const SALT_ROUNDS = 12;

async function signupPlayer({ username, email, password, game_ign }) {
  const existing = await query('SELECT id FROM player WHERE email = $1 OR username = $2', [email, username]);
  if (existing.rowCount > 0) throw new ConflictError('Email or username already in use');
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await query(
    `INSERT INTO player (username, email, password_hash, game_ign)
     VALUES ($1, $2, $3, $4) RETURNING id, username, email, game_ign, created_at`,
    [username, email, password_hash, game_ign ?? null],
  );
  const player = result.rows[0];
  const token = signToken({ id: player.id, role: 'player' });
  return { token, user: player };
}

async function signupOrg({ name, email, password }) {
  const existing = await query('SELECT id FROM org WHERE email = $1', [email]);
  if (existing.rowCount > 0) throw new ConflictError('Email already in use');
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await query(
    `INSERT INTO org (name, email, password_hash)
     VALUES ($1, $2, $3) RETURNING id, name, email, verified, created_at`,
    [name, email, password_hash],
  );
  const org = result.rows[0];
  const token = signToken({ id: org.id, role: 'org' });
  return { token, user: org };
}

async function signupOrganizer({ name, email, password }) {
  const existing = await query('SELECT id FROM tournament_organizer WHERE email = $1', [email]);
  if (existing.rowCount > 0) throw new ConflictError('Email already in use');
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await query(
    `INSERT INTO tournament_organizer (name, email, password_hash)
     VALUES ($1, $2, $3) RETURNING id, name, email, verified, created_at`,
    [name, email, password_hash],
  );
  const organizer = result.rows[0];
  const token = signToken({ id: organizer.id, role: 'organizer' });
  return { token, user: organizer };
}

async function login({ email, password, role }) {
  const tableMap = { player: 'player', org: 'org', organizer: 'tournament_organizer', admin: 'admin' };
  const selectMap = {
    player: 'id, username, email, password_hash',
    org: 'id, name, email, password_hash',
    organizer: 'id, name, email, password_hash',
    admin: 'id, email, password_hash',
  };
  const table = tableMap[role];
  if (!table) throw new BadRequestError('Invalid role');
  const result = await query(`SELECT ${selectMap[role]} FROM "${table}" WHERE email = $1`, [email]);
  if (result.rowCount === 0) throw new UnauthorizedError('Invalid credentials');
  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new UnauthorizedError('Invalid credentials');
  const { password_hash, ...safeUser } = user;
  const token = signToken({ id: user.id, role });
  return { token, user: safeUser };
}

module.exports = { signupPlayer, signupOrg, signupOrganizer, login };
