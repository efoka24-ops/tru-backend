import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import * as db from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize PostgreSQL database on startup
(async () => {
  try {
    await db.initializeDatabase();
    console.log('✅ PostgreSQL database initialized');
  } catch (error) {
    console.warn('⚠️ Warning: Could not initialize PostgreSQL');
    console.warn('Error:', error.message);
  }
})();

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

app.get('/api/team', async (req, res) => {
  try {
    const team = await db.getTeam();
    
    // Optimize response: truncate base64 images if they're too large
    const optimizedTeam = team.map(member => {
      if (member.image && member.image.startsWith('data:') && member.image.length > 100 * 1024) {
        // Image is larger than 100KB, return placeholder or small thumbnail
        console.warn(`⚠️ Large image detected for ${member.name} (${Math.round(member.image.length / 1024)}KB)`);
        // Keep image but log the issue
        return member;
      }
      return member;
    });
    
    res.json(optimizedTeam);
  } catch (error) {
    console.error('Erreur récupération équipe:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/team', upload.single('image'), async (req, res) => {
  try {
    console.log('➕ POST /api/team');
    console.log('📤 Body received size:', JSON.stringify(req.body).length);
    
    let imageUrl = null;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.image && req.body.image.startsWith('data:')) {
      // Validate base64 image size (max 250KB to prevent response bloat)
      if (req.body.image.length > 250 * 1024) {
        return res.status(400).json({ error: `Image trop volumineuse (${Math.round(req.body.image.length / 1024)}KB, max 250KB). Compressez l'image.` });
      }
      imageUrl = req.body.image;
    }

    // Handle specialties and certifications - must be passed as arrays
    let specialties = [];
    if (req.body.specialties) {
      if (typeof req.body.specialties === 'string') {
        try {
          specialties = JSON.parse(req.body.specialties);
        } catch (e) {
          console.warn('⚠️ Could not parse specialties as JSON, treating as plain text array');
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
          console.warn('⚠️ Could not parse certifications as JSON, treating as plain text array');
          certifications = [req.body.certifications];
        }
      } else if (Array.isArray(req.body.certifications)) {
        certifications = req.body.certifications;
      }
    }

    const member = await db.createTeamMember({
      name: req.body.name,
      title: req.body.title,
      bio: req.body.bio,
      image: imageUrl,
      email: req.body.email,
      phone: req.body.phone,
      specialties: specialties,
      certifications: certifications,
      linked_in: req.body.linked_in,
      is_founder: req.body.is_founder === 'true' || req.body.is_founder === true
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('❌ Erreur création équipe:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/team/:id', upload.single('image'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log('🔄 PUT /api/team/:id', id);
    console.log('📤 Body size:', JSON.stringify(req.body).length);
    
    let imageUrl = req.body.image;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.image && req.body.image.startsWith('data:')) {
      // Validate base64 image size (max 250KB to prevent response bloat)
      if (req.body.image.length > 250 * 1024) {
        return res.status(400).json({ error: `Image trop volumineuse (${Math.round(req.body.image.length / 1024)}KB, max 250KB). Compressez l'image.` });
      }
    }

    // Handle specialties - could be string, array, or undefined
    let specialties = [];
    if (req.body.specialties) {
      if (typeof req.body.specialties === 'string') {
        try {
          specialties = JSON.parse(req.body.specialties);
        } catch (e) {
          console.warn('⚠️ Could not parse specialties as JSON, treating as plain text array');
          specialties = [req.body.specialties];
        }
      } else if (Array.isArray(req.body.specialties)) {
        specialties = req.body.specialties;
      }
    }

    // Handle certifications - could be string, array, or undefined
    let certifications = [];
    if (req.body.certifications) {
      if (typeof req.body.certifications === 'string') {
        try {
          certifications = JSON.parse(req.body.certifications);
        } catch (e) {
          console.warn('⚠️ Could not parse certifications as JSON, treating as plain text array');
          certifications = [req.body.certifications];
        }
      } else if (Array.isArray(req.body.certifications)) {
        certifications = req.body.certifications;
      }
    }

    const member = await db.updateTeamMember(id, {
      name: req.body.name,
      title: req.body.title,
      bio: req.body.bio,
      image: imageUrl,
      email: req.body.email,
      phone: req.body.phone,
      specialties: specialties,
      certifications: certifications,
      linked_in: req.body.linked_in,
      is_founder: req.body.is_founder === 'true' || req.body.is_founder === true
    });

    res.json(member);
  } catch (error) {
    console.error('❌ Erreur modification équipe:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/team/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.deleteTeamMember(id);
    res.json({ success: true, id });
  } catch (error) {
    console.error('Erreur suppression équipe:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= TESTIMONIALS ROUTES =============

app.get('/api/testimonials', async (req, res) => {
  try {
    const testimonials = await db.getTestimonials();
    res.json(testimonials);
  } catch (error) {
    console.error('Erreur récupération testimonials:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/testimonials', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = null;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.image && req.body.image.startsWith('data:')) {
      imageUrl = req.body.image;
    }

    const testimonial = await db.createTestimonial({
      name: req.body.name,
      title: req.body.title,
      company: req.body.company,
      testimonial: req.body.testimonial,
      rating: parseInt(req.body.rating) || 5,
      image: imageUrl
    });

    res.status(201).json(testimonial);
  } catch (error) {
    console.error('Erreur création testimonial:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/testimonials/:id', upload.single('image'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    let imageUrl = req.body.image;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    }

    const testimonial = await db.updateTestimonial(id, {
      name: req.body.name,
      title: req.body.title,
      company: req.body.company,
      testimonial: req.body.testimonial,
      rating: parseInt(req.body.rating) || 5,
      image: imageUrl
    });

    res.json(testimonial);
  } catch (error) {
    console.error('Erreur modification testimonial:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/testimonials/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.deleteTestimonial(id);
    res.json({ success: true, id });
  } catch (error) {
    console.error('Erreur suppression testimonial:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= NEWS ROUTES =============

app.get('/api/news', async (req, res) => {
  try {
    const news = await db.getNews();
    res.json(news);
  } catch (error) {
    console.error('Erreur récupération news:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/news', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = null;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.image && req.body.image.startsWith('data:')) {
      imageUrl = req.body.image;
    }

    const newsItem = await db.createNews({
      title: req.body.title,
      description: req.body.description,
      content: req.body.content || '',
      category: req.body.category || 'Actualités',
      image: imageUrl,
      date: new Date().toISOString()
    });

    res.status(201).json(newsItem);
  } catch (error) {
    console.error('Erreur création news:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/news/:id', upload.single('image'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    let imageUrl = req.body.image;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    }

    const newsItem = await db.updateNews(id, {
      title: req.body.title,
      description: req.body.description,
      content: req.body.content || '',
      category: req.body.category || 'Actualités',
      image: imageUrl
    });

    res.json(newsItem);
  } catch (error) {
    console.error('Erreur modification news:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/news/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.deleteNews(id);
    res.json({ success: true, id });
  } catch (error) {
    console.error('Erreur suppression news:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= SOLUTIONS ROUTES =============

app.get('/api/solutions', async (req, res) => {
  try {
    const solutions = await db.getSolutions();
    res.json(solutions);
  } catch (error) {
    console.error('Erreur récupération solutions:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/solutions', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = null;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.image && req.body.image.startsWith('data:')) {
      imageUrl = req.body.image;
    }

    const solution = await db.createSolution({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      image: imageUrl,
      benefits: req.body.benefits ? JSON.parse(req.body.benefits) : [],
      features: req.body.features ? JSON.parse(req.body.features) : []
    });

    res.status(201).json(solution);
  } catch (error) {
    console.error('Erreur création solution:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/solutions/:id', upload.single('image'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    let imageUrl = req.body.image;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    }

    const solution = await db.updateSolution(id, {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      image: imageUrl,
      benefits: req.body.benefits ? JSON.parse(req.body.benefits) : [],
      features: req.body.features ? JSON.parse(req.body.features) : []
    });

    res.json(solution);
  } catch (error) {
    console.error('Erreur modification solution:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/solutions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.deleteSolution(id);
    res.json({ success: true, id });
  } catch (error) {
    console.error('Erreur suppression solution:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= JOBS ROUTES =============

app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await db.getJobs();
    res.json(jobs);
  } catch (error) {
    console.error('Erreur récupération jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const job = await db.createJob({
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      type: req.body.type,
      department: req.body.department,
      requirements: req.body.requirements,
      salary_range: req.body.salary_range
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Erreur création job:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/jobs/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const job = await db.updateJob(id, {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      type: req.body.type,
      department: req.body.department,
      requirements: req.body.requirements,
      salary_range: req.body.salary_range
    });

    res.json(job);
  } catch (error) {
    console.error('Erreur modification job:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.deleteJob(id);
    res.json({ success: true, id });
  } catch (error) {
    console.error('Erreur suppression job:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= APPLICATIONS ROUTES =============

app.get('/api/applications', async (req, res) => {
  try {
    const applications = await db.getApplications();
    res.json(applications);
  } catch (error) {
    console.error('Erreur récupération applications:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/applications', upload.single('resume'), async (req, res) => {
  try {
    let resumeUrl = null;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      resumeUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else if (req.body.resume && req.body.resume.startsWith('data:')) {
      resumeUrl = req.body.resume;
    }

    const application = await db.createApplication({
      job_id: parseInt(req.body.job_id) || null,
      job_title: req.body.job_title,
      full_name: req.body.full_name,
      email: req.body.email,
      phone: req.body.phone,
      linkedin: req.body.linkedin,
      cover_letter: req.body.cover_letter,
      resume: resumeUrl
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Erreur création application:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/applications/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.deleteApplication(id);
    res.json({ success: true, id });
  } catch (error) {
    console.error('Erreur suppression application:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= CONTACTS ROUTES =============

app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await db.getContacts();
    res.json(contacts);
  } catch (error) {
    console.error('Erreur récupération contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!req.body.message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const contact = await db.createContact({
      full_name: req.body.full_name || req.body.fullName || '',
      email: req.body.email,
      phone: req.body.phone || '',
      subject: req.body.subject || 'No subject',
      message: req.body.message
    });

    if (!contact) {
      return res.status(500).json({ error: 'Failed to create contact' });
    }

    res.status(201).json(contact);
  } catch (error) {
    console.error('Erreur création contact:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/contacts/:id/reply', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const contact = await db.replyContact(id, {
      reply_method: req.body.reply_method,
      reply_message: req.body.reply_message
    });

    res.json(contact);
  } catch (error) {
    console.error('Erreur réponse contact:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.deleteContact(id);
    res.json({ success: true, id });
  } catch (error) {
    console.error('Erreur suppression contact:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= SETTINGS ROUTES =============

app.get('/api/settings', async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json(settings || {});
  } catch (error) {
    console.error('Erreur récupération settings:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const settings = await db.updateSettings({
      site_title: req.body.site_title || req.body.siteTitle,
      slogan: req.body.slogan,
      tagline: req.body.tagline,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      facebook: req.body.facebook,
      twitter: req.body.twitter,
      linkedin: req.body.linkedin,
      instagram: req.body.instagram,
      primary_color: req.body.primary_color || req.body.primaryColor,
      description: req.body.description,
      business_hours: req.body.business_hours || req.body.businessHours,
      maintenance_mode: req.body.maintenance_mode || req.body.maintenanceMode
    });

    res.json(settings);
  } catch (error) {
    console.error('Erreur modification settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= SERVICES ROUTES =============

app.get('/api/services', async (req, res) => {
  try {
    const services = await db.getServices();
    res.json(services);
  } catch (error) {
    console.error('Erreur récupération services:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const service = await db.createService({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('Erreur création service:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const service = await db.updateService(id, {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category
    });

    res.json(service);
  } catch (error) {
    console.error('Erreur modification service:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.deleteService(id);
    res.json({ success: true, id });
  } catch (error) {
    console.error('Erreur suppression service:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= 404 HANDLER =============

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============= START SERVER =============

app.listen(PORT, () => {
  console.log(`\n🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Database: PostgreSQL (Vercel Postgres)`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`✅ Ready for connections\n`);
});

export default app;
