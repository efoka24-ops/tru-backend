import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utiliser le volume persistant si disponible
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'data.json');

console.log(`\n📦 INITIALIZATION CONFIG:`);
console.log(`   DATA_DIR: ${DATA_DIR}`);
console.log(`   DATA_FILE: ${DATA_FILE}`);

// Assurer que le répertoire existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`📂 Répertoire créé: ${DATA_DIR}`);
}

/**
 * ✅ NOUVELLE STRATÉGIE - JAMAIS DE RÉINITIALISATION
 * 
 * 1. Si data.json existe → L'utiliser directement
 * 2. Si data.json n'existe pas → Créer un fichier VIDE
 * 3. JAMAIS recharger data.example.json
 * 4. L'utilisateur crée les données depuis le backoffice
 */
export async function initializeData() {
  console.log('\n🚀 Initialisation des données...\n');

  const EMPTY_DATA = {
    users: [],
    settings: {
      siteTitle: 'TRU GROUP',
      company_name: 'TRU GROUP',
      slogan: 'Au cœur de l\'innovation',
      email: 'infos@trugroup.cm',
      phone: '+237678758976',
      address: 'Garoua, Cameroun',
      description: 'Cabinet de conseil et d\'ingénierie digitale',
      primary_color: '#22c55e',
      secondary_color: '#16a34a'
    },
    services: [],
    solutions: [],
    team: [],
    testimonials: [],
    contacts: [],
    news: [],
    jobs: [],
    applications: [],
    projects: []
  };

  // ÉTAPE 1: Si data.json existe, l'utiliser directement
  if (fs.existsSync(DATA_FILE)) {
    try {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(fileContent);
      
      console.log('✅ data.json CHARGÉ avec succès');
      console.log(`   └─ ${data.team?.length || 0} membres`);
      console.log(`   └─ ${data.services?.length || 0} services`);
      console.log(`   └─ ${data.solutions?.length || 0} solutions`);
      console.log(`   └─ ${data.testimonials?.length || 0} témoignages\n`);
      
      return data;
    } catch (error) {
      console.error('❌ ERREUR: data.json est corrompu:', error.message);
      console.log('⚠️  Création d\'un fichier vide à la place...\n');
      
      fs.writeFileSync(DATA_FILE, JSON.stringify(EMPTY_DATA, null, 2));
      return EMPTY_DATA;
    }
  }

  // ÉTAPE 2: Si data.json n'existe pas → Créer un fichier VIDE
  console.log('📝 data.json N\'EXISTE PAS');
  console.log('✅ Création d\'un fichier VIDE');
  console.log('   Les données seront créées depuis le backoffice\n');

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(EMPTY_DATA, null, 2));
    console.log('✅ Fichier vide créé avec succès\n');
  } catch (error) {
    console.error('❌ Impossible de créer data.json:', error.message);
  }

  return EMPTY_DATA;
}

export default initializeData;
