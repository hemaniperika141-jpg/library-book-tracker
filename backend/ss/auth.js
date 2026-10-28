const crypto = require("crypto");

const sessions = new Map();

function createSession(user) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { user, expires: Date.now() + 8 * 60 * 60 * 1000 });
  return token;
}

function getSession(req) {
  const token = req.cookies?.session;
  const session = token && sessions.get(token);
  if (!session || session.expires < Date.now()) {
    if (token) sessions.delete(token);
    return null;
  }
  return session;
}

function requireAuth(req, res, next) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ message: "Authentication required" });
  req.user = session.user;
  next();
}

function destroySession(req) {
  const token = req.cookies?.session;
  if (token) sessions.delete(token);
}

module.exports = { createSession, getSession, requireAuth, destroySession };