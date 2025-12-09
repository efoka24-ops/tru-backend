import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration EmailJS (gratuit, pas de Nodemailer)
console.log('📧 EmailJS configuré - Prêt pour envoyer des emails via https://emailjs.com');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, 'data.json');
const uploadsDir = path.join(__dirname, 'uploads');

// Créer le dossier uploads s'il n'existe pas
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Utility functions
function readData() {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    const parsed = JSON.parse(data);
    
    // Initialiser les sections manquantes
    if (!parsed.team) parsed.team = [];
    if (!parsed.services) parsed.services = [];
    if (!parsed.solutions) parsed.solutions = [];
    if (!parsed.contacts) parsed.contacts = [];
    if (!parsed.testimonials) parsed.testimonials = [];
    if (!parsed.settings) {
      parsed.settings = {
        id: 1,
        siteTitle: 'Site TRU',
        slogan: 'Transforming Reality Universally',
        tagline: 'Innovation & Solutions',
        email: 'contact@sitetru.com',
        phone: '+33 (0)1 00 00 00 00',
        address: '123 Rue de Paris, 75000 Paris',
        socialMedia: { facebook: '', twitter: '', linkedin: '', instagram: '' },
        businessHours: {
          monday: '09:00 - 18:00',
          tuesday: '09:00 - 18:00',
          wednesday: '09:00 - 18:00',
          thursday: '09:00 - 18:00',
          friday: '09:00 - 18:00',
          saturday: 'Fermé',
          sunday: 'Fermé'
        },
        primaryColor: '#10b981'
      };
    }
    
    return parsed;
  } catch (err) {
    console.error('Erreur lecture data.json:', err);
    return { 
      users: [], 
      services: [], 
      solutions: [],
      contacts: [],
      testimonials: [],
      content: [], 
      team: [],
      settings: {
        id: 1,
        siteTitle: 'Site TRU',
        slogan: 'Transforming Reality Universally',
        tagline: 'Innovation & Solutions',
        email: 'contact@sitetru.com',
        phone: '+33 (0)1 00 00 00 00',
        address: '123 Rue de Paris, 75000 Paris',
        socialMedia: { facebook: '', twitter: '', linkedin: '', instagram: '' },
        businessHours: {
          monday: '09:00 - 18:00',
          tuesday: '09:00 - 18:00',
          wednesday: '09:00 - 18:00',
          thursday: '09:00 - 18:00',
          friday: '09:00 - 18:00',
          saturday: 'Fermé',
          sunday: 'Fermé'
        },
        primaryColor: '#10b981'
      }
    };
  }
}

function writeData(data) {
  try {
    // Assurer que les sections existent
    if (!data.team) data.team = [];
    if (!data.services) data.services = [];
    if (!data.solutions) data.solutions = [];
    if (!data.contacts) data.contacts = [];
    if (!data.testimonials) data.testimonials = [];
    if (!data.settings) {
      data.settings = {
        id: 1,
        siteTitle: 'Site TRU',
        slogan: 'Transforming Reality Universally',
        tagline: 'Innovation & Solutions',
        email: 'contact@sitetru.com',
        phone: '+33 (0)1 00 00 00 00',
        address: '123 Rue de Paris, 75000 Paris',
        socialMedia: { facebook: '', twitter: '', linkedin: '', instagram: '' },
        businessHours: {
          monday: '09:00 - 18:00',
          tuesday: '09:00 - 18:00',
          wednesday: '09:00 - 18:00',
          thursday: '09:00 - 18:00',
          friday: '09:00 - 18:00',
          saturday: 'Fermé',
          sunday: 'Fermé'
        },
        primaryColor: '#10b981'
      };
    }
    
    console.log('📝 Écriture data.json avec:', { team: data.team.length, services: data.services.length, solutions: data.solutions.length, contacts: data.contacts.length, testimonials: data.testimonials.length });
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log('✅ Données écrites avec succès');
    return true;
  } catch (err) {
    console.error('❌ Erreur écriture data.json:', err);
    return false;
  }
}

