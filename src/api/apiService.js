// Configuration API - Use VITE_API_URL from .env files
const baseURL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV 
    ? 'http://localhost:5000' 
    : window.location.origin);

// Normalize URL - remove trailing slash
const cleanURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
const API_BASE_URL = `${cleanURL}/api`;

// Log the API URL for debugging
console.log('🔗 API_BASE_URL:', API_BASE_URL);
console.log('📝 VITE_API_URL env var:', import.meta.env.VITE_API_URL);

// Configuration for team sync with backoffice
const BACKOFFICE_API_URL = 'http://localhost:3001/api';

// Service pour les appels API
export const apiService = {
  async getServices() {
    try {
      const url = `${API_BASE_URL}/services`;
      console.log('📡 Fetching:', url);
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`❌ Erreur ${response.status}:`, response.statusText);
        throw new Error(`Erreur réseau: ${response.status}`);
      }
      const data = await response.json();
      console.log('✅ Services loaded:', data);
      return data;
    } catch (error) {
      console.error('Erreur récupération services:', error);
      return [];
    }
  },

  async getContent() {
    try {
      const response = await fetch(`${API_BASE_URL}/content`);
      if (!response.ok) throw new Error('Erreur réseau');
      return await response.json();
    } catch (error) {
      console.error('Erreur récupération contenu:', error);
      return [];
    }
  },

  async getTeam() {
    try {
      const response = await fetch(`${API_BASE_URL}/team`);
      if (!response.ok) throw new Error('Erreur réseau');
      return await response.json();
    } catch (error) {
      console.error('Erreur récupération équipe:', error);
      return [];
    }
  },

  async getHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) throw new Error('Erreur réseau');
      return await response.json();
    } catch (error) {
      console.error('Erreur santé serveur:', error);
      return null;
    }
  },

  async getSolutions() {
    try {
      const response = await fetch(`${API_BASE_URL}/solutions`);
      if (!response.ok) throw new Error('Erreur réseau');
      return await response.json();
    } catch (error) {
      console.error('Erreur récupération solutions:', error);
      return [];
    }
  },

  async getNews() {
    try {
      const response = await fetch(`${API_BASE_URL}/news`);
      if (!response.ok) throw new Error('Erreur réseau');
      return await response.json();
    } catch (error) {
      console.error('Erreur récupération news:', error);
      return [];
    }
  },

  async getJobs() {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`);
      if (!response.ok) throw new Error('Erreur réseau');
      return await response.json();
    } catch (error) {
      console.error('Erreur récupération emplois:', error);
      return [];
    }
  },

  async getTestimonials() {
    try {
      const response = await fetch(`${API_BASE_URL}/testimonials`);
      if (!response.ok) throw new Error('Erreur réseau');
      return await response.json();
    } catch (error) {
      console.error('Erreur récupération témoignages:', error);
      return [];
    }
  },

  async sendContact(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Erreur envoi contact');
      return await response.json();
    } catch (error) {
      console.error('Erreur envoi contact:', error);
      throw error;
    }
  },

  async sendApplication(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Erreur envoi candidature');
      return await response.json();
    } catch (error) {
      console.error('Erreur envoi candidature:', error);
      throw error;
    }
  },

  // Helper to get full image URL
  getImageUrl(imagePath) {
    if (!imagePath) return null;
    // If it's already a full URL (starts with http or is base64 data URL)
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    // If it's a relative path, prepend the API base URL
    const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
    return `${baseUrl}${imagePath}`;
  }
};

