import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, Clock, ArrowRight, Heart, X, Check } from 'lucide-react';
import { apiService } from '../api/apiService';

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyingJob, setApplyingJob] = useState(null);
  const [notification, setNotification] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    resume: null,
    coverLetter: ''
  });

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await apiService.getJobs();
      setJobs(data || []);
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur:', error);
      setLoading(false);
    }
  };
      setLoading(false);
    }
  };

  const handleApplyClick = (e, job) => {
    e.stopPropagation();
    setApplyingJob(job);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      linkedin: '',
      resume: null,
      coverLetter: ''
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone || !formData.coverLetter) {
      showNotification('❌ Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('jobId', applyingJob.id);
      formDataToSend.append('jobTitle', applyingJob.title);
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('linkedin', formData.linkedin || '');
      formDataToSend.append('coverLetter', formData.coverLetter);
      
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume);
      }

      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Erreur envoi candidature');

      showNotification('✅ Candidature envoyée avec succès!', 'success');
      setApplyingJob(null);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        linkedin: '',
        resume: null,
        coverLetter: ''
      });
    } catch (error) {
      console.error('❌ Erreur:', error);
      showNotification('❌ Erreur lors de l\'envoi de la candidature', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-4 right-4 p-4 rounded-lg z-50 flex items-center gap-3 ${
              notification.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-green-50 text-green-800 border border-green-200'
            }`}
          >
            {notification.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-r from-slate-900 to-slate-800 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-600 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Rejoignez notre équipe
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Découvrez les opportunités de carrière chez TRU GROUP
            </p>
          </motion.div>
        </div>
      </section>

      {/* Jobs Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">Aucune offre disponible pour le moment</p>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer p-8 border-l-4 border-emerald-600"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4 text-emerald-600" />
                          {job.type}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          Posté le {new Date(job.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Heart className="w-6 h-6 text-slate-400 hover:text-red-600" />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 mb-4">{job.description}</p>

                  {/* Expanded Details */}
                  {selectedJob?.id === job.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-slate-200 space-y-4"
                    >
                      {job.requirements && (
                        <div>
                          <h4 className="font-bold text-slate-900 mb-2">Profil recherché</h4>
                          <ul className="space-y-1 text-slate-600 text-sm">
                            {job.requirements.split('\n').map((req, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-emerald-600 mt-1">•</span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {job.salaryRange && (
                        <div>
                          <h4 className="font-bold text-slate-900 mb-2">Salaire</h4>
                          <p className="text-slate-600 text-sm">{job.salaryRange}</p>
                        </div>
                      )}

                      {job.department && (
                        <div>
                          <h4 className="font-bold text-slate-900 mb-2">Département</h4>
                          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                            {job.department}
                          </span>
                        </div>
                      )}

                      <button 
                        onClick={(e) => handleApplyClick(e, job)}
                        className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        Postuler maintenant <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}

                  {selectedJob?.id !== job.id && (
                    <button className="text-emerald-600 font-semibold hover:gap-2 transition-all inline-flex items-center gap-1">
                      Voir plus <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Application Modal */}
      <AnimatePresence>
        {applyingJob && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-96 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Postuler pour</h2>
                  <p className="text-emerald-600 font-semibold">{applyingJob.title}</p>
                </div>
                <button
                  onClick={() => setApplyingJob(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitApplication} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    placeholder="Jean Dupont"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="jean@example.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="+237 6XX XXX XXX"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Profil LinkedIn
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleFormChange}
                    placeholder="https://linkedin.com/in/jeandupont"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Resume */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    CV (PDF, Word)
                  </label>
                  <input
                    type="file"
                    name="resume"
                    onChange={handleFormChange}
                    accept=".pdf,.doc,.docx"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  {formData.resume && (
                    <p className="text-sm text-emerald-600 mt-2">✅ {formData.resume.name}</p>
                  )}
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Lettre de motivation *
                  </label>
                  <textarea
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleFormChange}
                    placeholder="Parlez-nous de vous et de vos motivations..."
                    rows="4"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setApplyingJob(null)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 font-semibold transition-all"
                  >
                    {submitting ? 'Envoi...' : 'Envoyer candidature'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
