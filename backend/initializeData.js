/**
 * Initialize data.json with fallback to GitHub
 * Si data.json n'existe pas dans le volume persistant Render,
 * on télécharge la dernière version depuis GitHub
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utiliser le volume persistant si disponible
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const DATA_EXAMPLE_FILE = path.join(__dirname, 'data.example.json');

// Assurer que le répertoire existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`📂 Répertoire créé: ${DATA_DIR}`);
}

/**
 * Télécharger data.json depuis GitHub
 */
async function downloadFromGithub() {
  try {
    console.log('⬇️  Téléchargement de data.json depuis GitHub...');
    
    const repo = 'efoka24-ops/tru-backend';
    const branch = 'main';
    const filePath = 'data.json';
    
    const url = `https://raw.githubusercontent.com/${repo}/${branch}/${filePath}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ Erreur GitHub: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log('✅ Données téléchargées depuis GitHub avec succès');
    return data;
    
  } catch (error) {
    console.error('❌ Erreur téléchargement GitHub:', error.message);
    return null;
  }
}

/**
 * Initialiser data.json
 */
export async function initializeData() {
  console.log(`\n📂 Chemin DATA_FILE: ${DATA_FILE}`);
  console.log(`📂 Volume persistant: ${DATA_DIR}`);
  
  // Si le fichier existe déjà dans le volume
  if (fs.existsSync(DATA_FILE)) {
    try {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(fileContent);
      console.log('✅ data.json trouvé dans le volume persistant');
      console.log(`   └─ ${data.team?.length || 0} membres d'équipe`);
      console.log(`   └─ ${data.services?.length || 0} services`);
      console.log(`   └─ ${data.solutions?.length || 0} solutions\n`);
      return data;
    } catch (error) {
      console.error('❌ Erreur lecture data.json:', error.message);
    }
  }
  
  // Fichier n'existe pas → essayer GitHub
  console.log('⚠️  data.json introuvable dans le volume...');
  const githubData = await downloadFromGithub();
  
  if (githubData) {
    // Sauvegarder dans le volume pour les prochains redémarrages
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(githubData, null, 2));
      console.log('💾 Données sauvegardées dans le volume persistant\n');
      return githubData;
    } catch (error) {
      console.error('❌ Erreur sauvegarde volume:', error.message);
    }
  }
  
  // Fallback: utiliser data.example.json
  console.log('⚠️  GitHub indisponible → fallback vers data.example.json');
  try {
    const exampleData = fs.readFileSync(DATA_EXAMPLE_FILE, 'utf-8');
    const data = JSON.parse(exampleData);
    
    // Sauvegarder pour les prochains redémarrages
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('✅ data.json créé à partir de data.example.json\n');
    return data;
    
  } catch (error) {
    console.error('❌ Erreur fallback data.example.json:', error.message);
    return {
      users: [],
      services: [],
      team: [],
      testimonials: [],
      solutions: [],
      settings: {},
      contacts: [],
      news: [],
      jobs: [],
      applications: []
    };
  }
}

export default initializeData;
