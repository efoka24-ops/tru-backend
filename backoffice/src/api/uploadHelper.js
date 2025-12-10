/**
 * Upload Helper - Centralized upload functionality
 */

const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const BACKEND_URL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

export async function uploadImage(file) {
  try {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${BACKEND_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erreur upload: ${response.status}`);
    }

    const data = await response.json();
    return data.url; // Returns base64 data URL or path
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

export async function uploadResume(file) {
  try {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(`${BACKEND_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erreur upload: ${response.status}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Resume upload error:', error);
    throw error;
  }
}
