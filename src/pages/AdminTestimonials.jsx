import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, AlertCircle, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

//const API_BASE = 'http://localhost:5000/api';
const API_BASE = 'https://tru-backend-five.vercel.app/';
export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '', show: false });

  const [formData, setFormData] = useState({
    author: '',
    position: '',
    organization: '',
    text: '',
    image: '',
    rating: 5
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadTestimonials();
    const timer = setInterval(() => {
      if (message.show) setMessage({ ...message, show: false });
    }, 4000);
    return () => clearInterval(timer);
  }, [message.show]);

  const loadTestimonials = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/testimonials`);
      if (response.ok) {
        const data = await response.json();
        setTestimonials(Array.isArray(data) ? data : []);
        showMessage('Témoignages chargés', 'success');
      } else {
        showMessage('Erreur lors du chargement', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('Erreur de connexion', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type, show: true });
  };

  const saveTestimonial = async () => {
    if (!formData.author.trim() || !formData.text.trim()) {
      showMessage('Auteur et texte sont obligatoires', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const url = isEditing ? `${API_BASE}/testimonials/${editingId}` : `${API_BASE}/testimonials`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showMessage(isEditing ? 'Témoignage mis à jour' : 'Témoignage ajouté', 'success');
        closeModal();
        await loadTestimonials();
      } else {
        showMessage('Erreur lors de la sauvegarde', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('Erreur de connexion', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTestimonial = async (id) => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE}/testimonials/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showMessage('Témoignage supprimé', 'success');
        setDeleteConfirm(null);
        await loadTestimonials();
      } else {
        showMessage('Erreur lors de la suppression', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('Erreur de connexion', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const openNewModal = () => {
    setFormData({ author: '', position: '', organization: '', text: '', image: '', rating: 5 });
    setIsEditing(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (testimonial) => {
    setFormData(testimonial);
    setIsEditing(true);
    setEditingId(testimonial.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ author: '', position: '', organization: '', text: '', image: '', rating: 5 });
    setEditingId(null);
  };

  if (isLoading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Témoignages</h1>
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
          >
            <Plus size={20} /> Ajouter un témoignage
          </button>
        </div>

        {message.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </motion.div>
        )}

        <div className="grid gap-6">
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-700 italic mb-3">"{testimonial.text}"</p>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.position}</p>
                  <p className="text-sm text-gray-500">{testimonial.organization}</p>
                  <div className="mt-2">
                    {'⭐'.repeat(testimonial.rating)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(testimonial)} className="p-2 text-blue-500 hover:bg-blue-50 rounded">
                    <Edit2 size={20} />
                  </button>
                  <button onClick={() => setDeleteConfirm(testimonial.id)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {deleteConfirm && (
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-sm">
                <p className="text-gray-700 mb-6">Confirmer la suppression ?</p>
                <div className="flex gap-4">
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                    Annuler
                  </button>
                  <button onClick={() => deleteTestimonial(deleteConfirm)} disabled={isSaving} className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50">
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {isModalOpen && (
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{isEditing ? 'Modifier le témoignage' : 'Ajouter un témoignage'}</h2>
                  <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <input type="text" placeholder="Auteur" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className="w-full p-3 border rounded-lg" />
                  <input type="text" placeholder="Position" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full p-3 border rounded-lg" />
                  <input type="text" placeholder="Organisation" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} className="w-full p-3 border rounded-lg" />
                  <textarea placeholder="Texte du témoignage" value={formData.text} onChange={(e) => setFormData({ ...formData, text: e.target.value })} className="w-full p-3 border rounded-lg" rows="4" />
                  <input type="text" placeholder="URL Image" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full p-3 border rounded-lg" />
                  <select value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })} className="w-full p-3 border rounded-lg">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>{r} étoile{r > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4 mt-8">
                  <button onClick={closeModal} className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                    Annuler
                  </button>
                  <button onClick={saveTestimonial} disabled={isSaving} className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2">
                    <Save size={20} /> {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
