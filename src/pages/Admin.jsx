import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, Briefcase, AlertCircle, CheckCircle, X, Plus, Edit2, Trash2, Save } from 'lucide-react';

const API_URL = 'https://tru-backend-o1zc.onrender.com/api';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('settings');
  const [settings, setSettings] = useState({});
  const [team, setTeam] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, teamRes, servicesRes] = await Promise.all([
        fetch(`${API_URL}/settings`),
        fetch(`${API_URL}/team`),
        fetch(`${API_URL}/services`)
      ]);

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData.data || {});
      }
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeam(teamData.data || []);
      }
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData.data || []);
      }
    } catch (error) {
      showMessage('Erreur lors du chargement des données', 'error');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // Settings handlers
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      const result = await response.json();
      if (result.success) {
        showMessage('Paramètres enregistrés avec succès', 'success');
      } else {
        showMessage('Erreur lors de l\'enregistrement', 'error');
      }
    } catch (error) {
      showMessage('Erreur de connexion', 'error');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Team handlers
  const startEditTeam = (member) => {
    setEditingId(member.id);
    setFormData(member);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
  };

  const saveTeamMember = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/team/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        setTeam(team.map(m => m.id === editingId ? result.data : m));
        showMessage('Membre mis à jour avec succès', 'success');
        cancelEdit();
      } else {
        showMessage('Erreur lors de la mise à jour', 'error');
      }
    } catch (error) {
      showMessage('Erreur de connexion', 'error');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTeamMember = async (id) => {
    if (!window.confirm('Êtes-vous sûr ?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/team/${id}`, { method: 'DELETE' });
      const result = await response.json();
      
      if (result.success) {
        setTeam(team.filter(m => m.id !== id));
        showMessage('Membre supprimé avec succès', 'success');
      } else {
        showMessage('Erreur lors de la suppression', 'error');
      }
    } catch (error) {
      showMessage('Erreur de connexion', 'error');
      console.error('Delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Service handlers
  const startEditService = (service) => {
    setEditingId(service.id);
    setFormData(service);
  };

  const saveService = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/services/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        setServices(services.map(s => s.id === editingId ? result.data : s));
        showMessage('Service mis à jour avec succès', 'success');
        cancelEdit();
      } else {
        showMessage('Erreur lors de la mise à jour', 'error');
      }
    } catch (error) {
      showMessage('Erreur de connexion', 'error');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Êtes-vous sûr ?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/services/${id}`, { method: 'DELETE' });
      const result = await response.json();
      
      if (result.success) {
        setServices(services.filter(s => s.id !== id));
        showMessage('Service supprimé avec succès', 'success');
      } else {
        showMessage('Erreur lors de la suppression', 'error');
      }
    } catch (error) {
      showMessage('Erreur de connexion', 'error');
      console.error('Delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Panneau d'Administration
          </h1>
          <p className="text-slate-400 mt-1">Gérez le contenu et les paramètres du site</p>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-6 right-6 p-4 rounded-lg flex items-center gap-3 z-50 ${
            message.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 px-4 font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'settings'
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            Paramètres
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`pb-4 px-4 font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'team'
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            Équipe
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`pb-4 px-4 font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'services'
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            Services
          </button>
        </div>

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-slate-800 rounded-lg p-8 text-white max-w-2xl">
              <h2 className="text-2xl font-bold mb-6">Paramètres du site</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nom de l'entreprise</label>
                  <input
                    type="text"
                    name="company_name"
                    value={settings.company_name || ''}
                    onChange={handleSettingsChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Slogan</label>
                  <input
                    type="text"
                    name="slogan"
                    value={settings.slogan || ''}
                    onChange={handleSettingsChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={settings.email || ''}
                    onChange={handleSettingsChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={settings.phone || ''}
                    onChange={handleSettingsChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Adresse</label>
                  <input
                    type="text"
                    name="address"
                    value={settings.address || ''}
                    onChange={handleSettingsChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                  />
                </div>

                <button
                  onClick={saveSettings}
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-6">
              {team.map(member => (
                <div key={member.id} className="bg-slate-800 rounded-lg p-6 text-white">
                  {editingId === member.id ? (
                    // Edit Form
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Nom"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Rôle"
                        value={formData.role || ''}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                      />
                      <textarea
                        placeholder="Bio"
                        value={formData.bio || ''}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white h-20"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={saveTeamMember}
                          disabled={loading}
                          className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" /> Enregistrer
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">{member.name}</h3>
                        <p className="text-green-400 font-semibold">{member.role}</p>
                        <p className="text-slate-400 mt-2">{member.bio}</p>
                        <p className="text-slate-500 text-sm mt-2">{member.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditTeam(member)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteTeamMember(member.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-6">
              {services.map(service => (
                <div key={service.id} className="bg-slate-800 rounded-lg p-6 text-white">
                  {editingId === service.id ? (
                    // Edit Form
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Titre"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                      />
                      <textarea
                        placeholder="Description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white h-20"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={saveService}
                          disabled={loading}
                          className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" /> Enregistrer
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">{service.title}</h3>
                        <p className="text-slate-400 mt-2">{service.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditService(service)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteService(service.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
