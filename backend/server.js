import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Utility functions
function readData() {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erreur lecture data.json:', err);
    return { users: [], services: [], content: [], contacts: [], team: [] };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Erreur écriture data.json:', err);
    return false;
  }
}

// Routes Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Services Routes
app.get('/api/services', (req, res) => {
  const data = readData();
  res.json(data.services);
});

app.post('/api/team', (req, res) => {
  try {
    const data = readData();
    const newId = Math.max(...data.team.map(t => t.id || 0), 0) + 1;
    
    const newMember = {
      id: newId,
      ...req.body
    };
    
    data.team.push(newMember);
    
    if (writeData(data)) {
      console.log(`✅ Nouveau membre ${newId} créé`);
      res.status(201).json(newMember);
    } else {
      console.error('❌ Erreur écriture');
      res.status(500).json({ error: 'Erreur d\'écriture dans la base de données' });
    }
  } catch (error) {
    console.error(`❌ Erreur serveur:`, error);
    res.status(500).json({ error: 'Erreur serveur: ' + error.message });
  }
});

app.put('/api/services/:id', (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const index = data.services.findIndex(s => s.id === id);
  if (index !== -1) {
    data.services[index] = { ...data.services[index], ...req.body, id };
    if (writeData(data)) {
      res.json(data.services[index]);
    } else {
      res.status(500).json({ error: 'Erreur d\'écriture' });
    }
  } else {
    res.status(404).json({ error: 'Service non trouvé' });
  }
});

app.delete('/api/services/:id', (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const index = data.services.findIndex(s => s.id === id);
  if (index !== -1) {
    const deleted = data.services.splice(index, 1);
    if (writeData(data)) {
      res.json(deleted[0]);
    } else {
      res.status(500).json({ error: 'Erreur d\'écriture' });
    }
  } else {
    res.status(404).json({ error: 'Service non trouvé' });
  }
});

// Content Routes
app.get('/api/content', (req, res) => {
  const data = readData();
  res.json(data.content);
});

app.post('/api/content', (req, res) => {
  const data = readData();
  const newContent = {
    id: Math.max(...data.content.map(c => c.id), 0) + 1,
    ...req.body
  };
  data.content.push(newContent);
  if (writeData(data)) {
    res.status(201).json(newContent);
  } else {
    res.status(500).json({ error: 'Erreur d\'écriture' });
  }
});

app.put('/api/content/:id', (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const index = data.content.findIndex(c => c.id === id);
  if (index !== -1) {
    data.content[index] = { ...data.content[index], ...req.body, id };
    if (writeData(data)) {
      res.json(data.content[index]);
    } else {
      res.status(500).json({ error: 'Erreur d\'écriture' });
    }
  } else {
    res.status(404).json({ error: 'Contenu non trouvé' });
  }
});

app.delete('/api/content/:id', (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const index = data.content.findIndex(c => c.id === id);
  if (index !== -1) {
    const deleted = data.content.splice(index, 1);
    if (writeData(data)) {
      res.json(deleted[0]);
    } else {
      res.status(500).json({ error: 'Erreur d\'écriture' });
    }
  } else {
    res.status(404).json({ error: 'Contenu non trouvé' });
  }
});

