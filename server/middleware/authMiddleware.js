// ===== server/middleware/authMiddleware.js =====
import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'supersecretkey123';
    const decoded = jwt.verify(token, jwtSecret);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT Verification failed:', error);
    return res.status(401).json({ error: 'Authentication failed. Invalid or expired token.' });
  }
}
