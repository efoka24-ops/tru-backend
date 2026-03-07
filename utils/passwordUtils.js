// backend/utils/passwordUtils.js
// Utilitaires pour gestion des mots de passe

import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Générer un hash simple (en production, utiliser bcrypt)
export function hashPassword(password) {
  if (!password) throw new Error('Password is required');
  
  // Pour simplifier, utiliser crypto
  // En PRODUCTION, utiliser bcryptjs:
  // const bcrypt = require('bcryptjs');
  // const salt = bcrypt.genSaltSync(10);
  // return bcrypt.hashSync(password, salt);
  
  const hash = crypto
    .pbkdf2Sync(password, 'tru_salt_key_2025', 1000, 64, 'sha512')
    .toString('hex');
  
  return hash;
}

export function comparePassword(password, hash) {
  const newHash = crypto
    .pbkdf2Sync(password, 'tru_salt_key_2025', 1000, 64, 'sha512')
    .toString('hex');
  
  return newHash === hash;
}

// Secret JWT depuis .env (IMPORTANT: doit correspondre à auth.js)
const JWT_SECRET = process.env.JWT_SECRET || 'tru_jwt_secret_key_2025';

// Générer un JWT simple
export function generateJWT(payload, secret = JWT_SECRET, expiresIn = '24h') {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const now = Date.now();
  const expiresInMs = parseExpiresIn(expiresIn);
  
  const body = {
    ...payload,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + expiresInMs) / 1000)
  };
  
  const headerEncoded = Buffer.from(JSON.stringify(header)).toString('base64url');
  const bodyEncoded = Buffer.from(JSON.stringify(body)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${headerEncoded}.${bodyEncoded}`)
    .digest('base64url');
  
  return `${headerEncoded}.${bodyEncoded}.${signature}`;
}

// Vérifier JWT
export function verifyJWT(token, secret = JWT_SECRET) {
  try {
    const [headerEncoded, bodyEncoded, signatureProvided] = token.split('.');
    
    if (!headerEncoded || !bodyEncoded || !signatureProvided) {
      return null;
    }
    
    // Vérifier la signature
    const signatureExpected = crypto
      .createHmac('sha256', secret)
      .update(`${headerEncoded}.${bodyEncoded}`)
      .digest('base64url');
    
    if (signatureProvided !== signatureExpected) {
      return null;
    }
    
    // Décoder le payload
    const body = JSON.parse(Buffer.from(bodyEncoded, 'base64url').toString());
    
    // Vérifier l'expiration
    if (body.exp && body.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expiré
    }
    
    return body;
  } catch (error) {
    console.error('Error verifying JWT:', error.message);
    return null;
  }
}

function parseExpiresIn(expiresIn) {
  if (typeof expiresIn === 'number') return expiresIn;
  
  const units = {
    'ms': 1,
    's': 1000,
    'm': 60 * 1000,
    'h': 60 * 60 * 1000,
    'd': 24 * 60 * 60 * 1000
  };
  
  const match = expiresIn.match(/^(\d+)([a-z]+)$/);
  if (!match) return 24 * 60 * 60 * 1000; // Default 24h
  
  const [, value, unit] = match;
  return parseInt(value) * (units[unit] || 1000);
}
