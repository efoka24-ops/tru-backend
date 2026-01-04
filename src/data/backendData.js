import { siteSettings as defaultSettings, navItems, services, solutions, team, commitments } from './content';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://tru-backend-o1zc.onrender.com';

// Cache pour les données
let cachedData = {
  settings: null,
  team: null,
  services: null,
  solutions: null,
  timestamp: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getBackendData(type) {
  try {
    const now = Date.now();
    
    // Vérifier si le cache est valide
    if (cachedData[type] && (now - cachedData.timestamp) < CACHE_DURATION) {
      console.log(`✅ Using cached ${type} data`);
      return cachedData[type];
    }

    const response = await fetch(`${BACKEND_URL}/api/${type}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      cachedData[type] = data;
      cachedData.timestamp = now;
      console.log(`✅ Fetched ${type} from backend`);
      return data;
    }
  } catch (error) {
    console.warn(`⚠️ Failed to fetch ${type} from backend:`, error);
  }
  
  // Fallback aux données statiques
  console.log(`📦 Using default ${type} data`);
  return getDefaultData(type);
}

export function getDefaultData(type) {
  const defaults = {
    settings: defaultSettings,
    team,
    services,
    solutions
  };
  return defaults[type] || null;
}

// Récupérer toutes les données
export async function getAllBackendData() {
  const [settings, teamData, servicesData, solutionsData] = await Promise.all([
    getBackendData('settings'),
    getBackendData('team'),
    getBackendData('services'),
    getBackendData('solutions')
  ]);

  return {
    settings: settings || defaultSettings,
    team: teamData || team,
    services: servicesData || services,
    solutions: solutionsData || solutions,
    navItems,
    commitments
  };
}
