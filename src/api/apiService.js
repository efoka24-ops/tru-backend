// Configuration API - Use VITE_API_URL from .env files
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : (import.meta.env.DEV 
    ? 'http://localhost:5000/api' 
    : '/api');

// Configuration for team sync with backoffice
const BACKOFFICE_API_URL = 'http://localhost:3001/api';

// Service pour les appels API
export const apiService = {
  async getServices() {
    try {
      const response = await fetch(`${API_BASE_URL}/services`);
      if (!response.ok) throw new Error('Erreur réseau');
      return await response.json();
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
  }
};