// Routes Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Upload Image Route - Returns base64 encoded data URL for Vercel
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }
    
    // Convert buffer to base64 data URL
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

// Services Routes
app.get('/api/services', (req, res) => {
  const data = readData();
  res.json(data.services);
});

app.post('/api/services', (req, res) => {
  try {
    const data = readData();
    if (!data.services) data.services = [];
    
    const ids = data.services.map(s => s.id || 0);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    
    const newService = {
      id: maxId + 1,
      ...req.body
    };
    data.services.push(newService);
    
    if (writeData(data)) {
      res.status(201).json(newService);
    } else {
      res.status(500).json({ error: 'Erreur écriture fichier' });
    }
  } catch (error) {
    console.error('Erreur création service:', error);
    res.status(500).json({ error: error.message || 'Erreur création service' });
  }
});

app.put('/api/services/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.services) data.services = [];
    
    const id = parseInt(req.params.id);
    const index = data.services.findIndex(s => s.id === id);
    
    if (index !== -1) {
      data.services[index] = { ...data.services[index], ...req.body, id };
      
      if (writeData(data)) {
        res.json(data.services[index]);
      } else {
        res.status(500).json({ error: 'Erreur écriture fichier' });
      }
    } else {
      res.status(404).json({ error: 'Service non trouvé' });
    }
  } catch (error) {
    console.error('Erreur modification service:', error);
    res.status(500).json({ error: error.message || 'Erreur modification service' });
  }
});

app.delete('/api/services/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.services) data.services = [];
    
    const id = parseInt(req.params.id);
    const index = data.services.findIndex(s => s.id === id);
    
    if (index !== -1) {
      const deleted = data.services.splice(index, 1);
      
      if (writeData(data)) {
        res.json(deleted[0]);
      } else {
        res.status(500).json({ error: 'Erreur écriture fichier' });
      }
    } else {
      res.status(404).json({ error: 'Service non trouvé' });
    }
  } catch (error) {
    console.error('Erreur suppression service:', error);
    res.status(500).json({ error: error.message || 'Erreur suppression service' });
  }
});

// Content Routes
app.get('/api/content', (req, res) => {
  const data = readData();
  res.json(data.content);
});

app.post('/api/content', (req, res) => {
  try {
    const data = readData();
    if (!data.content) data.content = [];
    
    const ids = data.content.map(c => c.id || 0);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    
    const newContent = {
      id: maxId + 1,
      ...req.body
    };
    data.content.push(newContent);
    
    if (writeData(data)) {
      res.status(201).json(newContent);
    } else {
      res.status(500).json({ error: 'Erreur écriture fichier' });
    }
  } catch (error) {
    console.error('Erreur création contenu:', error);
    res.status(500).json({ error: error.message || 'Erreur création contenu' });
  }
});

app.put('/api/content/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.content) data.content = [];
    
    const id = parseInt(req.params.id);
    const index = data.content.findIndex(c => c.id === id);
    
    if (index !== -1) {
      data.content[index] = { ...data.content[index], ...req.body, id };
      
      if (writeData(data)) {
        res.json(data.content[index]);
      } else {
        res.status(500).json({ error: 'Erreur écriture fichier' });
      }
    } else {
      res.status(404).json({ error: 'Contenu non trouvé' });
    }
  } catch (error) {
    console.error('Erreur modification contenu:', error);
    res.status(500).json({ error: error.message || 'Erreur modification contenu' });
  }
});

app.delete('/api/content/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.content) data.content = [];
    
    const id = parseInt(req.params.id);
    const index = data.content.findIndex(c => c.id === id);
    
    if (index !== -1) {
      const deleted = data.content.splice(index, 1);
      
      if (writeData(data)) {
        res.json(deleted[0]);
      } else {
        res.status(500).json({ error: 'Erreur écriture fichier' });
      }
    } else {
      res.status(404).json({ error: 'Contenu non trouvé' });
    }
  } catch (error) {
    console.error('Erreur suppression contenu:', error);
    res.status(500).json({ error: error.message || 'Erreur suppression contenu' });
  }
});

