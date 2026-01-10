/**
 * GitHub Sync Service - Synchronise TOUS les changements CRUD avec GitHub
 * Équipe, Services, Solutions, Témoignages, Contacts, Actualités, Offres d'emploi, Candidatures, Projets
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);
const writeFileAsync = promisify(fs.writeFile);

class GitHubSyncService {
  constructor() {
    this.repoPath = process.env.REPO_PATH || process.cwd();
    this.dataDir = path.join(this.repoPath, 'data');
    this.commitEnabled = process.env.ENABLE_GIT_SYNC === 'true';
  }

  /**
   * Synchroniser un changement avec GitHub
   * @param {string} entity - Type d'entité (team, services, solutions, etc.)
   * @param {string} action - Action (create, update, delete)
   * @param {object} data - Données modifiées
   */
  async syncToGitHub(entity, action, data) {
    if (!this.commitEnabled) {
      console.log('[GitSync] Git sync disabled (ENABLE_GIT_SYNC=false)');
      return;
    }

    try {
      console.log(`[GitSync] Syncing ${entity} ${action}:`, data);

      // 1. Sauvegarder les données localement
      await this.saveData(entity, data);

      // 2. Faire un commit git
      const message = `[AUTO] ${action.toUpperCase()} ${entity}: ${data.name || data.title || data.id}`;
      await this.commitChanges(message);

      // 3. Push vers GitHub
      await this.pushToGitHub();

      console.log(`[GitSync] ✓ Successfully synced ${entity} to GitHub`);
      return { status: 'success', message: `${entity} synchronized with GitHub` };

    } catch (error) {
      console.error(`[GitSync] Error syncing ${entity}:`, error);
      throw error;
    }
  }

  /**
   * Sauvegarder les données dans un fichier JSON
   */
  async saveData(entity, data) {
    const filePath = path.join(this.dataDir, `${entity}.json`);
    
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Lire les données existantes
    let allData = [];
    if (fs.existsSync(filePath)) {
      try {
        allData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (e) {
        allData = [];
      }
    }

    // Si data est un tableau, le remplacer complètement
    if (Array.isArray(data)) {
      allData = data;
    } else {
      // Sinon, fusionner avec les données existantes
      const index = allData.findIndex(item => item.id === data.id);
      if (index !== -1) {
        allData[index] = data;
      } else {
        allData.push(data);
      }
    }

    // Sauvegarder
    await writeFileAsync(filePath, JSON.stringify(allData, null, 2));
    console.log(`[GitSync] Saved ${entity} to ${filePath}`);
  }

  /**
   * Faire un commit git
   */
  async commitChanges(message) {
    try {
      // Ajouter tous les changements
      await execAsync('git add .', { cwd: this.repoPath });
      
      // Vérifier s'il y a des changements à committer
      const { stdout } = await execAsync('git status --short', { cwd: this.repoPath });
      
      if (!stdout.trim()) {
        console.log('[GitSync] No changes to commit');
        return;
      }

      // Committer
      await execAsync(`git commit -m "${message}"`, { cwd: this.repoPath });
      console.log(`[GitSync] Committed: ${message}`);

    } catch (error) {
      if (error.message.includes('nothing to commit')) {
        console.log('[GitSync] No changes to commit');
      } else {
        throw error;
      }
    }
  }

  /**
   * Pousser vers GitHub
   */
  async pushToGitHub() {
    try {
      const branch = process.env.GIT_BRANCH || 'main';
      await execAsync(`git push origin ${branch}`, { cwd: this.repoPath });
      console.log(`[GitSync] Pushed to GitHub (${branch})`);
    } catch (error) {
      console.error('[GitSync] Error pushing to GitHub:', error.message);
      // Ne pas bloquer si le push échoue
    }
  }

  /**
   * Synchroniser plusieurs entités
   */
  async syncMultiple(syncs) {
    const results = [];
    for (const { entity, action, data } of syncs) {
      try {
        const result = await this.syncToGitHub(entity, action, data);
        results.push(result);
      } catch (error) {
        results.push({ status: 'error', entity, error: error.message });
      }
    }
    return results;
  }
}

export const githubSyncService = new GitHubSyncService();
