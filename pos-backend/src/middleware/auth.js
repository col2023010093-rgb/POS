const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('⚠️ No authorization header');
      return res.status(401).json({ message: 'No token provided' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.log('⚠️ Invalid authorization format');
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token || token === 'undefined') {  // ← ADD THIS CHECK
      console.log('⚠️ Empty or undefined token');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('🔑 Verifying token:', token.slice(0, 20) + '...');

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret);
    
    req.userId = decoded.userId || decoded.id || decoded.sub;
    req.user = decoded;
    
    console.log('✅ Token verified for user:', req.userId);
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    return res.status(401).json({ 
      message: 'Invalid or expired token',
      error: error.message 
    });
  }
};

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
module.exports.authenticate = verifyToken;