// Team Routes
app.get('/api/team', (req, res) => {
  const data = readData();
  res.json(data.team);
});

app.post('/api/team', (req, res) => {
  try {
    const data = readData();
    if (!data.team) data.team = [];
    
    const ids = data.team.map(t => t.id || 0);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    
    const newMember = {
      id: maxId + 1,
      ...req.body
    };
    
    data.team.push(newMember);
    
    if (writeData(data)) {
      res.status(201).json(newMember);
    } else {
      res.status(500).json({ error: 'Erreur écriture fichier' });
    }
  } catch (error) {
    console.error('Erreur création membre:', error);
    res.status(500).json({ error: error.message || 'Erreur création membre' });
  }
});

app.put('/api/team/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.team) data.team = [];
    
    const id = parseInt(req.params.id);
    const index = data.team.findIndex(t => t.id === id);
    
    if (index !== -1) {
      data.team[index] = { ...data.team[index], ...req.body, id };
      
      if (writeData(data)) {
        res.json(data.team[index]);
      } else {
        res.status(500).json({ error: 'Erreur écriture fichier' });
      }
    } else {
      res.status(404).json({ error: 'Membre non trouvé' });
    }
  } catch (error) {
    console.error('Erreur modification membre:', error);
    res.status(500).json({ error: error.message || 'Erreur modification membre' });
  }
});

app.delete('/api/team/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.team) data.team = [];
    
    const id = parseInt(req.params.id);
    const index = data.team.findIndex(t => t.id === id);
    
    if (index !== -1) {
      const deleted = data.team.splice(index, 1);
      
      if (writeData(data)) {
        res.json(deleted[0]);
      } else {
        res.status(500).json({ error: 'Erreur écriture fichier' });
      }
    } else {
      res.status(404).json({ error: 'Membre non trouvé' });
    }
  } catch (error) {
    console.error('Erreur suppression membre:', error);
    res.status(500).json({ error: error.message || 'Erreur suppression membre' });
  }
});

// SOLUTIONS ROUTES
app.get('/api/solutions', (req, res) => {
  try {
    const data = readData();
    if (!data.solutions) data.solutions = [];
    res.json(data.solutions);
  } catch (error) {
    console.error('Erreur récupération solutions:', error);
    res.status(500).json({ error: error.message || 'Erreur récupération solutions' });
  }
});

app.post('/api/solutions', (req, res) => {
  try {
    const data = readData();
    if (!data.solutions) data.solutions = [];
    
    const ids = data.solutions.map(s => s.id || 0);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const newId = maxId + 1;
    
    const newSolution = {
      id: newId,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    data.solutions.push(newSolution);
    
    if (writeData(data)) {
      res.status(201).json(newSolution);
    } else {
      res.status(500).json({ error: 'Erreur écriture fichier' });
    }
  } catch (error) {
    console.error('Erreur création solution:', error);
    res.status(500).json({ error: error.message || 'Erreur création solution' });
  }
});

app.put('/api/solutions/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.solutions) data.solutions = [];
    
    const id = parseInt(req.params.id);
    const index = data.solutions.findIndex(s => s.id === id);
    
    if (index !== -1) {
      data.solutions[index] = { ...data.solutions[index], ...req.body, id };
      
      if (writeData(data)) {
        res.json(data.solutions[index]);
      } else {
        res.status(500).json({ error: 'Erreur écriture fichier' });
      }
    } else {
      res.status(404).json({ error: 'Solution non trouvée' });
    }
  } catch (error) {
    console.error('Erreur modification solution:', error);
    res.status(500).json({ error: error.message || 'Erreur modification solution' });
  }
});

app.delete('/api/solutions/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.solutions) data.solutions = [];
    
    const id = parseInt(req.params.id);
    const index = data.solutions.findIndex(s => s.id === id);
    
    if (index !== -1) {
      const deleted = data.solutions.splice(index, 1);
      
      if (writeData(data)) {
        res.json(deleted[0]);
      } else {
        res.status(500).json({ error: 'Erreur écriture fichier' });
      }
    } else {
      res.status(404).json({ error: 'Solution non trouvée' });
    }
  } catch (error) {
    console.error('Erreur suppression solution:', error);
    res.status(500).json({ error: error.message || 'Erreur suppression solution' });
  }
});

