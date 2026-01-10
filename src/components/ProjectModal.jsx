/**
 * Modal de détails du projet
 * Affiche les informations complètes d'un projet
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Code, Users, Calendar, ExternalLink } from 'lucide-react';

export default function ProjectModal({ project, isOpen, onClose }) {
  const navigate = useNavigate();
  
  if (!project) return null;

  const handleContactClick = () => {
    onClose();
    navigate('/contact');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">{project.name}</h2>
                <p className="text-green-50 text-sm">Projet réalisé pour {project.client}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Status & Category */}
              <div className="flex gap-3">
                <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
                  project.status === 'Produit' 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {project.status}
                </span>
                <span className="px-4 py-2 rounded-full font-semibold text-sm bg-slate-100 text-slate-700">
                  {project.category}
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Description</h3>
                <p className="text-slate-600 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Client Info */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-bold text-slate-900">Client</h3>
                </div>
                <p className="text-slate-600">{project.client}</p>
              </div>

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Code className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-bold text-slate-900">Technologies</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              {project.details && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Détails supplémentaires</h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {project.details}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="border-t border-slate-200 pt-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {project.createdAt && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span>Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                  {project.updatedAt && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>Modifié le {new Date(project.updatedAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                >
                  Fermer
                </button>
                <button 
                  onClick={handleContactClick}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Nous contacter</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
