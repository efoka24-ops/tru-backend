import { useEffect, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://tru-backend-o1zc.onrender.com';

export const useBackendData = () => {
  const [data, setData] = useState({
    settings: null,
    team: null,
    services: null,
    solutions: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les données du backend en parallèle
        const [settingsRes, teamRes, servicesRes, solutionsRes] = await Promise.allSettled([
          fetch(`${BACKEND_URL}/api/settings`).then(r => r.json()),
          fetch(`${BACKEND_URL}/api/team`).then(r => r.json()),
          fetch(`${BACKEND_URL}/api/services`).then(r => r.json()),
          fetch(`${BACKEND_URL}/api/solutions`).then(r => r.json())
        ]);

        const newData = {
          settings: settingsRes.status === 'fulfilled' ? settingsRes.value : null,
          team: teamRes.status === 'fulfilled' ? teamRes.value : null,
          services: servicesRes.status === 'fulfilled' ? servicesRes.value : null,
          solutions: solutionsRes.status === 'fulfilled' ? solutionsRes.value : null
        };

        setData(newData);
        setError(null);
      } catch (err) {
        console.error('Erreur récupération données backend:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