// SETTINGS ROUTES
app.get('/api/settings', (req, res) => {
  try {
    const data = readData();
    if (!data.settings) {
      data.settings = {
        id: 1,
        siteTitle: 'TRU GROUP',
        slogan: 'Transforming Reality Universally',
        tagline: 'Cabinet de conseil en digitalisation',
        description: 'TRU GROUP est un cabinet de conseil en digitalisation basé en Afrique',
        email: 'contact@trugroup.cm',
        phone: '+237 6 XX XX XX XX',
        address: 'Douala, Cameroun',
        socialMedia: { 
          facebook: 'https://facebook.com/trugroup', 
          twitter: 'https://twitter.com/trugroup', 
          linkedin: 'https://linkedin.com/company/trugroup', 
          instagram: 'https://instagram.com/trugroup',
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
        maintenanceMessage: 'Site en maintenance. Nous revenons bientôt!'
      };
    }
    res.json(data.settings);
  } catch (error) {
    console.error('Erreur récupération settings:', error);
    res.status(500).json({ error: error.message || 'Erreur récupération settings' });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    const data = readData();
    data.settings = { 
      id: 1, 
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    if (writeData(data)) {
      console.log('✅ Paramètres sauvegardés:', data.settings.siteTitle);
      res.json(data.settings);
    } else {
      res.status(500).json({ error: 'Erreur écriture fichier' });
    }
  } catch (error) {
    console.error('Erreur sauvegarde settings:', error);
    res.status(500).json({ error: error.message || 'Erreur sauvegarde settings' });
  }
});

// CONTACTS ROUTES (pour formulaire contact et testimonials)
app.get('/api/contacts', (req, res) => {
  try {
    const data = readData();
    if (!data.contacts) data.contacts = [];
    res.json(data.contacts);
  } catch (error) {
    console.error('Erreur récupération contacts:', error);
    res.status(500).json({ error: error.message || 'Erreur récupération contacts' });
  }
});

app.post('/api/contacts', (req, res) => {
  try {
    const data = readData();
    if (!data.contacts) data.contacts = [];
    
    const ids = data.contacts.map(c => c.id || 0);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const newId = maxId + 1;
    
    const newContact = {
      id: newId,
      ...req.body,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    data.contacts.push(newContact);
    
    if (writeData(data)) {
      res.status(201).json(newContact);
    } else {
      res.status(500).json({ error: 'Erreur écriture fichier' });
    }
  } catch (error) {
    console.error('Erreur création contact:', error);
    res.status(500).json({ error: error.message || 'Erreur création contact' });
  }
});

app.put('/api/contacts/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.contacts) data.contacts = [];
    
    const id = parseInt(req.params.id);
    const index = data.contacts.findIndex(c => c.id === id);
    
    if (index !== -1) {
      data.contacts[index] = { ...data.contacts[index], ...req.body, id };
      
      if (writeData(data)) {
        res.json(data.contacts[index]);
      } else {
        res.status(500).json({ error: 'Erreur écriture fichier' });
      }
    } else {
      res.status(404).json({ error: 'Contact non trouvé' });
    }
  } catch (error) {
    console.error('Erreur modification contact:', error);
    res.status(500).json({ error: error.message || 'Erreur modification contact' });
  }
});

app.delete('/api/contacts/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.contacts) data.contacts = [];
    
    const id = parseInt(req.params.id);
    const index = data.contacts.findIndex(c => c.id === id);
    
    if (index !== -1) {
      const deleted = data.contacts.splice(index, 1);
      
      if (writeData(data)) {
        res.json(deleted[0]);
      } else {
        res.status(500).json({ error: 'Erreur écriture fichier' });
      }
    } else {
      res.status(404).json({ error: 'Contact non trouvé' });
    }
  } catch (error) {
    console.error('Erreur suppression contact:', error);
    res.status(500).json({ error: error.message || 'Erreur suppression contact' });
  }
});

