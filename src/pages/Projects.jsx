import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, Users, Code, ExternalLink } from 'lucide-react';
import ProjectModal from '../components/ProjectModal';
import { apiClient } from '../api/apiClient';

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les projets du backend
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getProjects();
        setProjects(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();

    // Recharger les projets toutes les 10 secondes
    const interval = setInterval(loadProjects, 10000);
    return () => clearInterval(interval);
  }, []);

  const categories = ['Tous', ...new Set(projects.map(p => p.category))];
  
  const filteredProjects = selectedCategory === 'Tous' 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <>
    <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-slate-900 mb-6">
              Nos Projets Réalisés
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Découvrez les solutions innovantes que nous avons développées pour nos clients. 
              Des projets variés qui témoignent de notre expertise et de notre engagement envers l'excellence.
            </p>
          </motion.div>

          {/* Filters */}
          {!loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3 justify-center mb-12"
          >
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <p className="text-slate-600 text-lg">Chargement des projets...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredProjects.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-600 text-lg">Aucun projet trouvé</p>
            </div>
          )}

          {/* Projects Grid */}
          {!loading && (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map(project => (
              <motion.div
                key={project.id}
                variants={item}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6 flex flex-col h-full">
                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                        {project.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        project.status === 'Produit' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{project.category}</p>
                  </div>

                  {/* Client */}
                  <div className="flex items-center gap-2 text-slate-700 mb-3">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">{project.client}</span>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-grow">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="mb-4 pb-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="w-4 h-4 text-green-600" />
                      <p className="text-xs font-semibold text-slate-700">Technologies</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button 
                    onClick={() => {
                      setSelectedProject(project);
                      setIsModalOpen(true);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>En savoir plus</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
          )}

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid md:grid-cols-3 gap-6 mt-20 pt-20 border-t border-slate-200"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {projects.length}+
              </div>
              <p className="text-slate-600 font-medium">Projets Réalisés</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {new Set(projects.map(p => p.client)).size}+
              </div>
              <p className="text-slate-600 font-medium">Clients Satisfaits</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {new Set(projects.flatMap(p => p.technologies)).size}+
              </div>
              <p className="text-slate-600 font-medium">Technologies</p>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-20 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-12 text-center"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Vous avez un projet?
            </h2>
            <p className="text-slate-600 text-lg mb-6">
              Nous serions ravis de discuter de la façon dont nous pouvons vous aider à transformer votre vision en réalité.
            </p>
            <Link 
              to="/contact" 
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Démarrer une Conversation
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Project Modal */}
      <ProjectModal 
        project={selectedProject} 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProject(null);
        }}
      />
    </>
    );
}
