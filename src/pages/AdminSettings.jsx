import React, { useState, useEffect } from 'react';
import { Save, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

//const API_BASE = 'http://localhost:5000/api';
const API_BASE = 'https://tru-backend-five.vercel.app/';
export default function AdminSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '', show: false });

  const [formData, setFormData] = useState({
    company_name: '',
    slogan: '',
    phone: '',
    email: '',
    address: '',
    primary_color: '',
    logo_url: '',
    facebook_url: '',
    linkedin_url: '',
    twitter_url: ''
  });

  useEffect(() => {
    loadSettings();
    const timer = setInterval(() => {
      if (message.show) setMessage({ ...message, show: false });
    }, 4000);
    return () => clearInterval(timer);
  }, [message.show]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/settings`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data || {});
        showMessage('Paramètres chargés', 'success');
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

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showMessage('Paramètres sauvegardés avec succès', 'success');
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

  if (isLoading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Paramètres généraux</h1>

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

        <div className="bg-white rounded-lg shadow p-8">
          <div className="space-y-6">
            {/* Informations générales */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold mb-4">Informations générales</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nom de l'entreprise"
                  value={formData.company_name || ''}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Slogan"
                  value={formData.slogan || ''}
                  onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Adresse"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold mb-4">Contact</h2>
              <div className="space-y-4">
                <input
                  type="tel"
                  placeholder="Téléphone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>

            {/* Design */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold mb-4">Design</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={formData.primary_color || '#22c55e'}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="h-12 w-20 border rounded cursor-pointer"
                  />
                  <label className="flex-1">Couleur principale</label>
                </div>
                <input
                  type="text"
                  placeholder="URL du logo"
                  value={formData.logo_url || ''}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div>
              <h2 className="text-xl font-bold mb-4">Réseaux sociaux</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="URL Facebook"
                  value={formData.facebook_url || ''}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="URL LinkedIn"
                  value={formData.linkedin_url || ''}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="URL Twitter"
                  value={formData.twitter_url || ''}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={loadSettings}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Réinitialiser
            </button>
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={20} /> {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