// CONTACT REPLY ROUTE
app.post('/api/contacts/reply', async (req, res) => {
  try {
    const { contactId, method, message } = req.body;
    
    if (!contactId || !method || !message) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    const data = readData();
    const contact = data.contacts?.find(c => c.id === parseInt(contactId));
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact non trouvé' });
    }

    // Mettre à jour le statut du contact
    const contactIndex = data.contacts.findIndex(c => c.id === parseInt(contactId));
    if (contactIndex !== -1) {
      data.contacts[contactIndex].status = 'replied';
      data.contacts[contactIndex].replyDate = new Date().toISOString();
      data.contacts[contactIndex].replyMethod = method;
      data.contacts[contactIndex].replyMessage = message;
      writeData(data);
    }

    // Envoyer par email via EmailJS
    if (method === 'email') {
      try {
        console.log('📧 Tentative d\'envoi email via EmailJS...');
        console.log('Service ID:', process.env.EMAILJS_SERVICE_ID);
        console.log('Public Key:', process.env.EMAILJS_PUBLIC_KEY);
        console.log('Template ID:', process.env.EMAILJS_TEMPLATE_ID);
        console.log('To Email:', contact.email);

        // Envoyer un email au client
        const response1 = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
          service_id: process.env.EMAILJS_SERVICE_ID,
          template_id: process.env.EMAILJS_TEMPLATE_ID,
          user_id: process.env.EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: contact.email,
            to_name: contact.fullName,
            subject: `Réponse à votre demande: ${contact.subject}`,
            message: message,
            from_name: 'TRU GROUP'
          }
        });

        console.log(`✅ Email client envoyé:`, response1.status, response1.data);

        // Envoyer une notification à l'admin
        const response2 = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
          service_id: process.env.EMAILJS_SERVICE_ID,
          template_id: process.env.EMAILJS_TEMPLATE_ID,
          user_id: process.env.EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: process.env.ADMIN_EMAIL,
            to_name: 'Admin TRU GROUP',
            subject: `Réponse envoyée à ${contact.fullName}`,
            message: `Vous avez envoyé une réponse à ${contact.fullName} (${contact.email})\n\nRéponse:\n${message}`,
            from_name: 'TRU GROUP Notification'
          }
        });

        console.log(`✅ Email admin envoyé:`, response2.status, response2.data);
        
        res.json({ 
          success: true, 
          message: `Email envoyé à ${contact.email}`,
          method: 'email'
        });
      } catch (emailError) {
        console.error(`❌ Erreur envoi email:`, emailError.message);
        console.error('Response data:', emailError.response?.data);
        console.error('Status:', emailError.response?.status);
        res.status(500).json({ 
          error: 'Erreur lors de l\'envoi de l\'email',
          details: emailError.message,
          response: emailError.response?.data
        });
      }

    } else if (method === 'sms') {
      console.log(`💬 SMS envoyé à ${contact.phone}`);
      console.log(`Message: ${message}`);
      
      res.json({ 
        success: true, 
        message: `SMS enregistré pour ${contact.phone}`,
        method: 'sms',
        note: 'SMS non configuré - Veuillez configurer Twilio pour activer cette fonction'
      });
    } else {
      res.status(400).json({ error: 'Méthode de contact invalide' });
    }
  } catch (error) {
    console.error('❌ Erreur envoi réponse:', error);
    res.status(500).json({ error: error.message || 'Erreur envoi réponse' });
  }
});

// TESTIMONIALS ROUTES
app.get('/api/testimonials', (req, res) => {
  try {
    const data = readData();
    if (!data.testimonials) data.testimonials = [];
    res.json(data.testimonials);
  } catch (error) {
    console.error('Erreur récupération testimonials:', error);
    res.status(500).json({ error: error.message || 'Erreur récupération testimonials' });
  }
});

