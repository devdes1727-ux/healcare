const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  let token = req.header('Authorization');
  if (!token && req.query.token) token = req.query.token;
  
  if (!token) return res.status(401).json({ message: 'Auth Error' });

  try {
    const rawToken = token.replace(/^Bearer\s+/i, '').trim();
    const decoded = jwt.verify(rawToken, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded.user;
    next();
  } catch (e) {
    console.error('JWT Error:', e.message);
    const message = e.name === 'TokenExpiredError' ? 'Token Expired' : 'Invalid Token';
    res.status(401).json({ message });
  }
};