// POST Content
app.post('/api/content', (req, res) => {
  try {
    const data = readData();
    const newId = Math.max(...(data.content?.map(c => c.id) || [0]), 0) + 1;
    const newContent = { id: newId, ...req.body };
    data.content.push(newContent);
    if (writeData(data)) {
      res.status(201).json(newContent);
    } else {
      res.status(500).json({ error: 'Erreur d\'écriture' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Team Routes
app.get('/api/team', (req, res) => {
  const data = readData();
  res.json(data.team);
});

app.post('/api/team', (req, res) => {
  const data = readData();
  const newMember = {
    id: Math.max(...data.team.map(t => t.id), 0) + 1,
    ...req.body
  };
  data.team.push(newMember);
  if (writeData(data)) {
    res.status(201).json(newMember);
  } else {
    res.status(500).json({ error: 'Erreur d\'écriture' });
  }
});

app.put('/api/team/:id', (req, res) => {
  try {
    const data = readData();
    const id = parseInt(req.params.id);
    const index = data.team.findIndex(t => t.id === id);
    
    if (index !== -1) {
      // Fusionner les données existantes avec les nouvelles
      const updatedMember = {
        ...data.team[index],
        ...req.body,
        id: id // S'assurer que l'ID ne change pas
      };
      
      data.team[index] = updatedMember;
      
      if (writeData(data)) {
        console.log(`✅ Membre ${id} modifié avec succès`);
        res.json(updatedMember);
      } else {
        console.error(`❌ Erreur écriture pour membre ${id}`);
        res.status(500).json({ error: 'Erreur d\'écriture dans la base de données' });
      }
    } else {
      console.warn(`⚠️ Membre ${id} non trouvé`);
      res.status(404).json({ error: `Membre avec ID ${id} non trouvé` });
    }
  } catch (error) {
    console.error(`❌ Erreur serveur:`, error);
    res.status(500).json({ error: 'Erreur serveur: ' + error.message });
  }
});

app.delete('/api/team/:id', (req, res) => {
  try {
    const data = readData();
    const id = parseInt(req.params.id);
    const index = data.team.findIndex(t => t.id === id);
    
    if (index !== -1) {
      const deleted = data.team.splice(index, 1);
      
      if (writeData(data)) {
        console.log(`✅ Membre ${id} supprimé`);
        res.json(deleted[0]);
      } else {
        console.error(`❌ Erreur écriture pour suppression ${id}`);
        res.status(500).json({ error: 'Erreur d\'écriture dans la base de données' });
      }
    } else {
      console.warn(`⚠️ Membre ${id} non trouvé pour suppression`);
      res.status(404).json({ error: `Membre avec ID ${id} non trouvé` });
    }
  } catch (error) {
    console.error(`❌ Erreur serveur:`, error);
    res.status(500).json({ error: 'Erreur serveur: ' + error.message });
  }
});

// Solutions Routes
app.get('/api/solutions', (req, res) => {
  const data = readData();
  res.json(data.solutions || []);
});

app.post('/api/solutions', (req, res) => {
  try {
    const data = readData();
    if (!data.solutions) data.solutions = [];
    
    const newId = Math.max(...data.solutions.map(s => s.id || 0), 0) + 1;
    const newSolution = { id: newId, ...req.body };
    
    data.solutions.push(newSolution);
    
    if (writeData(data)) {
      console.log(`✅ Solution ${newId} créée`);
      res.status(201).json(newSolution);
    } else {
      res.status(500).json({ error: 'Erreur d\'écriture' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/solutions/:id', (req, res) => {
  try {
    const data = readData();
    const id = parseInt(req.params.id);
    const index = data.solutions.findIndex(s => s.id === id);
    
    if (index !== -1) {
      data.solutions[index] = { ...data.solutions[index], ...req.body, id };
      if (writeData(data)) {
        res.json(data.solutions[index]);
      } else {
        res.status(500).json({ error: 'Erreur d\'écriture' });
      }
    } else {
      res.status(404).json({ error: 'Solution non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/solutions/:id', (req, res) => {
  try {
    const data = readData();
    const id = parseInt(req.params.id);
    const index = data.solutions.findIndex(s => s.id === id);
    
    if (index !== -1) {
      const deleted = data.solutions.splice(index, 1);
      if (writeData(data)) {
        res.json(deleted[0]);
      } else {
        res.status(500).json({ error: 'Erreur d\'écriture' });
      }
    } else {
      res.status(404).json({ error: 'Solution non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Testimonials Routes
app.get('/api/testimonials', (req, res) => {
  const data = readData();
  res.json(data.testimonials || []);
});

app.post('/api/testimonials', (req, res) => {
  try {
    const data = readData();
    if (!data.testimonials) data.testimonials = [];
    
    const newId = Math.max(...data.testimonials.map(t => t.id || 0), 0) + 1;
    const newTestimonial = { id: newId, ...req.body };
    
    data.testimonials.push(newTestimonial);
    
    if (writeData(data)) {
      console.log(`✅ Témoignage ${newId} créé`);
      res.status(201).json(newTestimonial);
    } else {
      res.status(500).json({ error: 'Erreur d\'écriture' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/testimonials/:id', (req, res) => {
  try {
    const data = readData();
    const id = parseInt(req.params.id);
    const index = data.testimonials.findIndex(t => t.id === id);
    
    if (index !== -1) {
      data.testimonials[index] = { ...data.testimonials[index], ...req.body, id };
      if (writeData(data)) {
        res.json(data.testimonials[index]);
      } else {
        res.status(500).json({ error: 'Erreur d\'écriture' });
      }
    } else {
      res.status(404).json({ error: 'Témoignage non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/testimonials/:id', (req, res) => {
  try {
    const data = readData();
    const id = parseInt(req.params.id);
    const index = data.testimonials.findIndex(t => t.id === id);
    
    if (index !== -1) {
      const deleted = data.testimonials.splice(index, 1);
      if (writeData(data)) {
        res.json(deleted[0]);
      } else {
        res.status(500).json({ error: 'Erreur d\'écriture' });
      }
    } else {
      res.status(404).json({ error: 'Témoignage non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Settings Routes
app.get('/api/settings', (req, res) => {
  const data = readData();
  res.json(data.settings || {});
});

app.put('/api/settings', (req, res) => {
  try {
    const data = readData();
    data.settings = { ...data.settings, ...req.body };
    
    if (writeData(data)) {
      console.log(`✅ Paramètres mis à jour`);
      res.json(data.settings);
    } else {
      res.status(500).json({ error: 'Erreur d\'écriture' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      services: data.services.length,
      solutions: (data.solutions || []).length,
      testimonials: (data.testimonials || []).length,
      content: data.content.length,
      team: data.team.length
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
});
