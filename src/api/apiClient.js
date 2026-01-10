/**
 * Frontend API Client - Communique avec le backend
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const apiClient = {
  // Projects
  async getProjects() {
    const response = await fetch(`${BACKEND_URL}/api/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  async getProject(id) {
    const response = await fetch(`${BACKEND_URL}/api/projects/${id}`);
    if (!response.ok) throw new Error('Failed to fetch project');
    return response.json();
  },

  // Settings
  async getSettings() {
    const response = await fetch(`${BACKEND_URL}/api/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  // Team
  async getTeam() {
    const response = await fetch(`${BACKEND_URL}/api/team`);
    if (!response.ok) throw new Error('Failed to fetch team');
    return response.json();
  },

  // Services
  async getServices() {
    const response = await fetch(`${BACKEND_URL}/api/services`);
    if (!response.ok) throw new Error('Failed to fetch services');
    return response.json();
  },

  // Solutions
  async getSolutions() {
    const response = await fetch(`${BACKEND_URL}/api/solutions`);
    if (!response.ok) throw new Error('Failed to fetch solutions');
    return response.json();
  },

  // News
  async getNews() {
    const response = await fetch(`${BACKEND_URL}/api/news`);
    if (!response.ok) throw new Error('Failed to fetch news');
    return response.json();
  },

  // Jobs
  async getJobs() {
    const response = await fetch(`${BACKEND_URL}/api/jobs`);
    if (!response.ok) throw new Error('Failed to fetch jobs');
    return response.json();
  },

  // Testimonials
  async getTestimonials() {
    const response = await fetch(`${BACKEND_URL}/api/testimonials`);
    if (!response.ok) throw new Error('Failed to fetch testimonials');
    return response.json();
  }
};
