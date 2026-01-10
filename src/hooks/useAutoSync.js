/**
 * Hook pour la synchronisation automatique des données
 */

import { useEffect, useState } from 'react';
import { frontendSyncService } from '../services/frontendSyncService';

export function useAutoSync(fetchFn, dependencies = [], interval = 10000) {
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    // Démarrer la sync
    frontendSyncService.startAutoSync(async () => {
      const data = await fetchFn();
      setLastSync(new Date());
      return data;
    }, interval);

    // Cleanup
    return () => {
      frontendSyncService.stopAutoSync();
    };
  }, dependencies);

  return {
    lastSync,
    forceSync: () => frontendSyncService.forceSync(fetchFn)
  };
}
