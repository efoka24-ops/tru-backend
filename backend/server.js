import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword, comparePassword, generateJWT, verifyJWT } from './utils/passwordUtils.js';
import { generateLoginCode, getExpiryDate, isCodeExpired } from './utils/codeGenerator.js';
import { verifyToken, requireAdmin, requireMember, requireOwnProfile } from './middleware/auth.js';
// import gitBackupService from './services/gitAutoBackupService.js'; // DÉSACTIVÉ - Supabase uniquement
// import initializeData from './initializeData.js'; // DÉSACTIVÉ - Supabase uniquement
// import DataManager from './dataManager.js'; // DÉSACTIVÉ - Supabase uniquement
// import * as db from './databaseService.js'; // DÉSACTIVÉ - On utilise Supabase
import authRoutes from './routes/auth.js';
import * as supabase from './lib/supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔵 Utiliser le volume persistant Render si disponible, sinon local
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const DATA_EXAMPLE_FILE = path.join(__dirname, 'data.example.json');

// Assurer que le répertoire des données existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize from Supabase (plus de data.json)
console.log('🔄 Connexion à Supabase...');

// Test de connexion Supabase
(async () => {
  try {
    const health = await supabase.healthCheck();
    console.log('✅ Supabase connecté:', health.message);
    
    // Charger un échantillon de données pour vérifier
    const teamCount = await supabase.team.getAll();
    const servicesCount = await supabase.services.getAll();
    console.log(`📊 Données Supabase: ${teamCount?.length || 0} membres, ${servicesCount?.length || 0} services`);
  } catch (error) {
    console.error('❌ Erreur connexion Supabase:', error.message);
  }
})();

// Helper functions pour Supabase (remplace readData/writeData)
// Toutes les opérations passent maintenant par Supabase directement
// Plus besoin de readData() et writeData() car les routes utilisent supabase.*

// Helper function to write data AND backup to GitHub (DÉSACTIVÉ - Supabase uniquement)
async function writeDataAndBackup(data, action, details = '') {
  // Write locally first
  const writeOk = writeData(data);
  
  /* DÉSACTIVÉ - Plus de backup GitHub
  if (writeOk && process.env.GITHUB_TOKEN) {
    gitBackupService.autoCommit(action, details).catch(err => {
      console.error('Backup error (non-blocking):', err.message);
    });
  }
  */
  
  return writeOk;
}

/* ============================================
   DÉSACTIVÉ - Sync PostgreSQL (On utilise Supabase)
   ============================================

async function syncDataToPG(data) {
  try {
    // Sync Team
    if (data.team && Array.isArray(data.team)) {
      for (const member of data.team) {
        try {
          await db.addOrUpdateTeamMember(member);
        } catch (e) {
          console.warn(`⚠️  Failed to sync team member ${member.name}:`, e.message);
        }
      }
    }
    
    // Sync Services
    if (data.services && Array.isArray(data.services)) {
      for (const service of data.services) {
        try {
          await db.addOrUpdateService(service);
        } catch (e) {
          console.warn(`⚠️  Failed to sync service ${service.id}:`, e.message);
        }
      }
    }
    
    // Sync Solutions
    if (data.solutions && Array.isArray(data.solutions)) {
      for (const solution of data.solutions) {
        try {
          await db.addOrUpdateSolution(solution);
        } catch (e) {
          console.warn(`⚠️  Failed to sync solution ${solution.id}:`, e.message);
        }
      }
    }
    
    // Sync Testimonials
    if (data.testimonials && Array.isArray(data.testimonials)) {
      for (const testimonial of data.testimonials) {
        try {
          await db.addOrUpdateTestimonial(testimonial);
        } catch (e) {
          console.warn(`⚠️  Failed to sync testimonial ${testimonial.id}:`, e.message);
        }
      }
    }
    
    console.log('✅ Data synced to PostgreSQL');
  } catch (err) {
    console.warn('⚠️  PostgreSQL sync error:', err.message);
  }
}

// Migrate all data from data.json to PostgreSQL (auto-run on startup)
async function migrateDataToPG(data) {
  try {
    console.log('🔄 Starting automatic migration to PostgreSQL...');
    await syncDataToPG(data);
    console.log('✅ Migration completed!');
  } catch (err) {
    console.error('❌ Migration error:', err);
  }
}
*/

// Helper functions for reading/writing data.json (for jobs and other legacy features)
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      // Create default data.json if it doesn't exist
      const defaultData = {
        users: [],
        services: [],
        team: [],
        solutions: [],
        testimonials: [],
        jobs: [],
        applications: [],
        contacts: [],
        settings: {}
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading data.json:', error.message);
    return { users: [], services: [], team: [], solutions: [], testimonials: [], jobs: [], applications: [], contacts: [], settings: {} };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data.json:', error.message);
    return false;
  }
}

console.log('📧 Backend server starting on port', PORT);

// Configuration multer - Use memory storage for Vercel compatibility
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non autorisé'));
    }
  }
});

// Middleware
// CORS Configuration - support local development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'https://tru-backoffice.vercel.app',
  'https://tru-backend-o1zc.onrender.com',
  'https://tru-website.vercel.app',
  'https://bo.trugroup.cm',
  'https://fo.trugroup.cm'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now, can be restricted later
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));

app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============= HEALTH ROUTES =============

app.get('/', (req, res) => {
  res.json({ 
    status: 'Backend is running',
    message: 'TRU Backend API',
    version: '1.0',
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      team: '/api/team',
      admin_members: '/api/admin/members'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Backend is responding correctly',
    timestamp: new Date().toISOString(),
    database: 'JSON (data.json)',
    autoBackup: process.env.GITHUB_TOKEN ? 'enabled' : 'disabled'
  });
});

// GET /api/admin/backup-status - Check auto-backup status
app.get('/api/admin/backup-status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const status = await gitBackupService.getBackupStatus();
    res.json({
      status: 'success',
      backup: status,
      message: 'Auto-backup is monitoring data.json changes'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// ============= UPLOAD ROUTE =============

app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }
    
    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
    
    res.json({ 
      success: true,
      url: dataUrl,
      filename: req.file.originalname
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ error: error.message || 'Erreur upload' });
  }
});

