import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { backendClient } from '@/api/backendClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Upload, ArrowUp, ArrowDown, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function EquipePage() {
  const [isEditingDialog, setIsEditingDialog] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newExpertise, setNewExpertise] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [notification, setNotification] = useState(null);

  const queryClient = useQueryClient();

  // URLs de configuration pour les différents services
  const BACKEND_API_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api`;
  const FRONTEND_API_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api`;
  const TRU_SITE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api`;

  // Récupérer les données du frontend d'abord
  const fetchFrontendTeam = async (source = 'default') => {
    try {
      const response = await fetch(`${FRONTEND_API_URL}/team`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Source': source
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Données équipe récupérées du frontend:', data?.length || 0, 'membres');
        return data || [];
      }
    } catch (error) {
      console.warn('⚠️ Frontend API not available:', error.message);
    }
    return [];
  };
  // Récupérer du backend principal (port 5000)
  const fetchBackendTeam = async () => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/team`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Données équipe récupérées du backend principal:', data?.length || 0, 'membres');
        return data || [];
      }
    } catch (error) {
      console.warn('⚠️ Backend API not available:', error.message);
    }
    return [];
  };

  // Récupérer également depuis le site TRU principal
  const fetchTRUSiteTeam = async () => {
    try {
      const response = await fetch(`${TRU_SITE_URL}/team`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Données équipe récupérées du site TRU:', data?.length || 0, 'membres');
        return data || [];
      }
    } catch (error) {
      console.warn('⚠️ Site TRU API not available:', error.message);
    }
    return [];
  };

  const { data: teamMembers = [], isLoading, refetch } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      // Essayer le backend principal d'abord
      const backendData = await fetchBackendTeam();
      if (backendData.length > 0) {
        return backendData;
      }

      // Essayer le site TRU
      const truData = await fetchTRUSiteTeam();
      if (truData.length > 0) {
        return truData;
      }

      // Essayer le frontend
      const frontendData = await fetchFrontendTeam('query');
      if (frontendData.length > 0) {
        return frontendData;
      }

      // Sinon, utiliser le backend base44
      try {
        const backendBase44Data = await base44.entities.TeamMember.list('display_order');
        console.log('✅ Données équipe récupérées du backend base44:', backendBase44Data?.length || 0, 'membres');
        return backendBase44Data || [];
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des données:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const showNotification = (message, type = 'success', duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  // Envoyer une mise à jour à tous les services
  const syncTeamToFrontend = async (action, member) => {
    // Normalize member data - convert photo_url to image for backend compatibility
    const normalizedMember = {
      ...member,
      image: member.photo_url || member.image,  // Ensure 'image' field for backend
    };
    delete normalizedMember.photo_url; // Remove photo_url to avoid duplication

    const payload = {
      action,
      member: normalizedMember,
      timestamp: new Date().toISOString(),
      source: 'backoffice'
    };

    // Synchroniser avec le backend principal (port 5000)
    try {
      if (action === 'create') {
        await fetch(`${BACKEND_API_URL}/team`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(normalizedMember)
        });
        console.log(`✅ Membre créé et synchronisé au backend principal`);
      } else if (action === 'update' && normalizedMember.id) {
        await fetch(`${BACKEND_API_URL}/team/${normalizedMember.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(normalizedMember)
        });
        console.log(`✅ Membre modifié et synchronisé au backend principal`);
      } else if (action === 'delete' && normalizedMember.id) {
        await fetch(`${BACKEND_API_URL}/team/${normalizedMember.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        console.log(`✅ Membre supprimé du backend principal`);
      }
    } catch (error) {
      console.warn('⚠️ Backend principal sync skipped:', error.message);
    }

    // Notifier le frontend admin
    try {
      await fetch(`${FRONTEND_API_URL}/team-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log(`✅ Notification ${action} envoyée au frontend admin`);
    } catch (error) {
      console.warn('⚠️ Frontend admin notification skipped:', error.message);
    }

    // Notifier le site TRU principal
    try {
      await fetch(`${TRU_SITE_URL}/team-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log(`✅ Notification ${action} envoyée au site TRU`);
    } catch (error) {
      console.warn('⚠️ Site TRU notification skipped:', error.message);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.entities.TeamMember.create(data);
      // Synchroniser avec le frontend et le site TRU
      await syncTeamToFrontend('create', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      refetch();
      setIsEditingDialog(false);
      setEditingMember(null);
      showNotification('✅ Membre ajouté et synchronisé!', 'success');
    },
    onError: (error) => {
      showNotification('❌ Erreur lors de l\'ajout: ' + (error.message || 'Erreur inconnue'), 'error', 4000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const result = await base44.entities.TeamMember.update(id, data);
      // Synchroniser avec le frontend et le site TRU
      await syncTeamToFrontend('update', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      refetch();
      setIsEditingDialog(false);
      setEditingMember(null);
      showNotification('✅ Membre modifié et synchronisé!', 'success');
    },
    onError: (error) => {
      showNotification('❌ Erreur lors de la modification: ' + (error.message || 'Erreur inconnue'), 'error', 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const result = await base44.entities.TeamMember.delete(id);
      // Synchroniser la suppression avec les services
      await syncTeamToFrontend('delete', { id });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      refetch();
      setDeleteConfirm(null);
      showNotification('✅ Membre supprimé et synchronisé!', 'success');
    },
    onError: (error) => {
      showNotification('❌ Erreur lors de la suppression: ' + (error.message || 'Erreur inconnue'), 'error', 4000);
    },
  });

  const handleSave = () => {
    if (!editingMember.name?.trim()) {
      showNotification('Le nom est obligatoire', 'error');
      return;
    }
    if (!editingMember.role?.trim()) {
      showNotification('La fonction est obligatoire', 'error');
      return;
    }

    if (editingMember.id) {
      updateMutation.mutate({ id: editingMember.id, data: editingMember });
    } else {
      createMutation.mutate({ ...editingMember, display_order: teamMembers.length });
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convertir en base64 data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64DataUrl = event.target.result; // Already formatted as data:image/...;base64,...
        setPhotoPreview(base64DataUrl);
        // Store the base64 data URL directly - no need to upload
        setEditingMember({ ...editingMember, photo_url: base64DataUrl });
        showNotification('Photo chargée avec succès!', 'success', 2000);
      };
      reader.onerror = () => {
        showNotification('Erreur lors de la lecture du fichier', 'error', 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const addExpertise = () => {
    if (newExpertise.trim()) {
      setEditingMember({
        ...editingMember,
        expertise: [...(editingMember.expertise || []), newExpertise.trim()]
      });
      setNewExpertise('');
    }
  };

  const removeExpertise = (index) => {
    setEditingMember({
      ...editingMember,
      expertise: editingMember.expertise.filter((_, i) => i !== index)
    });
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setEditingMember({
        ...editingMember,
        achievements: [...(editingMember.achievements || []), newAchievement.trim()]
      });
      setNewAchievement('');
    }
  };

  const removeAchievement = (index) => {
    setEditingMember({
      ...editingMember,
      achievements: editingMember.achievements.filter((_, i) => i !== index)
    });
  };

  const moveMember = async (member, direction) => {
    const currentIndex = teamMembers.findIndex(m => m.id === member.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= teamMembers.length) return;

    const otherMember = teamMembers[newIndex];
    
    try {
      await updateMutation.mutateAsync({ 
        id: member.id, 
        data: { display_order: newIndex } 
      });
      await updateMutation.mutateAsync({ 
        id: otherMember.id, 
        data: { display_order: currentIndex } 
      });
    } catch (error) {
      showNotification('Erreur lors du réordonnancement', 'error');
    }
  };

  const openEditDialog = (member) => {
    setEditingMember({ ...member });
    setPhotoPreview(member.photo_url);
    setIsEditingDialog(true);
  };

  const openNewDialog = () => {
    setEditingMember({
      name: '',
      role: '',
      description: '',
      photo_url: '',
      email: '',
      phone: '',
      linkedin: '',
      expertise: [],
      achievements: [],
      is_founder: false,
      is_visible: true
    });
    setPhotoPreview(null);
    setIsEditingDialog(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 rounded-lg px-6 py-4 flex items-center gap-3 shadow-lg border ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Administration</h1>
        <p className="text-slate-600">Gérez le contenu de votre site TRU GROUP</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 mb-8 border-b border-slate-200">
        <div className="pb-4 border-b-2 border-emerald-600 font-semibold text-slate-900 flex items-center gap-2">
          👥 Équipe
        </div>
        <div className="pb-4 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-2">
          💬 Témoignages
        </div>
        <div className="pb-4 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-2">
          ⚙️ Paramètres
        </div>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Membres de l'équipe</h2>
            <p className="text-sm text-slate-600 mt-1">{teamMembers.length} membre{teamMembers.length !== 1 ? 's' : ''}</p>
          </div>
          <Button
            onClick={openNewDialog}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 px-6 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Ajouter un membre
          </Button>
        </div>

        <div className="p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full mb-4"
              />
              <p className="text-slate-600 font-medium">Chargement des membres...</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 mb-6 font-medium">Aucun membre ajouté</p>
              <Button
                onClick={openNewDialog}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Ajouter le premier membre
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group"
                >
                  {/* Order Buttons */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => moveMember(member, 'up')}
                      disabled={index === 0}
                      className="p-1.5 hover:bg-emerald-100 rounded disabled:opacity-20 transition-colors"
                      title="Monter"
                    >
                      <ArrowUp className="w-4 h-4 text-emerald-600" />
                    </button>
                    <button
                      onClick={() => moveMember(member, 'down')}
                      disabled={index === teamMembers.length - 1}
                      className="p-1.5 hover:bg-emerald-100 rounded disabled:opacity-20 transition-colors"
                      title="Descendre"
                    >
                      <ArrowDown className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>

                  {/* Photo */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-2xl">
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-lg">{member.name}</h3>
                      {member.is_founder && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                          Fondateur
                        </span>
                      )}
                    </div>
                    <p className="text-emerald-600 font-semibold text-sm">{member.role}</p>
                    {member.description && (
                      <p className="text-slate-600 text-sm mt-2 line-clamp-1">{member.description}</p>
                    )}
                    {(member.expertise?.length > 0 || member.achievements?.length > 0) && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {member.expertise?.slice(0, 2).map((exp, i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                            {exp}
                          </span>
                        ))}
                        {member.expertise?.length > 2 && (
                          <span className="px-2 py-0.5 text-slate-600 text-xs">+{member.expertise.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => openEditDialog(member)}
                      className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-emerald-600"
                      title="Modifier"
                    >
                      <Edit2 className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setDeleteConfirm(member)}
                      className="p-2.5 hover:bg-red-50 rounded-lg transition-colors text-red-600 hover:text-red-700"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={isEditingDialog} onOpenChange={setIsEditingDialog}>
        <DialogContent className="w-[600px] h-[792px] overflow-y-auto p-0 gap-0">
          <DialogHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b border-emerald-200 sticky top-0 z-10">
            <DialogTitle className="text-2xl text-slate-900">
              {editingMember?.id ? '✏️ Modifier le membre' : '➕ Ajouter un nouveau membre'}
            </DialogTitle>
          </DialogHeader>

          {editingMember && (
            <div className="space-y-6 p-6">
              {/* Photo Upload Section */}
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <Label className="font-bold text-slate-900 mb-4 block text-lg">📸 Photo de profil</Label>
                <div className="flex gap-8 items-center">
                  {photoPreview && (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="w-32 h-32 rounded-lg overflow-hidden shadow-md border-2 border-emerald-200 flex-shrink-0"
                    >
                      <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                    </motion.div>
                  )}
                  <label className="cursor-pointer flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <div className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2 font-semibold justify-center w-full">
                      <Upload className="w-5 h-5" />
                      {photoPreview ? 'Changer la photo' : 'Uploader une photo'}
                    </div>
                  </label>
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <Label className="font-bold text-slate-900 mb-4 block text-lg">👤 Informations personnelles</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Nom complet *</label>
                    <Input
                      value={editingMember.name}
                      onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                      placeholder="Ex: Emmanuel Foka"
                      className="border-2 border-slate-200 focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Fonction *</label>
                    <Input
                      value={editingMember.role}
                      onChange={(e) => setEditingMember({...editingMember, role: e.target.value})}
                      placeholder="Ex: Fondateur & PDG"
                      className="border-2 border-slate-200 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 mb-1 block">📝 Description</label>
                <Textarea
                  value={editingMember.description || ''}
                  onChange={(e) => setEditingMember({...editingMember, description: e.target.value})}
                  placeholder="Courte biographie ou présentation..."
                  rows={4}
                  className="border-2 border-slate-200 focus:border-emerald-500"
                />
              </div>

              {/* Contact Info */}
              <div>
                <Label className="font-bold text-slate-900 mb-4 block text-lg">📞 Informations de contact</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email</label>
                    <Input
                      type="email"
                      value={editingMember.email || ''}
                      onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                      placeholder="email@example.com"
                      className="border-2 border-slate-200 focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Téléphone</label>
                    <Input
                      value={editingMember.phone || ''}
                      onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
                      placeholder="+237 6XX XXX XXX"
                      className="border-2 border-slate-200 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* LinkedIn */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">LinkedIn</label>
                <Input
                  value={editingMember.linkedin || ''}
                  onChange={(e) => setEditingMember({...editingMember, linkedin: e.target.value})}
                  placeholder="https://linkedin.com/in/..."
                  className="border-2 border-slate-200 focus:border-emerald-500"
                />
              </div>

              {/* Expertise */}
              <div>
                <Label className="font-bold text-slate-900 mb-4 block text-lg">🎯 Expertise & Compétences</Label>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    placeholder="Ex: React, Node.js, Leadership"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                    className="border-2 border-slate-200 focus:border-emerald-500"
                  />
                  <Button
                    onClick={addExpertise}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(editingMember.expertise || []).map((exp, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.8 }}
                      className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm"
                    >
                      {exp}
                      <button onClick={() => removeExpertise(i)} className="hover:opacity-70">
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <Label className="font-bold text-slate-900 mb-4 block text-lg">🏆 Réalisations & Succès</Label>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    placeholder="Ex: 10 ans d'expérience, Prix innovation 2024"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                    className="border-2 border-slate-200 focus:border-emerald-500"
                  />
                  <Button
                    onClick={addAchievement}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(editingMember.achievements || []).map((ach, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.8 }}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm"
                    >
                      {ach}
                      <button onClick={() => removeAchievement(i)} className="hover:opacity-70">
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Visibility Toggle */}
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 flex items-center gap-3">
                <Switch
                  checked={editingMember.is_visible !== false}
                  onCheckedChange={(checked) => setEditingMember({...editingMember, is_visible: checked})}
                />
                <div>
                  <Label className="font-semibold text-slate-900">Visible sur le site</Label>
                  <p className="text-xs text-slate-600">Activer pour afficher ce membre sur le site public</p>
                </div>
              </div>

              {/* Founder Toggle */}
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 flex items-center gap-3">
                <Switch
                  checked={editingMember.is_founder !== false}
                  onCheckedChange={(checked) => setEditingMember({...editingMember, is_founder: checked})}
                />
                <div>
                  <Label className="font-semibold text-slate-900">Fondateur</Label>
                  <p className="text-xs text-slate-600">Marquer comme fondateur de l'entreprise</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => setIsEditingDialog(false)}
                  className="px-6 border-2 border-slate-300 hover:border-slate-400"
                >
                  ❌ Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!editingMember.name?.trim() || !editingMember.role?.trim() || createMutation.isPending || updateMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {createMutation.isPending || updateMutation.isPending ? 'Sauvegarde...' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="border-2 border-red-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 text-xl">Supprimer ce membre ?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              <span className="font-semibold text-slate-900">{deleteConfirm?.name}</span> sera supprimé définitivement. Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2 border-slate-300">Non, garder</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteConfirm.id)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
