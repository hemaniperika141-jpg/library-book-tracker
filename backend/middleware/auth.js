const crypto = require("crypto");

const sessions = new Map();

function createSession(user) {
  const token = crypto.randomBytes(32).toString("hex");

  sessions.set(token, {
    user,
    createdAt: Date.now()
  });

  return token;
}

function getSession(req) {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies = {};

  cookieHeader.split(";").forEach((cookie) => {
    const index = cookie.indexOf("=");

    if (index === -1) return;

    const name = cookie.slice(0, index).trim();
    const value = cookie.slice(index + 1).trim();

    cookies[name] = decodeURIComponent(value);
  });

  const token = cookies.session;

  if (!token) {
    return null;
  }

  return sessions.get(token) || null;
}

function destroySession(req) {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return;
  }

  const cookies = {};

  cookieHeader.split(";").forEach((cookie) => {
    const index = cookie.indexOf("=");

    if (index === -1) return;

    const name = cookie.slice(0, index).trim();
    const value = cookie.slice(index + 1).trim();

    cookies[name] = decodeURIComponent(value);
  });

  const token = cookies.session;

  if (token) {
    sessions.delete(token);
  }
}

function requireAuth(req, res, next) {
  const session = getSession(req);

  if (!session) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  req.user = session.user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    const session = getSession(req);

    if (!session) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    if (!roles.includes(session.user.role)) {
      return res.status(403).json({
        message: "You do not have permission"
      });
    }

    req.user = session.user;
    next();
  };
}

module.exports = {
  createSession,
  getSession,
  destroySession,
  requireAuth,
  requireRole
};