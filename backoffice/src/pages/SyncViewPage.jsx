import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Download, Upload, Check, AlertCircle, Loader, Database } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Import des données du frontend
const TEAM_DATA = [
  {
    id: 1,
    name: 'Emmanuel Foka Ziegoube',
    title: 'Fondateur & PDG',
    bio: 'Ingénieur en génie logiciel | Lauréat CASAM-INOV, PNUD, ECAM Expert en transformation digitale et innovation sociale.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    is_founder: true,
    specialties: ['Stratégie', 'Innovation', 'Leadership']
  },
  {
    id: 2,
    name: 'Aissatou Diallo',
    title: 'Directrice Technique',
    bio: 'Ingénieure informatique avec 8 ans d\'expérience en développement et architecture cloud.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    is_founder: false,
    specialties: ['Cloud', 'Architecture', 'DevOps']
  },
  {
    id: 3,
    name: 'Jean Kameni',
    title: 'Consultant Transformation',
    bio: 'Consultant en organisation avec expertise dans les processus gouvernementaux et ONG.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    is_founder: false,
    specialties: ['Organisation', 'Processus', 'Gouvernance']
  },
  {
    id: 4,
    name: 'Marie Tagne',
    title: 'Lead Developer Mobile',
    bio: 'Développeuse mobile spécialisée en React Native et Flutter avec passion pour l\'innovation.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    is_founder: false,
    specialties: ['Mobile', 'React Native', 'UX']
  },
  {
    id: 5,
    name: 'Pierre Bouvier',
    title: 'Expert Data & Analytics',
    bio: 'Data scientist avec spécialisation en intelligence décisionnelle et machine learning.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    is_founder: false,
    specialties: ['Data Science', 'BI', 'Machine Learning']
  }
];

export default function SyncViewPage() {
  const [selectedSource, setSelectedSource] = useState('content');
  const [refreshing, setRefreshing] = useState(false);

  // Données du Frontend (content.js)
  const frontendTeam = TEAM_DATA;

  // Récupérer l'équipe du Backend Principal (5000)
  const { data: backendTeam = [], isLoading: backendLoading, refetch: refetchBackend } = useQuery({
    queryKey: ['team', 'backend'],
    queryFn: async () => {
      try {
        const response = await fetch('https://tru-backend-five.vercel.app/api/team');
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Backend Team (5000):', data?.length, 'membres');
          return data || [];
        }
      } catch (error) {
        console.error('❌ Erreur Backend:', error.message);
      }
      return [];
    },
    staleTime: 0,
    cacheTime: 0,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchBackend();
    setTimeout(() => setRefreshing(false), 500);
  };

  const currentTeam = selectedSource === 'content' ? frontendTeam : backendTeam;
  const currentLoading = selectedSource === 'backend' ? backendLoading : false;

  const teamCount = {
    content: frontendTeam.length,
    backend: backendTeam.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            📊 Vue de Synchronisation
          </h1>
          <p className="text-slate-600">
            {selectedSource === 'content' 
              ? 'Affichage de l\'équipe du Frontend (content.js)' 
              : 'Affichage de l\'équipe du Backend (data.json)'}
          </p>
        </motion.div>

        {/* Source Selection & Refresh */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex gap-4 items-center flex-wrap"
        >
          <div className="flex gap-2">
            {[
              { id: 'content', label: 'Frontend (content.js)', count: teamCount.content, icon: '📄' },
              { id: 'backend', label: 'Backend (5000)', count: teamCount.backend, icon: '🗄️' }
            ].map((source) => (
              <motion.button
                key={source.id}
                onClick={() => setSelectedSource(source.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  selectedSource === source.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-400'
                }`}
              >
                <span>{source.icon}</span>
                {source.label}
                <span className="ml-2 inline-block px-2 py-1 rounded-full text-xs font-bold bg-white/20">
                  {source.count}
                </span>
              </motion.button>
            ))}
          </div>

          <motion.button
            onClick={handleRefresh}
            disabled={refreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="ml-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Rafraîchissement...' : 'Rafraîchir'}
          </motion.button>
        </motion.div>

        {/* Team Display */}
        <AnimatePresence mode="wait">
          {currentLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <div className="text-center">
                <Loader className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-600 font-semibold">Chargement des données...</p>
              </div>
            </motion.div>
          ) : currentTeam.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-dashed border-slate-300"
            >
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <p className="text-slate-600 font-semibold text-lg">Aucun membre trouvé</p>
              <p className="text-slate-500 mt-2">La source sélectionnée ne contient pas de données</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {currentTeam.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all group border-l-4 border-emerald-500"
                >
                  {/* Member Image */}
                  {member.image && (
                    <div className="h-48 overflow-hidden bg-slate-200">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  {/* Member Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                        <p className="text-emerald-600 font-semibold">{member.title}</p>
                      </div>
                      {member.is_founder && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                          ⭐ Fondateur
                        </span>
                      )}
                    </div>

                    {/* Bio */}
                    {member.bio && (
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                        {member.bio}
                      </p>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4 text-sm">
                      {member.email && (
                        <p className="text-slate-600">
                          <span className="font-semibold">Email:</span> {member.email}
                        </p>
                      )}
                      {member.phone && (
                        <p className="text-slate-600">
                          <span className="font-semibold">Tél:</span> {member.phone}
                        </p>
                      )}
                      {member.linkedin && (
                        <p className="text-slate-600">
                          <span className="font-semibold">LinkedIn:</span>{' '}
                          <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Profil
                          </a>
                        </p>
                      )}
                    </div>

                    {/* Specialties/Expertise */}
                    {(member.specialties || member.expertise) && (
                      <div className="mb-4">
                        <p className="text-xs font-bold text-slate-900 mb-2">Spécialités:</p>
                        <div className="flex flex-wrap gap-2">
                          {(member.specialties || member.expertise).map((spec, i) => (
                            <span key={i} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Achievements */}
                    {member.achievements && member.achievements.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-bold text-slate-900 mb-2">Réalisations:</p>
                        <div className="flex flex-wrap gap-2">
                          {member.achievements.map((ach, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {ach}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    <div className="pt-4 border-t border-slate-200 flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-slate-600">ID: {member.id}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {[
            { label: 'Frontend (content.js)', count: frontendTeam.length, color: 'emerald', icon: '📄' },
            { label: 'Backend (5000)', count: backendTeam.length, color: 'blue', icon: '🗄️' }
          ].map((stat) => (
            <div key={stat.label} className={`p-4 rounded-lg bg-${stat.color}-50 border border-${stat.color}-200`}>
              <p className={`text-sm font-semibold text-${stat.color}-900 mb-1 flex items-center gap-2`}>
                <span>{stat.icon}</span>
                {stat.label}
              </p>
              <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.count} membres</p>
            </div>
          ))}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-slate-600 text-sm"
        >
          <p>Les données sont synchronisées en temps réel depuis les trois services</p>
        </motion.div>
      </div>
    </div>
  );
}
