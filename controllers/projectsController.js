/**
 * Contrôleur pour les Projets Réalisés
 * Gère les opérations CRUD et la synchronisation GitHub
 */

import { githubSyncService } from '../services/githubSyncService.js';
import { logger } from '../services/logger.js';

// Base de données temporaire (à remplacer par une vraie base de données)
let projects = [];

/**
 * GET /api/projects - Récupérer tous les projets
 */
export const getProjects = async (req, res) => {
  try {
    logger.log('GET /api/projects');
    res.json(projects);
  } catch (error) {
    logger.error('Error getting projects:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/projects/:id - Récupérer un projet spécifique
 */
export const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = projects.find(p => p.id == id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    logger.error('Error getting project:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/projects - Créer un nouveau projet
 */
export const createProject = async (req, res) => {
  try {
    const { name, client, description, category, status, technologies, details } = req.body;

    if (!name || !client) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

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

    // Synchroniser avec GitHub
    if (process.env.ENABLE_GIT_SYNC === 'true') {
      await githubSyncService.syncToGitHub('projects', 'create', newProject);
    }

    logger.log('Project created:', newProject);
    res.status(201).json(newProject);

  } catch (error) {
    logger.error('Error creating project:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /api/projects/:id - Mettre à jour un projet
 */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, client, description, category, status, technologies, details } = req.body;

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

    // Synchroniser avec GitHub
    if (process.env.ENABLE_GIT_SYNC === 'true') {
      await githubSyncService.syncToGitHub('projects', 'update', updatedProject);
    }

    logger.log('Project updated:', updatedProject);
    res.json(updatedProject);

  } catch (error) {
    logger.error('Error updating project:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /api/projects/:id - Supprimer un projet
 */
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const projectIndex = projects.findIndex(p => p.id == id);
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const deletedProject = projects[projectIndex];
    projects.splice(projectIndex, 1);

    // Synchroniser avec GitHub
    if (process.env.ENABLE_GIT_SYNC === 'true') {
      await githubSyncService.syncToGitHub('projects', 'delete', { id, name: deletedProject.name });
    }

    logger.log('Project deleted:', deletedProject);
    res.json({ message: 'Project deleted', project: deletedProject });

  } catch (error) {
    logger.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
};
