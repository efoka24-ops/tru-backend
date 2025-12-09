/**
 * Data Storage Layer
 * Handles data persistence across different environments
 * - Local: Uses file system (data.json)
 * - Vercel: Uses in-memory storage with JSON serialization
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, 'data.json');

// In-memory storage for Vercel (Serverless environment)
let inMemoryData = null;

// Initialize default data structure
function getDefaultData() {
  return {
    team: [],
    services: [],
    solutions: [],
    contacts: [],
    testimonials: [],
    news: [],
    jobs: [],
    applications: [],
    settings: {
      id: 1,
      siteTitle: 'TRU GROUP',
      slogan: 'Transforming Reality Universally',
      tagline: 'Innovation & Solutions',
      email: 'contact@trugroup.cm',
      phone: '+237 123 456 789',
      address: 'Douala, Cameroon',
      description: 'Cabinet de conseil et d\'ingénierie digitale',
      socialMedia: {
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: '',
        whatsapp: ''
      },
      businessHours: {
        monday: '09:00 - 18:00',
        tuesday: '09:00 - 18:00',
        wednesday: '09:00 - 18:00',
        thursday: '09:00 - 18:00',
        friday: '09:00 - 18:00',
        saturday: 'Fermé',
        sunday: 'Fermé'
      },
      primaryColor: '#10b981',
      secondaryColor: '#0d9488',
      accentColor: '#64748b',
      maintenanceMode: false,
      maintenanceMessage: ''
    }
  };
}

/**
 * Read data from storage
 * - On local: reads from data.json
 * - On Vercel: reads from memory (initializes on first read)
 */
export function readData() {
  try {
    // Check if running on Vercel (serverless environment)
    const isServerless = process.env.VERCEL === '1' || !fs.existsSync(path.dirname(dataPath));

    if (isServerless) {
      // Use in-memory storage for Vercel
      if (!inMemoryData) {
        console.log('📦 Initializing in-memory data store (Vercel Serverless)');
        inMemoryData = getDefaultData();
      }
      return JSON.parse(JSON.stringify(inMemoryData)); // Deep copy
    } else {
      // Use file system for local development
      if (!fs.existsSync(dataPath)) {
        console.log('📝 Creating new data.json file');
        const defaultData = getDefaultData();
        fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2));
        return defaultData;
      }
      const data = fs.readFileSync(dataPath, 'utf8');
      const parsed = JSON.parse(data);

      // Ensure all required sections exist
      const defaultData = getDefaultData();
      return { ...defaultData, ...parsed };
    }
  } catch (err) {
    console.error('❌ Error reading data:', err);
    return getDefaultData();
  }
}

/**
 * Write data to storage
 * - On local: writes to data.json
 * - On Vercel: writes to memory
 */
export function writeData(data) {
  try {
    const isServerless = process.env.VERCEL === '1' || !fs.existsSync(path.dirname(dataPath));

    if (isServerless) {
      // Store in memory for Vercel
      inMemoryData = JSON.parse(JSON.stringify(data)); // Deep copy
      console.log('✅ Data saved to memory (Vercel Serverless)');
      return true;
    } else {
      // Write to file for local development
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      console.log('✅ Data saved to data.json');
      return true;
    }
  } catch (err) {
    console.error('❌ Error writing data:', err);
    return false;
  }
}

/**
 * Clear all data (useful for testing)
 */
export function clearData() {
  inMemoryData = null;
  try {
    if (!process.env.VERCEL && fs.existsSync(dataPath)) {
      fs.unlinkSync(dataPath);
    }
  } catch (err) {
    console.error('Error clearing data:', err);
  }
}
