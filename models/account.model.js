const db = require('../config/db');

async function create(account) {
  const {
    title,
    firstName,
    lastName,
    email,
    passwordHash,
    role,
    verificationToken
  } = account;

  const [result] = await db.query(
    `INSERT INTO accounts 
      (title, firstName, lastName, email, passwordHash, role, verificationToken)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, firstName, lastName, email, passwordHash, role, verificationToken]
  );

  return result.insertId;
}

async function findByEmail(email) {
  const [rows] = await db.query(
    'SELECT * FROM accounts WHERE email = ?',
    [email]
  );

  return rows[0];
}

async function findById(id) {
  const [rows] = await db.query(
    'SELECT * FROM accounts WHERE id = ?',
    [id]
  );

  return rows[0];
}

async function findByVerificationToken(token) {
  const [rows] = await db.query(
    'SELECT * FROM accounts WHERE verificationToken = ?',
    [token]
  );

  return rows[0];
}

async function markVerified(id) {
  await db.query(
    `UPDATE accounts
     SET verified = NOW(), verificationToken = NULL
     WHERE id = ?`,
    [id]
  );
}

async function getAll() {
  const [rows] = await db.query(
    `SELECT id, title, firstName, lastName, email, role, verified, created, updated
     FROM accounts
     ORDER BY id ASC`
  );

  return rows;
}

async function updateRefreshToken(accountId, token) {
  await db.query(
    `INSERT INTO refreshTokens (accountId, token, expires)
     VALUES (?, ?, ?)`,
    [accountId, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
  );
}

async function findRefreshToken(token) {
  const [rows] = await db.query(
    `SELECT rt.*, a.id AS accountId, a.title, a.firstName, a.lastName, a.email, a.role, a.verified
     FROM refreshTokens rt
     JOIN accounts a ON a.id = rt.accountId
     WHERE rt.token = ?`,
    [token]
  );

  return rows[0];
}

async function revokeRefreshToken(token, replacedByToken = null) {
  await db.query(
    `UPDATE refreshTokens
     SET revoked = NOW(), replacedByToken = ?
     WHERE token = ?`,
    [replacedByToken, token]
  );
}

module.exports = {
  create,
  findByEmail,
  findById,
  findByVerificationToken,
  markVerified,
  getAll,
  updateRefreshToken,
  findRefreshToken,
  revokeRefreshToken
};
