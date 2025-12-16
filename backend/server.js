import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to data.json
const DATA_FILE = path.join(__dirname, 'data.json');

// Helper function to read data
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data.json:', error);
    return {
      users: [],
      services: [],
      contacts: [],
      team: [],
      solutions: [],
      settings: {},
      testimonials: [],
      jobs: [],
      news: [],
      applications: []
    };
  }
}

// Helper function to write data
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing data.json:', error);
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
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 86400
}));

app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============= HEALTH ROUTES =============

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Backend is responding correctly',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL'
  });
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

// ============= TEAM ROUTES =============

app.get('/api/team', (req, res) => {
  try {
    const data = readData();
    res.json(data.team || []);
  } catch (error) {
    console.error('Erreur récupération équipe:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/team', upload.single('image'), (req, res) => {
  try {
    console.log('➕ POST /api/team');
    
    let imageUrl = null;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.image && req.body.image.startsWith('data:')) {
      if (req.body.image.length > 250 * 1024) {
        return res.status(400).json({ error: `Image trop volumineuse (${Math.round(req.body.image.length / 1024)}KB, max 250KB). Compressez l'image.` });
      }
      imageUrl = req.body.image;
    }

    let specialties = [];
    if (req.body.specialties) {
      if (typeof req.body.specialties === 'string') {
        try {
          specialties = JSON.parse(req.body.specialties);
        } catch (e) {
          specialties = [req.body.specialties];
        }
      } else if (Array.isArray(req.body.specialties)) {
        specialties = req.body.specialties;
      }
    }

    let certifications = [];
    if (req.body.certifications) {
      if (typeof req.body.certifications === 'string') {
        try {
          certifications = JSON.parse(req.body.certifications);
        } catch (e) {
          certifications = [req.body.certifications];
        }
      } else if (Array.isArray(req.body.certifications)) {
        certifications = req.body.certifications;
      }
    }

    const data = readData();
    const newId = Math.max(0, ...data.team.map(t => t.id)) + 1;

    const member = {
      id: newId,
      name: req.body.name,
      title: req.body.title,
      bio: req.body.bio,
      image: imageUrl,
      email: req.body.email,
      phone: req.body.phone,
      specialties: specialties,
      certifications: certifications,
      linked_in: req.body.linked_in || '',
      is_founder: req.body.is_founder === 'true' || req.body.is_founder === true
    };

    data.team.push(member);
    writeData(data);

    res.status(201).json(member);
  } catch (error) {
    console.error('Erreur création équipe:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/team/:id', upload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const memberIndex = data.team.findIndex(t => t.id == id);

    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    let imageUrl = data.team[memberIndex].image;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.image && req.body.image.startsWith('data:')) {
      if (req.body.image.length > 1024 * 1024) { // 1MB limit
        console.warn('⚠️ Image too large:', req.body.image.length, 'bytes');
        // Don't fail, just skip the image update
        imageUrl = data.team[memberIndex].image;
      } else {
        imageUrl = req.body.image;
      }
    }

    let specialties = data.team[memberIndex].specialties || [];
    if (req.body.specialties) {
      if (typeof req.body.specialties === 'string') {
        try {
          specialties = JSON.parse(req.body.specialties);
        } catch (e) {
          specialties = [req.body.specialties];
        }
      } else if (Array.isArray(req.body.specialties)) {
        specialties = req.body.specialties;
      }
    }

    let certifications = data.team[memberIndex].certifications || [];
    if (req.body.certifications) {
      if (typeof req.body.certifications === 'string') {
        try {
          certifications = JSON.parse(req.body.certifications);
        } catch (e) {
          certifications = [req.body.certifications];
        }
      } else if (Array.isArray(req.body.certifications)) {
        certifications = req.body.certifications;
      }
    }

    data.team[memberIndex] = {
      ...data.team[memberIndex],
      name: req.body.name || data.team[memberIndex].name,
      title: req.body.title || data.team[memberIndex].title,
      bio: req.body.bio !== undefined ? req.body.bio : data.team[memberIndex].bio,
      image: imageUrl,
      email: req.body.email || data.team[memberIndex].email,
      phone: req.body.phone || data.team[memberIndex].phone,
      specialties: specialties,
      certifications: certifications,
      linked_in: req.body.linked_in !== undefined ? req.body.linked_in : data.team[memberIndex].linked_in,
      is_founder: req.body.is_founder !== undefined ? (req.body.is_founder === 'true' || req.body.is_founder === true) : data.team[memberIndex].is_founder
    };

    writeData(data);
    res.json(data.team[memberIndex]);
  } catch (error) {
    console.error('Erreur mise à jour équipe:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/team/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const memberIndex = data.team.findIndex(t => t.id == id);

    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    const deleted = data.team.splice(memberIndex, 1);
    writeData(data);
    res.json(deleted[0]);
  } catch (error) {
    console.error('Erreur suppression équipe:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= TESTIMONIALS ROUTES =============

app.get('/api/testimonials', (req, res) => {
  try {
    const data = readData();
    res.json(data.testimonials || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/testimonials', upload.single('image'), (req, res) => {
  try {
    const data = readData();
    const newId = Math.max(0, ...data.testimonials.map(t => t.id)) + 1;

    let imageUrl = null;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const testimonial = {
      id: newId,
      name: req.body.name,
      title: req.body.title,
      company: req.body.company,
      testimonial: req.body.testimonial,
      rating: parseInt(req.body.rating) || 5,
      image: imageUrl,
      createdAt: new Date().toISOString()
    };

    data.testimonials.push(testimonial);
    writeData(data);
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/testimonials/:id', upload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const index = data.testimonials.findIndex(t => t.id == id);

    if (index === -1) return res.status(404).json({ error: 'Non trouvé' });

    let imageUrl = data.testimonials[index].image;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.image && req.body.image.startsWith('data:')) {
      imageUrl = req.body.image;
    }

    data.testimonials[index] = {
      ...data.testimonials[index],
      name: req.body.name || data.testimonials[index].name,
      title: req.body.title !== undefined ? req.body.title : data.testimonials[index].title,
      company: req.body.company !== undefined ? req.body.company : data.testimonials[index].company,
      testimonial: req.body.testimonial !== undefined ? req.body.testimonial : data.testimonials[index].testimonial,
      rating: req.body.rating !== undefined ? parseInt(req.body.rating) : data.testimonials[index].rating,
      image: imageUrl
    };

    writeData(data);
    res.json(data.testimonials[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/testimonials/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const index = data.testimonials.findIndex(t => t.id == id);
    if (index === -1) return res.status(404).json({ error: 'Non trouvé' });

    const deleted = data.testimonials.splice(index, 1);
    writeData(data);
    res.json(deleted[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= NEWS ROUTES =============

app.get('/api/news', (req, res) => {
  try {
    const data = readData();
    res.json(data.news || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/news', upload.single('image'), (req, res) => {
  try {
    const data = readData();
    const newId = Math.max(0, ...data.news.map(n => n.id)) + 1;

    let imageUrl = null;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const news = {
      id: newId,
      title: req.body.title,
      description: req.body.description,
      content: req.body.content || '',
      category: req.body.category || 'Actualités',
      image: imageUrl,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    data.news.push(news);
    writeData(data);
    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/news/:id', upload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const index = data.news.findIndex(n => n.id == id);
    if (index === -1) return res.status(404).json({ error: 'Non trouvé' });

    let imageUrl = data.news[index].image;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.image && req.body.image.startsWith('data:')) {
      imageUrl = req.body.image;
    }

    data.news[index] = {
      ...data.news[index],
      title: req.body.title || data.news[index].title,
      description: req.body.description !== undefined ? req.body.description : data.news[index].description,
      content: req.body.content !== undefined ? req.body.content : data.news[index].content,
      category: req.body.category !== undefined ? req.body.category : data.news[index].category,
      image: imageUrl
    };

    writeData(data);
    res.json(data.news[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/news/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const index = data.news.findIndex(n => n.id == id);
    if (index === -1) return res.status(404).json({ error: 'Non trouvé' });

    const deleted = data.news.splice(index, 1);
    writeData(data);
    res.json(deleted[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= SOLUTIONS ROUTES =============

app.get('/api/solutions', (req, res) => {
  try {
    const data = readData();
    res.json(data.solutions || []);
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
    writeData(data);
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

    writeData(data);
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
    writeData(data);
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
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/jobs', (req, res) => {
  try {
    const data = readData();
    const newId = Math.max(0, ...data.jobs.map(j => j.id)) + 1;

    const job = {
      id: newId,
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      type: req.body.type,
      department: req.body.department || '',
      requirements: req.body.requirements || '',
      salaryRange: req.body.salaryRange || '',
      createdAt: new Date().toISOString()
    };

    data.jobs.push(job);
    writeData(data);
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/jobs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const index = data.jobs.findIndex(j => j.id == id);
    if (index === -1) return res.status(404).json({ error: 'Non trouvé' });

    data.jobs[index] = {
      ...data.jobs[index],
      title: req.body.title || data.jobs[index].title,
      description: req.body.description !== undefined ? req.body.description : data.jobs[index].description,
      location: req.body.location !== undefined ? req.body.location : data.jobs[index].location,
      type: req.body.type !== undefined ? req.body.type : data.jobs[index].type,
      department: req.body.department !== undefined ? req.body.department : data.jobs[index].department,
      requirements: req.body.requirements !== undefined ? req.body.requirements : data.jobs[index].requirements,
      salaryRange: req.body.salaryRange !== undefined ? req.body.salaryRange : data.jobs[index].salaryRange
    };

    writeData(data);
    res.json(data.jobs[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/jobs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const index = data.jobs.findIndex(j => j.id == id);
    if (index === -1) return res.status(404).json({ error: 'Non trouvé' });

    const deleted = data.jobs.splice(index, 1);
    writeData(data);
    res.json(deleted[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= APPLICATIONS ROUTES =============

app.get('/api/applications', (req, res) => {
  try {
    const data = readData();
    res.json(data.applications || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/applications', (req, res) => {
  try {
    const data = readData();
    const newId = Math.max(0, ...data.applications.map(a => a.id)) + 1;

    const application = {
      id: newId,
      jobId: req.body.jobId,
      jobTitle: req.body.jobTitle,
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      linkedin: req.body.linkedin || '',
      coverLetter: req.body.coverLetter || '',
      resume: req.body.resume || '',
      status: 'En cours',
      appliedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.applications.push(application);
    writeData(data);
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/applications/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const index = data.applications.findIndex(a => a.id == id);
    if (index === -1) return res.status(404).json({ error: 'Non trouvé' });

    data.applications[index] = {
      ...data.applications[index],
      status: req.body.status || data.applications[index].status,
      updatedAt: new Date().toISOString()
    };

    writeData(data);
    res.json(data.applications[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/applications/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const index = data.applications.findIndex(a => a.id == id);
    if (index === -1) return res.status(404).json({ error: 'Non trouvé' });

    const deleted = data.applications.splice(index, 1);
    writeData(data);
    res.json(deleted[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= CONTACTS ROUTES =============

app.get('/api/contacts', (req, res) => {
  try {
    const data = readData();
    res.json(data.contacts || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contacts', (req, res) => {
  try {
    const data = readData();
    const newId = Math.max(0, ...data.contacts.map(c => c.id)) + 1;

    const contact = {
      id: newId,
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      subject: req.body.subject,
      message: req.body.message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    data.contacts.push(contact);
    writeData(data);
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/contacts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const index = data.contacts.findIndex(c => c.id == id);
    if (index === -1) return res.status(404).json({ error: 'Non trouvé' });

    data.contacts[index] = {
      ...data.contacts[index],
      status: req.body.status || data.contacts[index].status,
      replyMessage: req.body.replyMessage || data.contacts[index].replyMessage,
      replyDate: new Date().toISOString(),
      replyMethod: req.body.replyMethod || data.contacts[index].replyMethod
    };

    writeData(data);
    res.json(data.contacts[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/contacts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const index = data.contacts.findIndex(c => c.id == id);
    if (index === -1) return res.status(404).json({ error: 'Non trouvé' });

    const deleted = data.contacts.splice(index, 1);
    writeData(data);
    res.json(deleted[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= SETTINGS ROUTES =============

app.get('/api/settings', (req, res) => {
  try {
    const data = readData();
    res.json(data.settings || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    const data = readData();

    data.settings = {
      ...data.settings,
      siteTitle: req.body.siteTitle || data.settings.siteTitle,
      slogan: req.body.slogan !== undefined ? req.body.slogan : data.settings.slogan,
      tagline: req.body.tagline !== undefined ? req.body.tagline : data.settings.tagline,
      email: req.body.email !== undefined ? req.body.email : data.settings.email,
      phone: req.body.phone !== undefined ? req.body.phone : data.settings.phone,
      address: req.body.address !== undefined ? req.body.address : data.settings.address,
      socialMedia: req.body.socialMedia || data.settings.socialMedia,
      businessHours: req.body.businessHours || data.settings.businessHours,
      primaryColor: req.body.primaryColor !== undefined ? req.body.primaryColor : data.settings.primaryColor,
      description: req.body.description !== undefined ? req.body.description : data.settings.description,
      updatedAt: new Date().toISOString()
    };

    writeData(data);
    res.json(data.settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= SERVICES ROUTES =============

app.get('/api/services', (req, res) => {
  try {
    const data = readData();
    res.json(data.services || []);
  } catch (error) {
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
    writeData(data);
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

    writeData(data);
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
    writeData(data);
    res.json(deleted[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= LOGS ROUTES =============

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

// ============= 404 HANDLER =============

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============= SERVER START =============

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Database: JSON (data.json)`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

export default app;