app.post('/api/testimonials', upload.single('image'), (req, res) => {
  try {
    const data = readData();
    if (!data.testimonials) data.testimonials = [];
    
    const ids = data.testimonials.map(t => t.id || 0);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const newId = maxId + 1;
    
    // Accepter l'image soit du FormData (req.file) soit du JSON (req.body.image)
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      imageUrl = req.body.image; // C'est déjà le chemin complet depuis l'upload précédent
    }
    
    const newTestimonial = {
      id: newId,
      name: req.body.name,
      title: req.body.title,
      company: req.body.company,
      testimonial: req.body.testimonial,
      rating: parseInt(req.body.rating) || 5,
      image: imageUrl,
      createdAt: new Date().toISOString()
    };
    
    console.log('📝 Création testimonial:', { id: newId, name: req.body.name, hasImage: !!imageUrl });
    
    data.testimonials.push(newTestimonial);
    
    if (writeData(data)) {
      res.status(201).json(newTestimonial);
    } else {
      res.status(500).json({ error: 'Erreur écriture fichier' });
    }
  } catch (error) {
    console.error('Erreur création testimonial:', error);
    res.status(500).json({ error: error.message || 'Erreur création testimonial' });
  }
});

app.put('/api/testimonials/:id', upload.single('image'), (req, res) => {
  try {
    const data = readData();
    if (!data.testimonials) data.testimonials = [];
    
    const id = parseInt(req.params.id);
    const index = data.testimonials.findIndex(t => t.id === id);
    
    if (index !== -1) {
      const oldTestimonial = data.testimonials[index];
      
      // Déterminer l'image: fichier nouvellement uploadé, chemin du JSON, ou ancienne image
      let imageUrl = oldTestimonial.image;
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      } else if (req.body.image && req.body.image !== oldTestimonial.image) {
        imageUrl = req.body.image;
      }
      
      const updatedTestimonial = {
        ...oldTestimonial,
        name: req.body.name || oldTestimonial.name,
        title: req.body.title || oldTestimonial.title,
        company: req.body.company || oldTestimonial.company,
        testimonial: req.body.testimonial || oldTestimonial.testimonial,
        rating: req.body.rating ? parseInt(req.body.rating) : oldTestimonial.rating,
        image: imageUrl,
        id
      };
      
      console.log('📝 Modification testimonial:', { id, hasImage: !!imageUrl });
      
      data.testimonials[index] = updatedTestimonial;
      
      if (writeData(data)) {
        res.json(updatedTestimonial);
      } else {
        res.status(500).json({ error: 'Erreur écriture fichier' });
      }
    } else {
      res.status(404).json({ error: 'Testimonial non trouvé' });
    }
  } catch (error) {
    console.error('Erreur modification testimonial:', error);
    res.status(500).json({ error: error.message || 'Erreur modification testimonial' });
  }
});

app.delete('/api/testimonials/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.testimonials) data.testimonials = [];
    
    const id = parseInt(req.params.id);
    const index = data.testimonials.findIndex(t => t.id === id);
    
    if (index !== -1) {
      const deleted = data.testimonials.splice(index, 1);
      
      if (writeData(data)) {
        res.json(deleted[0]);
      } else {
        res.status(500).json({ error: 'Erreur écriture fichier' });
      }
    } else {
      res.status(404).json({ error: 'Testimonial non trouvé' });
    }
  } catch (error) {
    console.error('Erreur suppression testimonial:', error);
    res.status(500).json({ error: error.message || 'Erreur suppression testimonial' });
  }
});

// News Routes
app.get('/api/news', (req, res) => {
  const data = readData();
  if (!data.news) data.news = [];
  res.json(data.news);
});

