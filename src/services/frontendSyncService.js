/**
 * Service de synchronisation frontend
 * Met à jour les données du frontend quand elles changent au backoffice
 */

import { logger } from '../services/logger';

class FrontendSyncService {
  constructor() {
    this.syncInterval = null;
    this.lastSyncTime = null;
    this.syncCallbacks = [];
  }

  /**
   * Enregistrer une callback pour les mises à jour
   */
  onSync(callback) {
    this.syncCallbacks.push(callback);
    return () => {
      this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Notifier tous les listeners d'une mise à jour
   */
  notifySync(data) {
    this.syncCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        logger.error('Error in sync callback:', error);
      }
    });
  }

  /**
   * Démarrer la synchronisation automatique
   */
  startAutoSync(fetchFn, interval = 10000) {
    // Éviter les syncs en double
    if (this.syncInterval) {
      return;
    }

    logger.log('[FrontendSync] Starting auto-sync every', interval, 'ms');

    // Sync initial
    this.performSync(fetchFn);

    // Sync périodique
    this.syncInterval = setInterval(() => {
      this.performSync(fetchFn);
    }, interval);
  }

  /**
   * Arrêter la synchronisation automatique
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      logger.log('[FrontendSync] Stopped auto-sync');
    }
  }

  /**
   * Effectuer une synchronisation
   */
  async performSync(fetchFn) {
    try {
      const data = await fetchFn();
      
      if (data) {
        this.lastSyncTime = new Date();
        this.notifySync(data);
        logger.log('[FrontendSync] Sync completed at', this.lastSyncTime.toLocaleTimeString());
      }
    } catch (error) {
      logger.warn('[FrontendSync] Sync error:', error.message);
    }
  }

  /**
   * Forcer une synchronisation immédiate
   */
  async forceSync(fetchFn) {
    logger.log('[FrontendSync] Forcing immediate sync');
    await this.performSync(fetchFn);
  }
}

export const frontendSyncService = new FrontendSyncService();
