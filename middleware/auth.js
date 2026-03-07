// backend/middleware/auth.js
// Middleware d'authentification

import { verifyJWT } from '../utils/passwordUtils.js';

/**
 * Middleware pour vérifier et décoder le JWT
 */
export function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided',
        code: 'NO_TOKEN'
      });
    }
    
    const payload = verifyJWT(token);
    
    if (!payload) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }
    
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
}

/**
 * Middleware pour vérifier que l'utilisateur est membre (pas admin)
 */
export function requireMember(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role === 'admin') {
    return res.status(403).json({ error: 'Admin access not allowed here' });
  }
  
  next();
}

/**
 * Middleware pour vérifier que l'utilisateur est admin
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
}

/**
 * Middleware pour vérifier que l'utilisateur accède à son propre profil
 */
export function requireOwnProfile(req, res, next) {
  const requestedMemberId = parseInt(req.params.id);
  const userMemberId = req.user?.memberId;
  const isAdmin = req.user?.role === 'admin';
  
  if (requestedMemberId !== userMemberId && !isAdmin) {
    return res.status(403).json({ 
      error: 'You can only access your own profile',
      code: 'FORBIDDEN'
    });
  }
  
  next();
}

/**
 * Middleware pour logger les accès
 */
export function logAccess(req, res, next) {
  const timestamp = new Date().toISOString();
  const user = req.user ? `user_${req.user.memberId}` : 'anonymous';
  console.log(`[${timestamp}] ${user} -> ${req.method} ${req.path}`);
  next();
}
