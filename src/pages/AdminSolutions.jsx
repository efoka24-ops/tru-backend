import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, AlertCircle, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:5000/api';

export default function AdminSolutions() {
  const [solutions, setSolutions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '', show: false });

  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    description: '',
    longDescription: '',
    icon: '',
    color: ''
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadSolutions();
    const timer = setInterval(() => {
      if (message.show) setMessage({ ...message, show: false });
    }, 4000);
    return () => clearInterval(timer);
  }, [message.show]);

  const loadSolutions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/solutions`);
      if (response.ok) {
        const data = await response.json();
        setSolutions(Array.isArray(data) ? data : []);
        showMessage('Solutions chargées', 'success');
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

  const saveSolution = async () => {
    if (!formData.name.trim()) {
      showMessage('Le nom est obligatoire', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const url = isEditing ? `${API_BASE}/solutions/${editingId}` : `${API_BASE}/solutions`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showMessage(isEditing ? 'Solution mise à jour' : 'Solution ajoutée', 'success');
        closeModal();
        await loadSolutions();
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

  const deleteSolution = async (id) => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE}/solutions/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showMessage('Solution supprimée', 'success');
        setDeleteConfirm(null);
        await loadSolutions();
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
    setFormData({ name: '', subtitle: '', description: '', longDescription: '', icon: '', color: '' });
    setIsEditing(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (solution) => {
    setFormData(solution);
    setIsEditing(true);
    setEditingId(solution.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', subtitle: '', description: '', longDescription: '', icon: '', color: '' });
    setEditingId(null);
  };

  if (isLoading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Solutions</h1>
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
          >
            <Plus size={20} /> Ajouter une solution
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
          {solutions.map((solution) => (
            <motion.div
              key={solution.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{solution.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{solution.subtitle}</p>
                  <p className="text-gray-600 mt-2">{solution.description}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(solution)} className="p-2 text-blue-500 hover:bg-blue-50 rounded">
                    <Edit2 size={20} />
                  </button>
                  <button onClick={() => setDeleteConfirm(solution.id)} className="p-2 text-red-500 hover:bg-red-50 rounded">
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
                  <button onClick={() => deleteSolution(deleteConfirm)} disabled={isSaving} className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50">
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
                  <h2 className="text-2xl font-bold">{isEditing ? 'Modifier la solution' : 'Ajouter une solution'}</h2>
                  <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <input type="text" placeholder="Nom" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 border rounded-lg" />
                  <input type="text" placeholder="Sous-titre" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className="w-full p-3 border rounded-lg" />
                  <textarea placeholder="Description courte" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 border rounded-lg" rows="2" />
                  <textarea placeholder="Description longue" value={formData.longDescription} onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })} className="w-full p-3 border rounded-lg" rows="3" />
                  <input type="text" placeholder="Icône emoji (ex: 🐄)" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full p-3 border rounded-lg" />
                  <input type="text" placeholder="Couleur" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-full p-3 border rounded-lg" />
                </div>

                <div className="flex gap-4 mt-8">
                  <button onClick={closeModal} className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                    Annuler
                  </button>
                  <button onClick={saveSolution} disabled={isSaving} className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2">
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
