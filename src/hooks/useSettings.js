import { useEffect, useState } from 'react';

const SETTINGS_CACHE_KEY = 'tru_settings_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/settings`);
      
      if (!response.ok) {
        throw new Error('Erreur récupération paramètres');
      }
      
      const data = await response.json();
      setSettings(data);
      
      // Cache local
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(cacheData));
      setError(null);
    } catch (err) {
      console.error('Erreur useSettings:', err);
      setError(err.message);
      
      // Utiliser le cache en cas d'erreur
      const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
      if (cached) {
        try {
          const cacheData = JSON.parse(cached);
          setSettings(cacheData.data);
        } catch (e) {
          console.error('Erreur parsing cache:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Vérifier le cache d'abord
    const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
    if (cached) {
      try {
        const cacheData = JSON.parse(cached);
        const now = Date.now();
        
        // Si cache valide (moins de 5 min), l'utiliser
        if (now - cacheData.timestamp < CACHE_DURATION) {
          setSettings(cacheData.data);
          setLoading(false);
          // Mais recharger quand même en arrière-plan
          fetchSettings();
          return;
        }
      } catch (e) {
        console.error('Erreur cache:', e);
      }
    }
    
    // Sinon, charger depuis le serveur
    fetchSettings();
    
    // Recharger les paramètres toutes les 10 secondes
    const interval = setInterval(fetchSettings, 10000);
    return () => clearInterval(interval);
  }, []);

  // Écouter les changements de settings (broadcast depuis SettingsPage)
  useEffect(() => {
    const handleSettingsUpdate = (event) => {
      if (event.detail && event.detail.settings) {
        setSettings(event.detail.settings);
        const cacheData = {
          data: event.detail.settings,
          timestamp: Date.now()
        };
        localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(cacheData));
      }
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, []);

  return {
    settings: settings || {},
    loading,
    error,
    refetch: fetchSettings
  };
}
