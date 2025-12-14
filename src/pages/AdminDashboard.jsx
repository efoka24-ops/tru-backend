import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, AlertCircle, Save, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to parse specialties/certifications which may be JSON strings
const parseArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const API_BASE = 'https://tru-backend-o1zc.onrender.com/api';

export default function AdminTeam() {
  // ==================== STATE ====================
  const [team, setTeam] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '', show: false });
  const [searchFilter, setSearchFilter] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    specialties: [],
    email: '',
    phone: '',
    image: '',
    isVisible: true,
    isFounder: false
  });

  const [editingId, setEditingId] = useState(null);
  const [newSpecialty, setNewSpecialty] = useState('');

  // ==================== USEEFFECT ====================
  useEffect(() => {
    loadTeamData();
  }, []);

  // Auto-hide message
  useEffect(() => {
    if (message.show) {
      const timer = setTimeout(() => {
        setMessage({ ...message, show: false });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message.show]);

  // ==================== API FUNCTIONS ====================
  const loadTeamData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/team`);
      if (response.ok) {
        const data = await response.json();
        const teamArray = Array.isArray(data) ? data : data.data || [];
        setTeam(teamArray);
        showMessage(' Données chargées', 'success');
      } else {
        showMessage('Erreur lors du chargement', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('Erreur de connexion au serveur', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type, show: true });
  };

  const saveMember = async () => {
    if (!formData.name.trim() || !formData.role.trim()) {
      showMessage('Nom et rôle sont obligatoires', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const url = isEditing
        ? `${API_BASE}/team/${editingId}`
        : `${API_BASE}/team`;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showMessage(isEditing ? ' Membre mis à jour' : ' Membre ajouté', 'success');
        closeModal();
        await loadTeamData();
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

  const deleteMember = async (id) => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE}/team/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showMessage(' Membre supprimé', 'success');
        setDeleteConfirm(null);
        await loadTeamData();
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

  // ==================== FORM HANDLERS ====================
  const openNewMemberModal = () => {
    setFormData({
      name: '',
      role: '',
      bio: '',
      specialties: [],
      email: '',
      phone: '',
      image: '',
      isVisible: true,
      isFounder: false
    });
    setIsEditing(false);
    setEditingId(null);
    setNewSpecialty('');
    setIsModalOpen(true);
  };

  const openEditMemberModal = (member) => {
    setFormData(member);
    setIsEditing(true);
    setEditingId(member.id);
    setNewSpecialty('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setNewSpecialty('');
    setFormData({
      name: '',
      role: '',
      bio: '',
      specialties: [],
      email: '',
      phone: '',
      image: '',
      isVisible: true,
      isFounder: false
    });
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty.trim()]
      });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter((_, i) => i !== index)
    });
  };

  // ==================== FILTERS ====================
  const filteredTeam = team.filter(member =>
    member.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    member.role.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12 px-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2"> Gestion de l'Équipe TRU GROUP</h1>
          <p className="text-green-100 text-lg">Gérez et synchronisez les membres de votre équipe</p>
        </div>
      </div>

      {/* CONTAINER */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* MESSAGE NOTIFICATION */}
        <AnimatePresence>
          {message.show && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 font-medium ${
                message.type === 'success'
                  ? 'bg-green-500/20 text-green-300 border border-green-500'
                  : 'bg-red-500/20 text-red-300 border border-red-500'
              }`}
            >
              {message.type === 'success' ? (
                <Check size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOOLBAR */}
        <div className="flex justify-between items-center gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder=" Rechercher par nom ou rôle..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none transition"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openNewMemberModal}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
          >
            <Plus size={20} />
            Ajouter Membre
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadTeamData}
            disabled={isLoading}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition disabled:opacity-50"
          >
            <Save size={20} />
            {isLoading ? 'Chargement...' : 'Sync'}
          </motion.button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Total Membres</p>
            <p className="text-3xl font-bold text-white">{team.length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Visibles</p>
            <p className="text-3xl font-bold text-green-400">{team.filter(m => m.isVisible).length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Fondateurs</p>
            <p className="text-3xl font-bold text-yellow-400">{team.filter(m => m.isFounder).length}</p>
          </div>
        </div>

        {/* TEAM LIST */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
            <p className="text-slate-400 mt-4">Chargement des membres...</p>
          </div>
        ) : filteredTeam.length === 0 ? (
          <div className="text-center py-20 bg-slate-800 rounded-lg border border-slate-700">
            <AlertCircle size={48} className="mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400 text-lg">
              {searchFilter ? 'Aucun résultat trouvé' : 'Aucun membre d\'équipe. Cliquez sur "Ajouter Membre" pour commencer.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredTeam.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 hover:border-green-500/50 overflow-hidden shadow-lg hover:shadow-xl transition"
                >
                  {/* IMAGE */}
                  <div className="relative h-40 bg-gradient-to-br from-green-600 to-green-700 overflow-hidden">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold">
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                    {member.isFounder && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                         Fondateur
                      </div>
                    )}
                    {!member.isVisible && (
                      <div className="absolute top-2 left-2 bg-slate-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                        <EyeOff size={12} /> Masqué
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-green-400 font-medium mb-3">{member.role}</p>
                    <p className="text-slate-300 text-sm mb-4 line-clamp-2">{member.bio}</p>

                    {/* SPECIALTIES */}
                    {parseArray(member.specialties).length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Spécialités</p>
                        <div className="flex flex-wrap gap-2">
                          {parseArray(member.specialties).map((spec, i) => (
                            <span key={i} className="inline-block bg-green-600/20 text-green-300 text-xs px-2 py-1 rounded border border-green-500/50">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CONTACT */}
                    <div className="border-t border-slate-700 pt-4 mb-4 space-y-2">
                      {member.email && (
                        <p className="text-sm text-slate-400">
                          <span className="text-slate-500"></span> {member.email}
                        </p>
                      )}
                      {member.phone && (
                        <p className="text-sm text-slate-400">
                          <span className="text-slate-500"></span> {member.phone}
                        </p>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditMemberModal(member)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                      >
                        <Edit2 size={16} />
                        Modifier
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDeleteConfirm(member)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition"
                      >
                        <Trash2 size={16} />
                        Supprimer
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* MODAL ADD/EDIT */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* MODAL HEADER */}
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-6 flex justify-between items-center border-b border-green-500/30">
                <h2 className="text-2xl font-bold">
                  {isEditing ? ' Modifier Membre' : ' Ajouter Membre'}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeModal}
                  className="text-white hover:text-green-100"
                >
                  <X size={28} />
                </motion.button>
              </div>

              {/* MODAL CONTENT */}
              <div className="p-8 space-y-6">
                {/* NAME & ROLE */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Nom *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none transition"
                      placeholder="Nom complet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Rôle *</label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none transition"
                      placeholder="Ex: Directeur Technique"
                    />
                  </div>
                </div>

                {/* BIO */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Biographie</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none transition resize-none"
                    rows={3}
                    placeholder="Description du membre..."
                  />
                </div>

                {/* CONTACT INFO */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none transition"
                      placeholder="email@trugroup.cm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none transition"
                      placeholder="+237 XXX XXX XXX"
                    />
                  </div>
                </div>

                {/* IMAGE URL */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">URL Image</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 outline-none transition"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                {/* SPECIALTIES */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Spécialités</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                      className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-green-500 outline-none transition"
                      placeholder="Ajouter une spécialité..."
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={addSpecialty}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
                    >
                      <Plus size={20} />
                    </motion.button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {parseArray(formData.specialties).map((spec, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="inline-flex items-center gap-2 bg-green-600/20 text-green-300 px-3 py-1 rounded-full border border-green-500/50"
                      >
                        {spec}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeSpecialty(i)}
                          className="hover:text-green-100"
                        >
                          <X size={16} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* TOGGLES */}
                <div className="border-t border-slate-700 pt-6 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.isFounder}
                      onChange={(e) => setFormData({ ...formData, isFounder: e.target.checked })}
                      className="w-5 h-5 rounded accent-green-600"
                    />
                    <span className="text-slate-300 group-hover:text-white transition"> Fondateur</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.isVisible}
                      onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                      className="w-5 h-5 rounded accent-green-600"
                    />
                    <span className="text-slate-300 group-hover:text-white transition"> Visible sur le site</span>
                  </label>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="sticky bottom-0 border-t border-slate-700 bg-slate-900/50 backdrop-blur px-8 py-6 flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeModal}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={saveMember}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition"
                >
                  <Check size={20} />
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 max-w-sm w-full shadow-2xl overflow-hidden"
            >
              <div className="bg-red-600/20 border-b border-red-500/30 px-8 py-6">
                <h3 className="text-xl font-bold text-red-300 flex items-center gap-2">
                  <AlertCircle size={24} />
                  Supprimer ce membre ?
                </h3>
              </div>
              <div className="p-8">
                <p className="text-slate-400 mb-2">
                  Vous êtes sur le point de supprimer:
                </p>
                <p className="text-white font-semibold text-lg mb-6">
                  {deleteConfirm.name}
                </p>
                <p className="text-slate-400 text-sm">
                   Cette action est <span className="font-semibold">irréversible</span>. Le membre sera définitivement supprimé de la base de données.
                </p>
              </div>
              <div className="border-t border-slate-700 bg-slate-900/50 px-8 py-6 flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => deleteMember(deleteConfirm.id)}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition"
                >
                  <Trash2 size={20} />
                  {isSaving ? 'Suppression...' : 'Supprimer'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