// Handle base64 image uploads (for compatibility with forms sending base64)
app.post('/api/image', express.json({ limit: '10mb' }), (req, res) => {
  try {
    const { image, name } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'Image requise' });
    }
    
    // If it's already a data URL, return it as-is (limit base64 to 1MB)
    if (image.startsWith('data:')) {
      const size = image.length;
      if (size > 1024 * 1024) { // 1MB limit
        return res.status(400).json({ error: 'Image trop volumineuse (max 1MB)' });
      }
      return res.json({ 
        success: true,
        url: image,
        size: size
      });
    }
    
    res.status(400).json({ error: 'Format image invalide' });
  } catch (error) {
    console.error('Erreur image:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= AUTHENTICATION ROUTES =============

// 🟢 SUPABASE AUTH ROUTES (nouvelles routes avec Supabase)
app.use('/api/auth', authRoutes);

// 🔴 ANCIENNES ROUTES (avec data.memberAccounts) - À SUPPRIMER APRÈS MIGRATION
/*
// 1. LOGIN avec email + password
app.post('/api/auth/login-old', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password required',
        code: 'INVALID_INPUT'
      });
    }
    
    const data = readData();
    const account = data.memberAccounts?.find(a => a.email === email);
    
    if (!account) {
      return res.status(401).json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    if (account.status !== 'active') {
      return res.status(403).json({ 
        error: 'Account is inactive',
        code: 'ACCOUNT_INACTIVE'
      });
    }
    
    // Comparer le password
    const validPassword = comparePassword(password, account.passwordHash);
    
    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Générer JWT
    const token = generateJWT({
      memberId: account.memberId,
      email: account.email,
      role: account.role
    });
    
    // Mettre à jour lastLogin
    account.lastLogin = new Date().toISOString();
    writeDataAndBackup(data, 'LOGIN_UPDATE', `User login: ${account.email}`);
    
    // Récupérer les infos du membre
    const member = data.team?.find(t => t.id === account.memberId);
    
    res.json({
      success: true,
      token: token,
      member: member ? {
        id: member.id,
        name: member.name,
        title: member.title,
        email: member.email,
        image: member.image
      } : null,
      account: {
        email: account.email,
        role: account.role,
        createdAt: account.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 2. LOGIN avec code temporaire (première connexion)
app.post('/api/auth/login-code', (req, res) => {
  try {
    const { loginCode, newPassword, confirmPassword } = req.body;
    
    if (!loginCode || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        error: 'Login code and passwords required',
        code: 'INVALID_INPUT'
      });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        error: 'Passwords do not match',
        code: 'PASSWORD_MISMATCH'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters',
        code: 'PASSWORD_TOO_SHORT'
      });
    }
    
    const data = readData();
    const account = data.memberAccounts?.find(a => a.loginCode === loginCode);
    
    if (!account) {
      return res.status(401).json({ 
        error: 'Invalid login code',
        code: 'INVALID_CODE'
      });
    }
    
    // Vérifier expiration
    if (isCodeExpired(account.loginCodeExpiry)) {
      return res.status(401).json({ 
        error: 'Login code has expired',
        code: 'CODE_EXPIRED'
      });
    }
    
    // Mettre à jour le mot de passe
    account.passwordHash = hashPassword(newPassword);
    account.loginCode = null;
    account.loginCodeExpiry = null;
    account.status = 'active';
    account.lastLogin = new Date().toISOString();
    writeDataAndBackup(data, 'FIRST_LOGIN_PASSWORD', `First login & password set: ${account.email}`);
    
    // Générer JWT
    const token = generateJWT({
      memberId: account.memberId,
      email: account.email,
      role: account.role
    });
    
    // Récupérer les infos du membre
    const member = data.team?.find(t => t.id === account.memberId);
    
    res.json({
      success: true,
      message: 'First login successful, password created',
      token: token,
      member: member ? {
        id: member.id,
        name: member.name,
        title: member.title,
        email: member.email,
        image: member.image
      } : null
    });
  } catch (error) {
    console.error('Login code error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 3. VERIFY TOKEN - Vérifier que le JWT est valide
app.post('/api/auth/verify-token', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// 4. CHANGE PASSWORD - Changer le mot de passe
app.post('/api/auth/change-password', verifyToken, (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const memberId = req.user.memberId;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields required' });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const data = readData();
    const account = data.memberAccounts?.find(a => a.memberId === memberId);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Vérifier le mot de passe actuel
    if (!comparePassword(currentPassword, account.passwordHash)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Mettre à jour le mot de passe
    account.passwordHash = hashPassword(newPassword);
    account.updatedAt = new Date().toISOString();
    writeDataAndBackup(data, 'CHANGE_PASSWORD', `Password changed: ${account.email}`);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});
*/

// ============= MEMBER PROFILE ROUTES =============

// GET /api/members/:id - Récupérer profil public d'un membre
app.get('/api/members/:id', (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    const data = readData();
    const member = data.team?.find(t => t.id === memberId);
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json({
      success: true,
      member: member
    });
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// GET /api/members/:id/profile - Récupérer profil complet (authentifié)
app.get('/api/members/:id/profile', verifyToken, requireOwnProfile, (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    const data = readData();
    const member = data.team?.find(t => t.id === memberId);
    const account = data.memberAccounts?.find(a => a.memberId === memberId);
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json({
      success: true,
      member: {
        ...member,
        profile: account ? {
          hasAccount: true,
          email: account.email,
          role: account.role,
          createdAt: account.createdAt,
          lastLogin: account.lastLogin
        } : null
      }
    });
  } catch (error) {
    console.error('Get member profile error:', error);
    res.status(500).json({ error: 'Failed to fetch member profile' });
  }
});

// PUT /api/members/:id/profile - Modifier son profil
app.put('/api/members/:id/profile', verifyToken, requireOwnProfile, (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    const { name, title, bio, phone, linkedin, specialties, certifications } = req.body;
    
    const data = readData();
    const member = data.team?.find(t => t.id === memberId);
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    // Mettre à jour les champs autorisés
    if (name !== undefined) member.name = name;
    if (title !== undefined) member.title = title;
    if (bio !== undefined) member.bio = bio;
    if (phone !== undefined) member.phone = phone;
    if (linkedin !== undefined) member.linked_in = linkedin;
    if (specialties !== undefined) member.specialties = specialties;
    if (certifications !== undefined) member.certifications = certifications;
    
    writeDataAndBackup(data, 'UPDATE_PROFILE', `Profile updated: ${member.name}`);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      member: member
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /api/members/:id/photo - Télécharger/Modifier la photo du profil
app.put('/api/members/:id/photo', verifyToken, requireOwnProfile, upload.single('photo'), (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    
    if (!req.file && !req.body.photoUrl) {
      return res.status(400).json({ error: 'Photo required' });
    }
    
    const data = readData();
    const member = data.team?.find(t => t.id === memberId);
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      member.image = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.photoUrl) {
      member.image = req.body.photoUrl;
    }
    
    writeDataAndBackup(data, 'UPDATE_PHOTO', `Photo updated: ${member.name}`);
    
    res.json({
      success: true,
      message: 'Photo updated successfully',
      member: {
        id: member.id,
        image: member.image
      }
    });
  } catch (error) {
    console.error('Update photo error:', error);
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

// ============= ADMIN - MEMBER ACCOUNTS ROUTES =============

// GET /api/test/team - Endpoint de test pour vérifier les données de l'équipe
app.get('/api/test/team', (req, res) => {
  try {
    const data = readData();
    const team = data.team || [];
    console.log('[TEST/TEAM] Data loaded:', {
      hasTeam: !!data.team,
      teamLength: team.length,
      teamNames: team.map(m => ({ id: m.id, name: m.name, email: m.email }))
    });
    
    res.json({
      success: true,
      team: team,
      total: team.length,
      debug: {
        hasTeam: !!data.team,
        teamLength: team.length,
        hasMemberAccounts: !!data.memberAccounts,
        memberAccountsCount: (data.memberAccounts || []).length
      }
    });
  } catch (error) {
    console.error('[TEST/TEAM] Error:', error);
    res.status(500).json({ error: 'Failed to fetch team', details: error.message });
  }
});

// GET /api/admin/members - Lister tous les membres de l'équipe avec statut de compte
app.get('/api/admin/members', verifyToken, requireAdmin, (req, res) => {
  try {
    const data = readData();
    
    // Récupérer la liste de la team (équipe)
    const team = data.team || [];
    console.log(`[ADMIN/MEMBERS] Total team members: ${team.length}`);
    
    // Vérifier si team est vide ou si ce n'est pas un array
    if (!Array.isArray(team)) {
      console.error('[ADMIN/MEMBERS] team is not an array:', typeof team);
      return res.json({
        success: true,
        members: [],
        total: 0,
        warning: 'Team data is not an array'
      });
    }
    
    const membersWithAccounts = team.map(member => {
      const account = data.memberAccounts?.find(a => a.memberId === member.id);
      return {
        id: member.id,
        name: member.name || 'Unknown',
        email: member.email || 'no-email@company.com',
        title: member.title || '',
        image: member.image || '',
        account: account ? {
          id: account.id,
          email: account.email,
          status: account.status,
          role: account.role,
          hasAccount: true,
          lastLogin: account.lastLogin,
          createdAt: account.createdAt
        } : {
          hasAccount: false
        }
      };
    });
    
    console.log(`[ADMIN/MEMBERS] Returning ${membersWithAccounts.length} members:`, 
      membersWithAccounts.map(m => ({ id: m.id, name: m.name, hasAccount: m.account.hasAccount })));
    
    res.json({
      success: true,
      members: membersWithAccounts,
      total: membersWithAccounts.length,
      debug: {
        teamLength: team.length,
        membersWithAccounts: membersWithAccounts.length,
        membersWithoutAccount: membersWithAccounts.filter(m => !m.account.hasAccount).length
      }
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to fetch members', details: error.message });
  }
});

// POST /api/admin/members/:id/account - Créer un compte pour un membre
app.post('/api/admin/members/:id/account', verifyToken, requireAdmin, (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    const { email, initialPassword, role = 'member' } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const data = readData();
    const member = data.team?.find(t => t.id === memberId);
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    // Vérifier si un compte existe déjà
    const existingAccount = data.memberAccounts?.find(a => a.memberId === memberId);
    if (existingAccount) {
      return res.status(400).json({ error: 'Account already exists for this member' });
    }
    
    // Vérifier si l'email est déjà utilisé
    const emailExists = data.memberAccounts?.find(a => a.email === email);
    if (emailExists) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Créer le code de connexion
    const loginCode = generateLoginCode();
    
    // Créer le compte
    const newAccount = {
      id: (data.memberAccounts?.length || 0) + 1,
      memberId: memberId,
      email: email,
      passwordHash: initialPassword ? hashPassword(initialPassword) : null,
      role: role,
      status: initialPassword ? 'active' : 'pending',
      loginCode: loginCode,
      loginCodeExpiry: getExpiryDate(24).toISOString(),
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };
    
    if (!data.memberAccounts) {
      data.memberAccounts = [];
    }
    data.memberAccounts.push(newAccount);
    
    // Mettre à jour l'email du membre
    member.email = email;
    
    writeDataAndBackup(data, 'CREATE_ACCOUNT', `Account created: ${email} for ${member.name}`);
    
    res.json({
      success: true,
      message: 'Account created successfully',
      account: {
        id: newAccount.id,
        email: newAccount.email,
        role: newAccount.role,
        status: newAccount.status,
        loginCode: newAccount.loginCode,
        loginCodeExpiry: newAccount.loginCodeExpiry
      }
    });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// POST /api/admin/members/:id/login-code - Générer nouveau code de connexion
app.post('/api/admin/members/:id/login-code', verifyToken, requireAdmin, (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    const data = readData();
    const account = data.memberAccounts?.find(a => a.memberId === memberId);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Générer un nouveau code
    const newLoginCode = generateLoginCode();
    account.loginCode = newLoginCode;
    account.loginCodeExpiry = getExpiryDate(24).toISOString();
    account.updatedAt = new Date().toISOString();
    
    writeDataAndBackup(data, 'GENERATE_LOGIN_CODE', `Login code generated: ${account.email}`);
    
    res.json({
      success: true,
      message: 'Login code generated successfully',
      loginCode: newLoginCode,
      expiresAt: account.loginCodeExpiry
    });
  } catch (error) {
    console.error('Generate login code error:', error);
    res.status(500).json({ error: 'Failed to generate login code' });
  }
});

// PUT /api/admin/members/:id/account - Modifier le compte d'un membre
app.put('/api/admin/members/:id/account', verifyToken, requireAdmin, (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    const { email, status, role } = req.body;
    
    const data = readData();
    const account = data.memberAccounts?.find(a => a.memberId === memberId);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Mettre à jour les champs
    if (email !== undefined && email !== account.email) {
      const emailExists = data.memberAccounts?.find(a => a.email === email && a.id !== account.id);
      if (emailExists) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      account.email = email;
    }
    
    if (status !== undefined && ['active', 'pending', 'inactive'].includes(status)) {
      account.status = status;
    }
    
    if (role !== undefined && ['admin', 'member', 'viewer'].includes(role)) {
      account.role = role;
    }
    
    account.updatedAt = new Date().toISOString();
    writeDataAndBackup(data, 'UPDATE_ACCOUNT', `Account updated: ${account.email}`);
    
    res.json({
      success: true,
      message: 'Account updated successfully',
      account: {
        email: account.email,
        status: account.status,
        role: account.role,
        updatedAt: account.updatedAt
      }
    });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// DELETE /api/admin/members/:id/account - Supprimer le compte d'un membre
app.delete('/api/admin/members/:id/account', verifyToken, requireAdmin, (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    const data = readData();
    
    const accountIndex = data.memberAccounts?.findIndex(a => a.memberId === memberId);
    
    if (accountIndex === -1) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    const removedAccount = data.memberAccounts[accountIndex];
    data.memberAccounts.splice(accountIndex, 1);
    
    writeDataAndBackup(data, 'DELETE_ACCOUNT', `Account deleted: ${removedAccount.email}`);
    
    res.json({
      success: true,
      message: 'Account deleted successfully',
      account: {
        email: removedAccount.email
      }
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// ============= TEAM ROUTES =============

const TEAM_PHOTO_BUCKET = process.env.SUPABASE_TEAM_PHOTO_BUCKET || 'team-photos';

const parseJsonValue = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeArrayValue = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseJsonValue(value, []);
    return Array.isArray(parsed) ? parsed : [];
  }
  return [];
};

const buildSocialLinks = (body, existingLinks = {}) => {
  const baseLinks = parseJsonValue(existingLinks, {});
  const expertise = normalizeArrayValue(body.expertise ?? body.specialties ?? baseLinks.expertise ?? baseLinks.specialties ?? []);
  const achievements = normalizeArrayValue(body.achievements ?? body.certifications ?? baseLinks.achievements ?? baseLinks.certifications ?? []);

  console.log('🔧 buildSocialLinks input:', { 
    body_expertise: body.expertise,
    body_achievements: body.achievements,
    result_expertise: expertise,
    result_achievements: achievements
  });

  return {
    ...baseLinks,
    linkedin: body.linkedin ?? body.linked_in ?? baseLinks.linkedin ?? baseLinks.linked_in ?? null,
    expertise,
    achievements,
    is_founder: body.is_founder ?? baseLinks.is_founder ?? false,
    is_visible: body.is_visible ?? baseLinks.is_visible ?? true
  };
};

const buildTeamResponse = (member) => {
  const socialLinks = parseJsonValue(member.social_links, {});
  return {
    ...member,
    title: member.title || member.role || '',
    role: member.role || member.title || '',
    description: member.description || member.bio || '',
    bio: member.bio || member.description || '',
    image: member.image || member.photo_url || null,
    photo_url: member.photo_url || member.image || null,
    linkedin: socialLinks.linkedin || member.linked_in || null,
    expertise: normalizeArrayValue(socialLinks.expertise || member.expertise || []),
    achievements: normalizeArrayValue(socialLinks.achievements || member.achievements || []),
    specialties: normalizeArrayValue(socialLinks.expertise || member.specialties || []),
    certifications: normalizeArrayValue(socialLinks.achievements || member.certifications || []),
    is_founder: socialLinks.is_founder ?? member.is_founder ?? false,
    is_visible: socialLinks.is_visible ?? member.is_visible ?? true,
    display_order: member.display_order ?? member.ordering ?? 0
  };
};

app.post('/api/uploads/team-photo', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const ext = path.extname(req.file.originalname || '').toLowerCase();
    const safeExt = /^\.[a-z0-9]+$/i.test(ext) ? ext : '.jpg';
    const filePath = `team/${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;

    const { error } = await supabase.storage
      .from(TEAM_PHOTO_BUCKET)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: publicData } = supabase.storage
      .from(TEAM_PHOTO_BUCKET)
      .getPublicUrl(filePath);

    res.json({ url: publicData.publicUrl, path: filePath });
  } catch (error) {
    console.error('Erreur upload photo equipe:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/team', async (req, res) => {
  try {
    const team = await supabase.team.getAll();
    const mapped = (team || []).map(buildTeamResponse);
    res.json(mapped);
  } catch (error) {
    console.error('Erreur récupération équipe:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/team/:id', async (req, res) => {
  try {
    const member = await supabase.team.getById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }
    res.json(buildTeamResponse(member));
  } catch (error) {
    console.error('Erreur récupération membre:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/team', upload.single('image'), async (req, res) => {
  try {
    console.log('➕ POST /api/team', req.body);
    
    let imageUrl = req.body.photo_url || null;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.image && req.body.image.startsWith('data:')) {
      if (req.body.image.length > config.imageSizeLimit) {
        return res.status(400).json({ error: `Image trop volumineuse (${Math.round(req.body.image.length / 1024)}KB, max ${Math.round(config.imageSizeLimit / 1024)}KB). Compressez l'image.` });
      }
      imageUrl = req.body.image;
    }

    const socialLinks = buildSocialLinks(req.body, {});
    const orderingValue = req.body.display_order ?? req.body.ordering;

    const member = {
      name: req.body.name,
      role: req.body.role || req.body.title || null,
      department: req.body.department || null,
      bio: req.body.bio ?? req.body.description ?? null,
      photo_url: imageUrl,
      email: req.body.email || null,
      phone: req.body.phone || null,
      social_links: socialLinks,
      ordering: orderingValue ?? null
    };

    if (member.ordering === null) {
      delete member.ordering;
    }

    const newMember = await supabase.team.create(member);
    console.log('✅ Team member created:', newMember);

    res.status(201).json(buildTeamResponse(newMember));
  } catch (error) {
    console.error('Erreur création équipe:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/team/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 PUT /api/team/${id}`, req.body);
    
    // Get existing member
    const existingMember = await supabase.team.getById(id);
    if (!existingMember) {
      console.warn(`❌ Membre non trouvé: ${id}`);
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    let imageUrl = req.body.photo_url || existingMember.photo_url || existingMember.image || null;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.image && req.body.image.startsWith('data:')) {
      if (req.body.image.length > config.imageSizeLimit) {
        return res.status(400).json({ error: `Image trop volumineuse (${Math.round(req.body.image.length / 1024)}KB, max ${Math.round(config.imageSizeLimit / 1024)}KB). Compressez l'image.` });
      }
      imageUrl = req.body.image;
    }

    const socialLinks = buildSocialLinks(req.body, existingMember.social_links);
    const orderingValue = req.body.display_order ?? req.body.ordering ?? existingMember.ordering;

    const updateData = {
      name: req.body.name || existingMember.name,
      role: req.body.role || req.body.title || existingMember.role || null,
      department: req.body.department || existingMember.department || null,
      bio: req.body.bio !== undefined ? req.body.bio : (req.body.description ?? existingMember.bio),
      photo_url: imageUrl,
      email: req.body.email || existingMember.email || null,
      phone: req.body.phone || existingMember.phone || null,
      social_links: socialLinks,
      ordering: orderingValue
    };

    const updatedMember = await supabase.team.update(id, updateData);
    console.log('✅ Team member updated:', updatedMember);
    res.json(buildTeamResponse(updatedMember));
  } catch (error) {
    console.error('Erreur mise à jour équipe:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get member before deleting for response
    const member = await supabase.team.getById(id);
    if (!member) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    await supabase.team.delete(id);
    console.log('✅ Team member deleted:', member.name);
    res.json(member);
  } catch (error) {
    console.error('Erreur suppression équipe:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= TESTIMONIALS (TEMOIGNAGES) ROUTES =============

app.get('/api/testimonials', async (req, res) => {
  try {
    const temoignages = await supabase.temoignages.getAll();
    res.json(temoignages || []);
  } catch (error) {
    console.error('Erreur récupération temoignages:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/testimonials', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = null;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const temoignageData = {
      name: req.body.name,
      title: req.body.title,
      company: req.body.company,
      message: req.body.testimonial || req.body.message,
      rating: parseInt(req.body.rating) || 5,
      image_url: imageUrl,
      published: true
    };

    const temoignage = await supabase.temoignages.create(temoignageData);
    console.log('✅ Temoignage créé:', temoignage.name);
    res.status(201).json(temoignage);
  } catch (error) {
    console.error('Erreur création temoignage:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/testimonials/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    
    let imageUrl = req.body.image_url || req.body.image;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    }

    const temoignageData = {
      name: req.body.name,
      title: req.body.title,
      company: req.body.company,
      message: req.body.testimonial || req.body.message,
      rating: parseInt(req.body.rating) || 5,
      image_url: imageUrl,
      published: req.body.published !== undefined ? req.body.published : true
    };

    const temoignage = await supabase.temoignages.update(id, temoignageData);
    console.log('✅ Temoignage mis à jour:', temoignage.name);
    res.json(temoignage);
  } catch (error) {
    console.error('Erreur mise à jour temoignage:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await supabase.temoignages.delete(id);
    console.log('✅ Temoignage supprimé:', id);
    res.json(result);
  } catch (error) {
    console.error('Erreur suppression temoignage:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= NEWS (ACTUALITE) ROUTES =============

app.get('/api/news', async (req, res) => {
  try {
    const news = await supabase.actualite.getAll();
    res.json(news || []);
  } catch (error) {
    console.error('Erreur récupération actualites:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/actualite', async (req, res) => {
  try {
    const actualites = await supabase.actualite.getAll();
    res.json(actualites || []);
  } catch (error) {
    console.error('Erreur récupération actualites:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/news', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = null;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const actualiteData = {
      title: req.body.title,
      slug: req.body.slug || req.body.title.toLowerCase().replace(/\s+/g, '-'),
      excerpt: req.body.description || req.body.excerpt,
      content: req.body.content || '',
      image_url: imageUrl,
      author: req.body.author,
      published: req.body.published !== undefined ? req.body.published : true,
      published_at: new Date().toISOString()
    };

    const actualite = await supabase.actualite.create(actualiteData);
    console.log('✅ Actualite créée:', actualite.title);
    res.status(201).json(actualite);
  } catch (error) {
    console.error('Erreur création actualite:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/news/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    
    let imageUrl = req.body.image_url || req.body.image;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    }

    const actualiteData = {
      title: req.body.title,
      slug: req.body.slug || req.body.title.toLowerCase().replace(/\s+/g, '-'),
      excerpt: req.body.description || req.body.excerpt,
      content: req.body.content || '',
      image_url: imageUrl,
      author: req.body.author,
      published: req.body.published !== undefined ? req.body.published : true
    };

    const actualite = await supabase.actualite.update(id, actualiteData);
    console.log('✅ Actualite mise à jour:', actualite.title);
    res.json(actualite);
  } catch (error) {
    console.error('Erreur mise à jour actualite:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await supabase.actualite.delete(id);
    console.log('✅ Actualite supprimée:', id);
    res.json(result);
  } catch (error) {
    console.error('Erreur suppression actualite:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= SOLUTIONS ROUTES =============

app.get('/api/solutions', async (req, res) => {
  try {
    const solutions = await supabase.solutions.getAll();
    res.json(solutions || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/solutions', upload.single('image'), (req, res) => {
  try {
    const data = readData();
    const newId = Math.max(0, ...data.solutions.map(s => s.id)) + 1;

    let imageUrl = null;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.image && req.body.image.startsWith('data:')) {
      imageUrl = req.body.image;
    }

    let features = [];
    let benefits = [];
    if (req.body.features) {
      features = typeof req.body.features === 'string' ? JSON.parse(req.body.features) : req.body.features;
    }
    if (req.body.benefits) {
      benefits = typeof req.body.benefits === 'string' ? JSON.parse(req.body.benefits) : req.body.benefits;
    }

    const solution = {
      id: newId,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category || '',
      image: imageUrl,
      features: features,
      benefits: benefits,
      createdAt: new Date().toISOString()
    };

    data.solutions.push(solution);
    writeDataAndBackup(data, 'ADD_SOLUTION', `Solution added: ${solution.name}`);
    res.status(201).json(solution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/solutions/:id', upload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const index = data.solutions.findIndex(s => s.id == id);
    if (index === -1) return res.status(404).json({ error: 'Non trouvé' });

    let imageUrl = data.solutions[index].image;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.image && req.body.image.startsWith('data:')) {
      imageUrl = req.body.image;
    }

    let features = data.solutions[index].features || [];
    let benefits = data.solutions[index].benefits || [];
    if (req.body.features) {
      features = typeof req.body.features === 'string' ? JSON.parse(req.body.features) : req.body.features;
    }
    if (req.body.benefits) {
      benefits = typeof req.body.benefits === 'string' ? JSON.parse(req.body.benefits) : req.body.benefits;
    }

    data.solutions[index] = {
      ...data.solutions[index],
      name: req.body.name || data.solutions[index].name,
      description: req.body.description !== undefined ? req.body.description : data.solutions[index].description,
      category: req.body.category !== undefined ? req.body.category : data.solutions[index].category,
      image: imageUrl,
      features: features,
      benefits: benefits
    };

    writeDataAndBackup(data, 'UPDATE_SOLUTION', `Solution updated: ${data.solutions[index].name}`);
    res.json(data.solutions[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/solutions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const index = data.solutions.findIndex(s => s.id == id);
    if (index === -1) return res.status(404).json({ error: 'Non trouvé' });

    const deleted = data.solutions.splice(index, 1);
    writeDataAndBackup(data, 'DELETE_SOLUTION', `Solution deleted: ${deleted[0].name}`);
    res.json(deleted[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= JOBS ROUTES =============

app.get('/api/jobs', (req, res) => {
  try {
    const data = readData();
    res.json(data.jobs || []);
  } catch (error) {
    console.error('Erreur récupération jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/jobs', (req, res) => {
  try {
    const data = readData();
    const newId = data.jobs && data.jobs.length > 0 ? Math.max(...data.jobs.map(j => j.id || 0)) + 1 : 1;

    const job = {
      id: newId,
      title: req.body.title,
      description: req.body.description,
      location: req.body.location || '',
      type: req.body.type || '',
      department: req.body.department || '',
      requirements: req.body.requirements || '',
      salaryRange: req.body.salaryRange || '',
      createdAt: new Date().toISOString()
    };

    if (!data.jobs) data.jobs = [];
    data.jobs.push(job);
    writeDataAndBackup(data, 'ADD_JOB', `Job posted: ${job.title}`);
    console.log('✅ Job created:', job.title);
    res.status(201).json(job);
  } catch (error) {
    console.error('Erreur création job:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/jobs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const index = data.jobs ? data.jobs.findIndex(j => j.id == id) : -1;
    if (index === -1) return res.status(404).json({ error: 'Job non trouvé' });

    data.jobs[index] = {
      ...data.jobs[index],
      title: req.body.title !== undefined ? req.body.title : data.jobs[index].title,
      description: req.body.description !== undefined ? req.body.description : data.jobs[index].description,
      location: req.body.location !== undefined ? req.body.location : data.jobs[index].location,
      type: req.body.type !== undefined ? req.body.type : data.jobs[index].type,
      department: req.body.department !== undefined ? req.body.department : data.jobs[index].department,
      requirements: req.body.requirements !== undefined ? req.body.requirements : data.jobs[index].requirements,
      salaryRange: req.body.salaryRange !== undefined ? req.body.salaryRange : data.jobs[index].salaryRange
    };

    writeDataAndBackup(data, 'UPDATE_JOB', `Job updated: ${data.jobs[index].title}`);
    console.log('✅ Job updated:', data.jobs[index].title);
    res.json(data.jobs[index]);
  } catch (error) {
    console.error('Erreur mise à jour job:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/jobs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const index = data.jobs ? data.jobs.findIndex(j => j.id == id) : -1;
    if (index === -1) return res.status(404).json({ error: 'Job non trouvé' });

    const deleted = data.jobs.splice(index, 1);
    writeDataAndBackup(data, 'DELETE_JOB', `Job deleted: ${deleted[0].title}`);
    console.log('✅ Job deleted:', deleted[0].title);
    res.json(deleted[0]);
  } catch (error) {
    console.error('Erreur suppression job:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= APPLICATIONS (CANDIDATURE) ROUTES =============

app.get('/api/applications', async (req, res) => {
  try {
    const apps = await supabase.candidature.getAll();
    res.json(apps || []);
  } catch (error) {
    console.error('Erreur récupération candidatures:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/applications', async (req, res) => {
  try {
    const candidatureData = {
      job_id: req.body.jobId || req.body.job_id,
      first_name: req.body.firstName || req.body.first_name || req.body.fullName?.split(' ')[0],
      last_name: req.body.lastName || req.body.last_name || req.body.fullName?.split(' ')[1] || '',
      email: req.body.email,
      phone: req.body.phone,
      cv_url: req.body.cvUrl || req.body.cv_url || req.body.resume,
      cover_letter: req.body.coverLetter || req.body.cover_letter
    };

    const application = await supabase.candidature.create(candidatureData);
    console.log('✅ Candidature créée:', application.first_name);
    res.status(201).json(application);
  } catch (error) {
    console.error('Erreur création candidature:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const candidatureData = {
      status: req.body.status
    };

    const application = await supabase.candidature.update(id, candidatureData);
    console.log('✅ Candidature mise à jour:', application.id);
    res.json(application);
  } catch (error) {
    console.error('Erreur mise à jour candidature:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await supabase.candidature.delete(id);
    console.log('✅ Candidature supprimée:', id);
    res.json(result);
  } catch (error) {
    console.error('Erreur suppression candidature:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= COMPLETED PROJECTS (PROJETS REALISES) ROUTES =============

app.get('/api/projets-realises', async (req, res) => {
  try {
    const projets = await supabase.projetsRealises.getAll();
    res.json(projets || []);
  } catch (error) {
    console.error('Erreur récupération projets:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projets-realises/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projet = await supabase.projetsRealises.getById(id);
    if (!projet) return res.status(404).json({ error: 'Projet non trouvé' });
    res.json(projet);
  } catch (error) {
    console.error('Erreur récupération projet:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projets-realises', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = null;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const projetData = {
      title: req.body.title,
      slug: req.body.slug || req.body.title.toLowerCase().replace(/\s+/g, '-'),
      description: req.body.description,
      image_url: imageUrl,
      client: req.body.client,
      category: req.body.category,
      technologies: req.body.technologies ? (Array.isArray(req.body.technologies) ? req.body.technologies : req.body.technologies.split(',')) : [],
      results: req.body.results,
      published: req.body.published !== undefined ? req.body.published : true
    };

    const projet = await supabase.projetsRealises.create(projetData);
    console.log('✅ Projet créé:', projet.title);
    res.status(201).json(projet);
  } catch (error) {
    console.error('Erreur création projet:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/projets-realises/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    
    let imageUrl = req.body.image_url || req.body.image;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    }

    const projetData = {
      title: req.body.title,
      slug: req.body.slug || req.body.title.toLowerCase().replace(/\s+/g, '-'),
      description: req.body.description,
      image_url: imageUrl,
      client: req.body.client,
      category: req.body.category,
      technologies: req.body.technologies ? (Array.isArray(req.body.technologies) ? req.body.technologies : req.body.technologies.split(',')) : [],
      results: req.body.results,
      published: req.body.published !== undefined ? req.body.published : true
    };

    const projet = await supabase.projetsRealises.update(id, projetData);
    console.log('✅ Projet mis à jour:', projet.title);
    res.json(projet);
  } catch (error) {
    console.error('Erreur mise à jour projet:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/projets-realises/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await supabase.projetsRealises.delete(id);
    console.log('✅ Projet supprimé:', id);
    res.json(result);
  } catch (error) {
    console.error('Erreur suppression projet:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= CONTACTS ROUTES =============

app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await supabase.contacts.getAll();
    
    // Map Supabase schema to expected format
    const mapped = contacts.map(contact => ({
      ...contact,
      fullName: contact.name,
      replyMessage: contact.notes,
      replyDate: contact.updated_at,
      createdAt: contact.created_at
    }));
    
    res.json(mapped || []);
  } catch (error) {
    console.error('Erreur récupération contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const contact = {
      name: req.body.fullName || req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      message: `${req.body.subject ? '[' + req.body.subject + '] ' : ''}${req.body.message || ''}`,
      status: 'pending'
    };

    const newContact = await supabase.contacts.create(contact);
    
    // Map response back to expected format
    const response = {
      ...newContact,
      fullName: newContact.name,
      createdAt: newContact.created_at
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Erreur création contact:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
   const updateData = {
      status: req.body.status
    };

    // Map replyMessage to notes
    if (req.body.replyMessage) {
      updateData.notes = req.body.replyMessage;
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const updated = await supabase.contacts.update(id, updateData);
    if (!updated) {
      return res.status(404).json({ error: 'Non trouvé' });
    }
    
    // Map response back
    const response = {
      ...updated,
      fullName: updated.name,
      replyMessage: updated.notes,
      replyDate: updated.updated_at,
      createdAt: updated.created_at
    };
    
    res.json(response);
  } catch (error) {
    console.error('Erreur mise à jour contact:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contacts/reply', async (req, res) => {
  try {
    const { id, method, message } = req.body;
    
    const updateData = {
      status: 'replied',
      notes: message
    };

    const updated = await supabase.contacts.update(id, updateData);
    if (!updated) {
      return res.status(404).json({ error: 'Contact non trouvé' });
    }

    // Map response back
    const response = {
      ...updated,
      fullName: updated.name,
      replyMessage: updated.notes,
      replyDate: updated.updated_at,
      replyMethod: method,
      createdAt: updated.created_at
    };

    res.json({ success: true, contact: response });
  } catch (error) {
    console.error('Erreur réponse contact:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get contact before deleting for response
    const contact = await supabase.contacts.getById(id);
    if (!contact) {
      return res.status(404).json({ error: 'Non trouvé' });
    }

    await supabase.contacts.delete(id);
    res.json(contact);
  } catch (error) {
    console.error('Erreur suppression contact:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= SETTINGS ROUTES =============

app.get('/api/settings', async (req, res) => {
  try {
    const settings = await supabase.settings.getAll();
    
    // Convert array of {key, value} to single object
    // and map snake_case keys to camelCase for frontend
    const settingsObject = {};
    const keyMap = {
      site_title: 'siteTitle',
      company_name: 'company_name',
      slogan: 'slogan',
      tagline: 'tagline',
      email: 'email',
      phone: 'phone',
      address: 'address',
      social_media: 'socialMedia',
      business_hours: 'businessHours',
      primary_color: 'primaryColor',
      secondary_color: 'secondary_color',
      logo_url: 'logo_url',
      facebook_url: 'facebook_url',
      linkedin_url: 'linkedin_url',
      twitter_url: 'twitter_url',
      description: 'description',
      maintenance_mode: 'maintenanceMode',
      timezone: 'timezone'
    };

    settings.forEach(setting => {
      const frontendKey = keyMap[setting.key] || setting.key;
      
      // Try to parse JSON values
      try {
        settingsObject[frontendKey] = JSON.parse(setting.value);
      } catch (e) {
        // If not JSON, use as-is
        settingsObject[frontendKey] = setting.value;
      }
    });
    
    res.json(settingsObject);
  } catch (error) {
    console.error('Erreur récupération settings:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    // Map for converting frontend keys to database keys
    const settingsMap = {
      siteTitle: 'site_title',
      company_name: 'company_name',
      slogan: 'slogan',
      tagline: 'tagline',
      email: 'email',
      phone: 'phone',
      address: 'address',
      socialMedia: 'social_media',
      businessHours: 'business_hours',
      primaryColor: 'primary_color',
      description: 'description'
    };

    // Process each setting and save to database
    for (const [frontendKey, dbKey] of Object.entries(settingsMap)) {
      if (req.body[frontendKey] !== undefined) {
        const value = typeof req.body[frontendKey] === 'object' 
          ? JSON.stringify(req.body[frontendKey])
          : req.body[frontendKey];
        
        await supabase.settings.set(dbKey, value);
      }
    }

    // After saving, fetch ALL settings to return them
    // This ensures consistency between what was sent and what's in the database
    const allSettings = await supabase.settings.getAll();
    
    const settingsObject = {};
    const keyMap = {
      site_title: 'siteTitle',
      company_name: 'company_name',
      slogan: 'slogan',
      tagline: 'tagline',
      email: 'email',
      phone: 'phone',
      address: 'address',
      social_media: 'socialMedia',
      business_hours: 'businessHours',
      primary_color: 'primaryColor',
      secondary_color: 'secondary_color',
      logo_url: 'logo_url',
      facebook_url: 'facebook_url',
      linkedin_url: 'linkedin_url',
      twitter_url: 'twitter_url',
      description: 'description',
      maintenance_mode: 'maintenanceMode',
      timezone: 'timezone'
    };

    allSettings.forEach(setting => {
      const frontendKey = keyMap[setting.key] || setting.key;
      
      // Try to parse JSON values
      try {
        settingsObject[frontendKey] = JSON.parse(setting.value);
      } catch (e) {
        // If not JSON, use as-is
        settingsObject[frontendKey] = setting.value;
      }
    });

    res.json(settingsObject);
    console.log('✅ Settings updated:', Object.keys(settingsObject).join(', '));
  } catch (error) {
    console.error('Erreur mise à jour settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= SERVICES ROUTES =============

app.get('/api/services', async (req, res) => {
  try {
    const services = await supabase.services.getAll();
    res.json(services || []);
  } catch (error) {
    console.error('Erreur récupération services:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/services', (req, res) => {
  try {
    const data = readData();
    const newId = Math.max(0, ...data.services.map(s => s.id)) + 1;

    const service = {
      id: newId,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category || '',
      price: req.body.price || 0,
      createdAt: new Date().toISOString()
    };

    data.services.push(service);
    writeDataAndBackup(data, 'ADD_SERVICE', `Service added: ${service.name}`);
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/services/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const index = data.services.findIndex(s => s.id == id);
    if (index === -1) return res.status(404).json({ error: 'Non trouvé' });

    data.services[index] = {
      ...data.services[index],
      name: req.body.name || data.services[index].name,
      description: req.body.description !== undefined ? req.body.description : data.services[index].description,
      category: req.body.category !== undefined ? req.body.category : data.services[index].category,
      price: req.body.price !== undefined ? req.body.price : data.services[index].price
    };

    writeDataAndBackup(data, 'UPDATE_SERVICE', `Service updated: ${data.services[index].name}`);
    res.json(data.services[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/services/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const index = data.services.findIndex(s => s.id == id);
    if (index === -1) return res.status(404).json({ error: 'Non trouvé' });

    const deleted = data.services.splice(index, 1);
    writeDataAndBackup(data, 'DELETE_SERVICE', `Service deleted: ${deleted[0].name}`);
    res.json(deleted[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= LOGS ROUTES =============

// Configuration dynamique
const config = {
  imageSizeLimit: 500 * 1024 // 500KB max pour les images base64
};

// POST /api/config/increase-image-limit - Augmenter la limite d'image
app.post('/api/config/increase-image-limit', (req, res) => {
  try {
    const { newLimit } = req.body;
    
    if (!newLimit || newLimit < 100 * 1024) {
      return res.status(400).json({ error: 'La limite doit être au moins 100KB' });
    }

    if (newLimit > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'La limite ne peut pas dépasser 10MB' });
    }

    const oldLimit = config.imageSizeLimit;
    config.imageSizeLimit = newLimit;

    console.log(`⚙️ Limite d'image augmentée: ${oldLimit / 1024}KB → ${newLimit / 1024}KB`);

    res.json({
      success: true,
      message: `Limite d'image augmentée à ${(newLimit / 1024).toFixed(0)}KB`,
      oldLimit: `${(oldLimit / 1024).toFixed(0)}KB`,
      newLimit: `${(newLimit / 1024).toFixed(0)}KB`
    });
  } catch (error) {
    console.error('Erreur lors de la modification de la limite:', error);
    res.status(500).json({ error: 'Impossible de modifier la limite' });
  }
});

// GET /api/config - Obtenir la configuration actuelle
app.get('/api/config', (req, res) => {
  try {
    res.json({
      imageSizeLimit: `${(config.imageSizeLimit / 1024).toFixed(0)}KB`,
      imageSizeLimitBytes: config.imageSizeLimit
    });
  } catch (error) {
    res.status(500).json({ error: 'Impossible de récupérer la configuration' });
  }
});

// Stockage des logs en mémoire (max 1000 logs)
const logsStore = [];
const MAX_LOGS = 1000;

// POST /api/logs - Envoyer un log
app.post('/api/logs', (req, res) => {
  try {
    const { timestamp, level, message, data } = req.body;
    
    const logEntry = {
      timestamp: timestamp || new Date().toISOString(),
      level: level || 'INFO',
      message,
      data,
      receivedAt: new Date().toISOString()
    };

    // Ajouter au stockage
    logsStore.unshift(logEntry);
    if (logsStore.length > MAX_LOGS) {
      logsStore.pop(); // Garder max 1000 logs
    }

    // Afficher dans la console du serveur aussi
    const emoji = {
      DEBUG: '🔍',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌',
      SUCCESS: '✅'
    };

    console.log(`${emoji[level] || '•'} [${level}] ${message}`, data || '');

    res.json({ 
      success: true, 
      message: 'Log enregistré',
      totalLogs: logsStore.length 
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du log:', error);
    res.status(500).json({ error: 'Impossible d\'enregistrer le log' });
  }
});

// GET /api/logs - Récupérer les logs
app.get('/api/logs', (req, res) => {
  try {
    const level = req.query.level;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    let filtered = logsStore;

    // Filtrer par niveau si spécifié
    if (level && level !== 'ALL') {
      filtered = filtered.filter(log => log.level === level);
    }

    // Appliquer pagination
    const paginated = filtered.slice(offset, offset + limit);

    res.json({
      logs: paginated,
      total: filtered.length,
      limit,
      offset,
      currentPage: Math.floor(offset / limit) + 1
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des logs:', error);
    res.status(500).json({ error: 'Impossible de récupérer les logs' });
  }
});

// GET /api/logs/stats - Obtenir des statistiques sur les logs
app.get('/api/logs/stats', (req, res) => {
  try {
    const stats = {
      total: logsStore.length,
      byLevel: {
        DEBUG: logsStore.filter(l => l.level === 'DEBUG').length,
        INFO: logsStore.filter(l => l.level === 'INFO').length,
        WARN: logsStore.filter(l => l.level === 'WARN').length,
        ERROR: logsStore.filter(l => l.level === 'ERROR').length,
        SUCCESS: logsStore.filter(l => l.level === 'SUCCESS').length
      },
      oldestLog: logsStore[logsStore.length - 1]?.timestamp || null,
      newestLog: logsStore[0]?.timestamp || null
    };

    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Impossible de récupérer les statistiques' });
  }
});

// DELETE /api/logs - Effacer tous les logs
app.delete('/api/logs', (req, res) => {
  try {
    const count = logsStore.length;
    logsStore.length = 0; // Vider le tableau

    res.json({ 
      success: true,
      message: `${count} log(s) supprimé(s)`,
      remaining: logsStore.length
    });
  } catch (error) {
    console.error('Erreur lors de la suppression des logs:', error);
    res.status(500).json({ error: 'Impossible de supprimer les logs' });
  }
});

// ============= PROJECTS ROUTES =============

// GET /api/projects - Récupérer tous les projets
app.get('/api/projects', (req, res) => {
  try {
    const data = readData();
    const projects = data.projects || [];
    res.json(projects);
  } catch (error) {
    console.error('Erreur lors du chargement des projets:', error);
    res.status(500).json({ error: 'Impossible de charger les projets' });
  }
});

// GET /api/projects/:id - Récupérer un projet spécifique
app.get('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const projects = data.projects || [];
    const project = projects.find(p => p.id == id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Erreur lors du chargement du projet:', error);
    res.status(500).json({ error: 'Impossible de charger le projet' });
  }
});

// POST /api/projects - Créer un nouveau projet
app.post('/api/projects', (req, res) => {
  try {
    const { name, client, description, category, status, technologies, details } = req.body;

    if (!name || !client) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const data = readData();
    const projects = data.projects || [];

    const newProject = {
      id: Date.now(),
      name,
      client,
      description,
      category,
      status,
      technologies: Array.isArray(technologies) ? technologies : [technologies].filter(Boolean),
      details,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    projects.push(newProject);
    data.projects = projects;
    writeData(data);

    console.log('✅ Project created:', newProject.id);
    res.status(201).json(newProject);

  } catch (error) {
    console.error('Erreur lors de la création du projet:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/projects/:id - Mettre à jour un projet
app.put('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, client, description, category, status, technologies, details } = req.body;

    const data = readData();
    const projects = data.projects || [];
    const projectIndex = projects.findIndex(p => p.id == id);

    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updatedProject = {
      ...projects[projectIndex],
      name: name || projects[projectIndex].name,
      client: client || projects[projectIndex].client,
      description: description || projects[projectIndex].description,
      category: category || projects[projectIndex].category,
      status: status || projects[projectIndex].status,
      technologies: technologies || projects[projectIndex].technologies,
      details: details || projects[projectIndex].details,
      updatedAt: new Date().toISOString()
    };

    projects[projectIndex] = updatedProject;
    data.projects = projects;
    writeData(data);

    console.log('✅ Project updated:', id);
    res.json(updatedProject);

  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/projects/:id - Supprimer un projet
app.delete('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;

    const data = readData();
    const projects = data.projects || [];
    const projectIndex = projects.findIndex(p => p.id == id);

    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const deletedProject = projects[projectIndex];
    projects.splice(projectIndex, 1);
    data.projects = projects;
    writeData(data);

    console.log('✅ Project deleted:', id);
    res.json({ message: 'Project deleted', project: deletedProject });

  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= MIGRATION ROUTES =============

// POST /api/admin/migrate-data - Migrate data from data.json to PostgreSQL
import { migrateDataHandler } from './controllers/migrationController.js';

app.post('/api/admin/migrate-data', verifyToken, requireAdmin, async (req, res) => {
  try {
    console.log('🚀 Migration endpoint called by:', req.user?.email);
    await migrateDataHandler(req, res);
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({
      status: 'FAILED',
      error: error.message
    });
  }
});

// ============= FORMATIONS ENDPOINTS =============

// GET all formations
app.get('/api/formations', async (req, res) => {
  try {
    const formations = await supabase.formations.getAll();
    res.json(formations);
  } catch (error) {
    console.error('Error fetching formations:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET formation by ID
app.get('/api/formations/:id', async (req, res) => {
  try {
    const formation = await supabase.formations.getById(req.params.id);
    res.json(formation);
  } catch (error) {
    console.error('Error fetching formation:', error);
    res.status(404).json({ error: 'Formation not found' });
  }
});

// CREATE formation (admin only)
app.post('/api/formations', verifyToken, requireAdmin, async (req, res) => {
  try {
    const formation = await supabase.formations.create(req.body);
    res.status(201).json(formation);
  } catch (error) {
    console.error('Error creating formation:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE formation (admin only)
app.put('/api/formations/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const formation = await supabase.formations.update(req.params.id, req.body);
    res.json(formation);
  } catch (error) {
    console.error('Error updating formation:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE formation (admin only)
app.delete('/api/formations/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await supabase.formations.delete(req.params.id);
    res.json({ success: true, message: 'Formation deleted' });
  } catch (error) {
    console.error('Error deleting formation:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= INSCRIPTIONS FORMATIONS ENDPOINTS =============

// GET all inscriptions (admin only)
app.get('/api/inscriptions-formations', verifyToken, requireAdmin, async (req, res) => {
  try {
    const inscriptions = await supabase.inscriptionsFormations.getAll();
    res.json(inscriptions);
  } catch (error) {
    console.error('Error fetching inscriptions:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET inscription by numero (public - pour vérification)
app.get('/api/inscriptions-formations/numero/:numero', async (req, res) => {
  try {
    const inscription = await supabase.inscriptionsFormations.getByNumero(req.params.numero);
    res.json(inscription);
  } catch (error) {
    console.error('Error fetching inscription:', error);
    res.status(404).json({ error: 'Inscription not found' });
  }
});

// CREATE inscription (public)
app.post('/api/inscriptions-formations', async (req, res) => {
  try {
    const inscription = await supabase.inscriptionsFormations.create(req.body);

    // Marquer fiche comme téléchargeable
    await supabase.inscriptionsFormations.marquerTelecharge(inscription.id);

    // Assurer la présence de la categorie dans la formation liée
    let formationDetails = inscription.formations;
    if (!formationDetails?.categorie && !formationDetails?.category && inscription.formation_id) {
      try {
        formationDetails = await supabase.formations.getById(inscription.formation_id);
      } catch (fetchError) {
        console.warn('Formation fetch fallback failed:', fetchError?.message);
      }
    }

    res.status(201).json({
      ...inscription,
      formations: formationDetails || inscription.formations
    });
  } catch (error) {
    console.error('Error creating inscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// CONFIRM payment (public - avec numéro unique)
app.post('/api/inscriptions-formations/confirmer', async (req, res) => {
  try {
    const { numero_inscription, montant } = req.body;
    
    if (!numero_inscription) {
      return res.status(400).json({ error: 'Numéro d\'inscription requis' });
    }
    
    const inscription = await supabase.inscriptionsFormations.confirmerPaiement(
      numero_inscription,
      montant
    );
    
    res.json({
      success: true,
      message: 'Paiement confirmé avec succès!',
      inscription
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE inscription (admin only)
app.put('/api/inscriptions-formations/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const inscription = await supabase.inscriptionsFormations.update(req.params.id, req.body);
    res.json(inscription);
  } catch (error) {
    console.error('Error updating inscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE inscription (admin only)
app.delete('/api/inscriptions-formations/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await supabase.inscriptionsFormations.delete(req.params.id);
    res.json({ success: true, message: 'Inscription deleted' });
  } catch (error) {
    console.error('Error deleting inscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= 404 HANDLER =============

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============= SERVER START =============

app.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
  
  // Initialize PostgreSQL connection (DÉSACTIVÉ - On utilise Supabase)
  /* try {
    await db.initializeDatabase();
    console.log(`✅ Connected to PostgreSQL`);
    console.log(`📊 Database tables initialized successfully`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
  } catch (error) {
    console.error('❌ PostgreSQL initialization failed:', error.message);
    console.log('📊 Falling back to JSON (data.json)');
  } */
  
  console.log(`🟢 Serveur prêt avec authentification Supabase`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  
  // 🔄 Démarrer la sauvegarde périodique GitHub (DÉSACTIVÉ - Supabase uniquement)
  // gitBackupService.startPeriodicBackup();
});

export default app;
