/**
 * Restore Database from Backup
 * 
 * This script allows you to restore data.json from a backup file.
 * 
 * Usage: node restore-backup.cjs <backup-filename>
 * Example: node restore-backup.cjs data.backup-2025-01-04T10-30-45.json
 */

const fs = require('fs');
const path = require('path');

const backupFilename = process.argv[2];

if (!backupFilename) {
  console.log('❌ Veuillez spécifier un fichier de backup');
  console.log('\nUsage: node restore-backup.cjs <backup-filename>');
  console.log('Example: node restore-backup.cjs data.backup-2025-01-04T10-30-45.json');
  
  // List available backups
  const backupDir = path.join(__dirname, 'backups');
  if (fs.existsSync(backupDir)) {
    const files = fs.readdirSync(backupDir);
    if (files.length > 0) {
      console.log('\n📋 Backups disponibles:');
      files.forEach(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        console.log(`  - ${file} (${new Date(stats.mtime).toLocaleString()})`);
      });
    }
  }
  process.exit(1);
}

const backupPath = path.join(__dirname, 'backups', backupFilename);
const dataPath = path.join(__dirname, 'data.json');

if (!fs.existsSync(backupPath)) {
  console.error(`❌ Backup introuvable: ${backupPath}`);
  process.exit(1);
}

try {
  const backupData = fs.readFileSync(backupPath, 'utf8');
  
  // Create a backup of current data.json before restoring
  if (fs.existsSync(dataPath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const preRestoreBackup = path.join(__dirname, 'backups', `data.backup-pre-restore-${timestamp}.json`);
    const currentData = fs.readFileSync(dataPath, 'utf8');
    fs.writeFileSync(preRestoreBackup, currentData);
    console.log(`✅ Backup pre-restauration créé: data.backup-pre-restore-${timestamp}.json`);
  }
  
  // Restore the backup
  fs.writeFileSync(dataPath, backupData);
  console.log(`✅ Base de données restaurée depuis: ${backupFilename}`);
  console.log(`📍 Fichier: ${dataPath}`);
  
} catch (err) {
  console.error('❌ Erreur lors de la restauration:', err.message);
  process.exit(1);
}