app.post('/api/news', upload.single('image'), (req, res) => {
  try {
    const data = readData();
    if (!data.news) data.news = [];
    
    const ids = data.news.map(n => n.id || 0);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const newNews = {
      id: maxId + 1,
      title: req.body.title,
      description: req.body.description,
      content: req.body.content || '',
      category: req.body.category || 'Actualités',
      image: imageUrl,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    data.news.push(newNews);
    
    if (writeData(data)) {
      res.status(201).json(newNews);
    } else {
      res.status(500).json({ error: 'Erreur écriture fichier' });
    }
  } catch (error) {
    console.error('Erreur création actualité:', error);
    res.status(500).json({ error: error.message || 'Erreur création actualité' });
  }
});

app.put('/api/news/:id', upload.single('image'), (req, res) => {
  try {
    const data = readData();
    if (!data.news) data.news = [];
    
    const id = parseInt(req.params.id);
    const index = data.news.findIndex(n => n.id === id);
    
    if (index !== -1) {
      const oldNews = data.news[index];
      let imageUrl = oldNews.image;
      
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }
      
      const updatedNews = {
        ...oldNews,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content || oldNews.content,
        category: req.body.category || oldNews.category,
        image: imageUrl,
        updatedAt: new Date().toISOString()
      };
      
      data.news[index] = updatedNews;
      
      if (writeData(data)) {
        res.json(updatedNews);
      } else {
        res.status(500).json({ error: 'Erreur écriture fichier' });
      }
    } else {
      res.status(404).json({ error: 'Actualité non trouvée' });
    }
  } catch (error) {
    console.error('Erreur modification actualité:', error);
    res.status(500).json({ error: error.message || 'Erreur modification actualité' });
  }
});

app.delete('/api/news/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.news) data.news = [];
    
    const id = parseInt(req.params.id);
    const index = data.news.findIndex(n => n.id === id);
    
    if (index !== -1) {
      const deleted = data.news.splice(index, 1);
      
      if (writeData(data)) {
        res.json(deleted[0]);
      } else {
        res.status(500).json({ error: 'Erreur écriture fichier' });
      }
    } else {
      res.status(404).json({ error: 'Actualité non trouvée' });
    }
  } catch (error) {
    console.error('Erreur suppression actualité:', error);
    res.status(500).json({ error: error.message || 'Erreur suppression actualité' });
  }
});

// Jobs Routes
app.get('/api/jobs', (req, res) => {
  const data = readData();
  if (!data.jobs) data.jobs = [];
  res.json(data.jobs);
});

app.post('/api/jobs', (req, res) => {
  try {
    const data = readData();
    if (!data.jobs) data.jobs = [];
    
    const ids = data.jobs.map(j => j.id || 0);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    
    const newJob = {
      id: maxId + 1,
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      type: req.body.type || 'CDI',
      department: req.body.department || '',
      requirements: req.body.requirements || '',
      salaryRange: req.body.salaryRange || '',
      createdAt: new Date().toISOString()
    };
    
    data.jobs.push(newJob);
    
    if (writeData(data)) {
      res.status(201).json(newJob);
    } else {
      res.status(500).json({ error: 'Erreur écriture fichier' });
    }
  } catch (error) {
    console.error('Erreur création offre:', error);
    res.status(500).json({ error: error.message || 'Erreur création offre' });
  }
});

app.put('/api/jobs/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.jobs) data.jobs = [];
    
    const id = parseInt(req.params.id);
    const index = data.jobs.findIndex(j => j.id === id);
    
    if (index !== -1) {
      const oldJob = data.jobs[index];
      const updatedJob = {
        ...oldJob,
        title: req.body.title || oldJob.title,
        description: req.body.description || oldJob.description,
        location: req.body.location || oldJob.location,
        type: req.body.type || oldJob.type,
        department: req.body.department || oldJob.department,
        requirements: req.body.requirements || oldJob.requirements,
        salaryRange: req.body.salaryRange || oldJob.salaryRange,
        updatedAt: new Date().toISOString()
      };
      
      data.jobs[index] = updatedJob;
      
      if (writeData(data)) {
        res.json(updatedJob);
      } else {
        res.status(500).json({ error: 'Erreur écriture fichier' });
      }
    } else {
      res.status(404).json({ error: 'Offre non trouvée' });
    }
  } catch (error) {
    console.error('Erreur modification offre:', error);
    res.status(500).json({ error: error.message || 'Erreur modification offre' });
  }
});

