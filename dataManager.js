/**
 * Data Manager avec Protection Robuste
 * - Atomic writes (écriture atomique)
 * - Checksum validation
 * - Memory cache fallback
 * - Auto-recovery
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = process.env.DATA_DIR || process.cwd();
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const DATA_BACKUP_FILE = path.join(DATA_DIR, 'data.backup.json');
const DATA_CHECKSUM_FILE = path.join(DATA_DIR, 'data.checksum');

// Cache en mémoire (fallback)
let memoryCache = null;
let lastChecksum = null;

class DataManager {
  /**
   * Lire les données avec validation de checksum
   */
  static readData() {
    try {
      // Vérifier si le fichier existe
      if (!fs.existsSync(DATA_FILE)) {
        console.warn('⚠️  data.json n\'existe pas');
        return memoryCache || this.getEmptyData();
      }

      // Lire le fichier
      const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(fileContent);

      // Valider le checksum
      const checksum = this.calculateChecksum(data);
      if (fs.existsSync(DATA_CHECKSUM_FILE)) {
        const savedChecksum = fs.readFileSync(DATA_CHECKSUM_FILE, 'utf-8').trim();
        if (checksum !== savedChecksum) {
          console.warn('⚠️  Checksum mismatch! Données possiblement corrompues');
          // Essayer le backup
          return this.recoverFromBackup() || data;
        }
      }

      // Mettre en cache
      memoryCache = data;
      lastChecksum = checksum;
      return data;
    } catch (error) {
      console.error('❌ Erreur lecture data.json:', error.message);
      console.warn('📍 Utilisation du cache en mémoire ou backup');
      return memoryCache || this.recoverFromBackup() || this.getEmptyData();
    }
  }

  /**
   * Écrire les données avec protection atomique
   * (écrire en temp file d'abord, puis renommer)
   */
  static writeData(data) {
    try {
      // Valider que c'est du JSON valide
      const jsonString = JSON.stringify(data, null, 2);
      JSON.parse(jsonString); // Double check

      // Calculer le checksum AVANT écriture
      const checksum = this.calculateChecksum(data);

      // ATOMIQUE: Écrire dans un fichier temporaire d'abord
      const tempFile = `${DATA_FILE}.tmp`;
      fs.writeFileSync(tempFile, jsonString, 'utf-8');

      // Vérifier que le temp file est valide
      const tempContent = fs.readFileSync(tempFile, 'utf-8');
      JSON.parse(tempContent);

      // ÉTAPE 1: Créer un backup du fichier actuel
      if (fs.existsSync(DATA_FILE)) {
        fs.copyFileSync(DATA_FILE, DATA_BACKUP_FILE);
        console.log('💾 Backup créé');
      }

      // ÉTAPE 2: Renommer le temp file vers le fichier principal (ATOMIC)
      fs.renameSync(tempFile, DATA_FILE);
      console.log('✅ Données écrites de manière atomique');

      // ÉTAPE 3: Sauvegarder le checksum
      fs.writeFileSync(DATA_CHECKSUM_FILE, checksum, 'utf-8');

      // ÉTAPE 4: Mettre le cache en mémoire à jour
      memoryCache = data;
      lastChecksum = checksum;

      return true;
    } catch (error) {
      console.error('❌ ERREUR CRITIQUE écriture:', error.message);
      
      // Nettoyage en cas d'erreur
      try {
        if (fs.existsSync(`${DATA_FILE}.tmp`)) {
          fs.unlinkSync(`${DATA_FILE}.tmp`);
        }
      } catch (e) {}

      return false;
    }
  }

  /**
   * Calculer le checksum SHA256 des données
   */
  static calculateChecksum(data) {
    const jsonString = JSON.stringify(data, null, 2);
    return crypto.createHash('sha256').update(jsonString).digest('hex');
  }

  /**
   * Récupérer les données depuis le backup
   */
  static recoverFromBackup() {
    try {
      if (fs.existsSync(DATA_BACKUP_FILE)) {
        console.log('🔄 Récupération depuis backup...');
        const backupContent = fs.readFileSync(DATA_BACKUP_FILE, 'utf-8');
        const data = JSON.parse(backupContent);
        
        // Restaurer le fichier principal
        fs.copyFileSync(DATA_BACKUP_FILE, DATA_FILE);
        console.log('✅ Données restaurées depuis backup');
        
        return data;
      }
    } catch (error) {
      console.error('❌ Erreur récupération backup:', error.message);
    }
    return null;
  }

  /**
   * Structure vide par défaut
   */
  static getEmptyData() {
    return {
      users: [],
      services: [],
      contacts: [],
      team: [],
      solutions: [],
      settings: {},
      testimonials: [],
      jobs: [],
      news: [],
      applications: [],
      projects: []
    };
  }

  /**
   * Vérifier l'intégrité du système de données
   */
  static checkIntegrity() {
    console.log('\n📊 === VÉRIFICATION INTÉGRITÉ DONNÉES ===');
    console.log(`📂 DATA_DIR: ${DATA_DIR}`);
    console.log(`📄 DATA_FILE: ${DATA_FILE}`);
    console.log(`✓ Fichier existe: ${fs.existsSync(DATA_FILE)}`);
    console.log(`✓ Backup existe: ${fs.existsSync(DATA_BACKUP_FILE)}`);
    console.log(`✓ Checksum existe: ${fs.existsSync(DATA_CHECKSUM_FILE)}`);
    
    if (fs.existsSync(DATA_FILE)) {
      const stats = fs.statSync(DATA_FILE);
      console.log(`📊 Taille fichier: ${(stats.size / 1024).toFixed(2)}KB`);
      console.log(`📅 Dernière modif: ${stats.mtime.toLocaleString('fr-FR')}`);
    }
    
    const data = this.readData();
    console.log(`👥 Équipe: ${data.team?.length || 0} membres`);
    console.log(`🔧 Services: ${data.services?.length || 0}`);
    console.log(`✉️  Contacts: ${data.contacts?.length || 0}`);
    console.log('=' .repeat(40) + '\n');
  }
}

export default DataManager;
