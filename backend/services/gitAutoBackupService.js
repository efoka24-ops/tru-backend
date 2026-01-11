/**
 * Git Auto-Backup Service
 * Automatically commits and pushes data.json changes to GitHub
 * 
 * This ensures data persists even if Render restarts
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const execPromise = promisify(exec);

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔵 Use persistent volume if available, otherwise use local
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..');
const DATA_FILE = 'data.json';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'efoka24-ops/tru-backend';
const GITHUB_BRANCH = 'main';

class GitAutoBackupService {
  constructor() {
    this.isCommitting = false;
    this.commitQueue = [];
    this.lastCommitTime = 0;
    this.minIntervalBetweenCommits = 10000; // 10 secondes minimum entre commits
  }

  /**
   * Auto-commit data.json to GitHub
   */
  async autoCommit(action, details = '') {
    try {
      // Si pas de token, skip (mode offline)
      if (!GITHUB_TOKEN) {
        console.log('⚠️  GITHUB_TOKEN not set - auto-backup disabled');
        return false;
      }

      // Rate limiting: max 1 commit par 10s
      const now = Date.now();
      if (now - this.lastCommitTime < this.minIntervalBetweenCommits) {
        console.log('⏱️ Commit queued (rate limited)');
        this.commitQueue.push({ action, details, time: now });
        return true;
      }

      if (this.isCommitting) {
        this.commitQueue.push({ action, details, time: now });
        return true;
      }

      this.isCommitting = true;

      // Configure git
      await this.execGit('config user.email "backend-auto@trugroup.cm"');
      await this.execGit('config user.name "TRU Backend Auto-Backup"');

      // Check if file is changed
      const { stdout: status } = await this.execGit('status --porcelain data.json');
      
      if (!status.trim()) {
        console.log('✅ No changes to commit');
        this.isCommitting = false;
        return true;
      }

      // Add file
      await this.execGit('add data.json');

      // Create commit message
      const timestamp = new Date().toISOString();
      const commitMessage = `data: auto-backup - ${action}${details ? ' (' + details + ')' : ''}

Timestamp: ${timestamp}
Environment: ${process.env.NODE_ENV || 'production'}

[automated commit]`;

      console.log(`📝 Committing: ${action}`);
      
      // Commit
      await this.execGit(`commit -m "${commitMessage.replace(/"/g, '\\"')}"`, true);

      // Push with auth
      const remoteUrl = `https://${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git`;
      await this.execGit(`push ${remoteUrl} ${GITHUB_BRANCH} 2>&1`, true);

      console.log(`✅ Auto-backed up to GitHub: ${action}`);
      this.lastCommitTime = now;

      // Process queue if any
      if (this.commitQueue.length > 0) {
        const next = this.commitQueue.shift();
        setTimeout(() => {
          this.autoCommit(next.action, next.details);
        }, 2000);
      }

      this.isCommitting = false;
      return true;

    } catch (error) {
      console.error('❌ Auto-backup error:', error.message);
      this.isCommitting = false;
      
      // Still return true - don't block the operation
      return true;
    }
  }

  /**
   * Execute git command safely
   */
  async execGit(command, hideOutput = false) {
    try {
      const fullCommand = `cd "${DATA_DIR}" && git ${command}`;
      
      if (!hideOutput) {
        console.log(`🔧 Git: ${command}`);
      }

      const { stdout, stderr } = await execPromise(fullCommand, {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 30000 // 30 seconds timeout
      });

      if (stderr && !hideOutput) {
        console.warn('⚠️ Git stderr:', stderr);
      }

      return { stdout, stderr };
    } catch (error) {
      console.error(`❌ Git command failed: ${command}`);
      console.error(error.message);
      throw error;
    }
  }

  /**
   * Initialize repo on startup (fetch latest from GitHub)
   */
  async initializeFromGitHub() {
    try {
      console.log('🔄 Initializing from GitHub...');

      // Check if .git exists
      const { stdout } = await this.execGit('rev-parse --git-dir');
      
      if (stdout.trim()) {
        console.log('✅ Git repository already initialized');
        
        // Fetch latest changes
        console.log('📥 Pulling latest changes from GitHub...');
        await this.execGit('fetch origin main');
        await this.execGit('reset --hard origin/main');
        console.log('✅ Latest data pulled from GitHub');
      }

      return true;
    } catch (error) {
      console.warn('⚠️ Could not initialize from GitHub:', error.message);
      return false;
    }
  }

  /**
   * Get backup status
   */
  async getBackupStatus() {
    try {
      const { stdout: lastCommit } = await this.execGit('log -1 --pretty=format:"%h - %s - %ai"');
      const { stdout: status } = await this.execGit('status -s');
      
      return {
        lastBackup: lastCommit.trim(),
        pendingChanges: status.trim() ? status.split('\n').length : 0,
        isCommitting: this.isCommitting,
        queueSize: this.commitQueue.length
      };
    } catch (error) {
      return {
        error: error.message,
        lastBackup: 'Unknown',
        pendingChanges: 0
      };
    }
  }

  /**
   * Start periodic backup (toutes les 5 minutes)
   */
  startPeriodicBackup() {
    if (process.env.GITHUB_TOKEN) {
      console.log('🔄 Démarrage sauvegarde périodique (5 min)...');
      
      // Premier backup après 1 minute
      setTimeout(() => {
        this.autoCommit('PERIODIC_BACKUP', 'Synchronisation planifiée');
      }, 60000);
      
      // Ensuite tous les 5 minutes
      setInterval(() => {
        this.autoCommit('PERIODIC_BACKUP', 'Synchronisation planifiée');
      }, 5 * 60 * 1000);
    } else {
      console.warn('⚠️  GITHUB_TOKEN not set - periodic backup disabled');
    }
  }
}

// Export singleton
export default new GitAutoBackupService();