app.delete('/api/jobs/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.jobs) data.jobs = [];
    
    const id = parseInt(req.params.id);
    const index = data.jobs.findIndex(j => j.id === id);
    
    if (index !== -1) {
      const deleted = data.jobs.splice(index, 1);
      
      if (writeData(data)) {
        res.json(deleted[0]);
      } else {
        res.status(500).json({ error: 'Erreur écriture fichier' });
      }
    } else {
      res.status(404).json({ error: 'Offre non trouvée' });
    }
  } catch (error) {
    console.error('Erreur suppression offre:', error);
    res.status(500).json({ error: error.message || 'Erreur suppression offre' });
  }
});

// Applications Routes
app.get('/api/applications', (req, res) => {
  const data = readData();
  if (!data.applications) data.applications = [];
  res.json(data.applications);
});

app.post('/api/applications', upload.single('resume'), (req, res) => {
  try {
    const data = readData();
    if (!data.applications) data.applications = [];
    
    const ids = data.applications.map(a => a.id || 0);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    
    let resumeUrl = '';
    if (req.file) {
      resumeUrl = `/uploads/${req.file.filename}`;
    }
    
    const newApplication = {
      id: maxId + 1,
      jobId: parseInt(req.body.jobId),
      jobTitle: req.body.jobTitle,
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      linkedin: req.body.linkedin || '',
      coverLetter: req.body.coverLetter,
      resume: resumeUrl,
      status: 'Nouveau',
      appliedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    data.applications.push(newApplication);
    
    if (writeData(data)) {
      console.log('📝 Nouvelle candidature:', { 
        id: newApplication.id,
        candidat: newApplication.fullName,
        poste: newApplication.jobTitle,
        email: newApplication.email
      });
      res.status(201).json(newApplication);
    } else {
      res.status(500).json({ error: 'Erreur écriture fichier' });
    }
  } catch (error) {
    console.error('Erreur création candidature:', error);
    res.status(500).json({ error: error.message || 'Erreur création candidature' });
  }
});

app.put('/api/applications/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.applications) data.applications = [];
    
    const id = parseInt(req.params.id);
    const index = data.applications.findIndex(a => a.id === id);
    
    if (index !== -1) {
      const oldApp = data.applications[index];
      const updatedApp = {
        ...oldApp,
        status: req.body.status || oldApp.status,
        notes: req.body.notes || oldApp.notes,
        updatedAt: new Date().toISOString()
      };
      
      data.applications[index] = updatedApp;
      
      if (writeData(data)) {
        res.json(updatedApp);
      } else {
        res.status(500).json({ error: 'Erreur écriture fichier' });
      }
    } else {
      res.status(404).json({ error: 'Candidature non trouvée' });
    }
  } catch (error) {
    console.error('Erreur modification candidature:', error);
    res.status(500).json({ error: error.message || 'Erreur modification candidature' });
  }
});

app.delete('/api/applications/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.applications) data.applications = [];
    
    const id = parseInt(req.params.id);
    const index = data.applications.findIndex(a => a.id === id);
    
    if (index !== -1) {
      const deleted = data.applications.splice(index, 1);
      
      if (writeData(data)) {
        res.json(deleted[0]);
      } else {
        res.status(500).json({ error: 'Erreur écriture fichier' });
      }
    } else {
      res.status(404).json({ error: 'Candidature non trouvée' });
    }
  } catch (error) {
    console.error('Erreur suppression candidature:', error);
    res.status(500).json({ error: error.message || 'Erreur suppression candidature' });
  }
});

// Sync Route
app.post('/api/sync', (req, res) => {
  const data = readData();
  res.json({ 
    status: 'success',
    message: 'Données synchronisées',
    timestamp: new Date().toISOString(),
    data: data
  });
});

app.get('/api/sync/status', (req, res) => {
  const data = readData();
  res.json({
    status: 'online',
    lastSync: new Date().toISOString(),
    dataCount: {
      services: data.services?.length || 0,
      solutions: data.solutions?.length || 0,
      contacts: data.contacts?.length || 0,
      testimonials: data.testimonials?.length || 0,
      team: data.team?.length || 0
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
});
