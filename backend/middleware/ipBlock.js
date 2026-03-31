const BlockedIP = require('../models/BlockedIP');

const getIP = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    '0.0.0.0'
  );
};

const checkBlocked = async (req, res, next) => {
  const ip = getIP(req);
  req.clientIP = ip;
  try {
    const blocked = await BlockedIP.findOne({ ipAddress: ip });
    if (blocked) return res.status(403).json({ error: 'Your IP has been blocked.' });
    next();
  } catch (err) {
    next();
  }
};

module.exports = { checkBlocked, getIP };
