// backend/utils/codeGenerator.js
// Générer des codes de connexion sécurisés

import crypto from 'crypto';

/**
 * Générer un code de connexion de 12 caractères alphanumériques
 * @returns {string} Ex: "ABC123DEF456"
 */
export function generateLoginCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 12; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    code += chars[randomIndex];
  }
  
  return code;
}

/**
 * Générer un code de réinitialisation
 * @returns {string}
 */
export function generateResetCode() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Générer une date d'expiration (24h par défaut)
 * @param {number} hoursFromNow 
 * @returns {Date}
 */
export function getExpiryDate(hoursFromNow = 24) {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hoursFromNow);
  return expiry;
}

/**
 * Vérifier si une date d'expiration est passée
 * @param {Date} expiryDate 
 * @returns {boolean}
 */
export function isCodeExpired(expiryDate) {
  return new Date() > new Date(expiryDate);
}
