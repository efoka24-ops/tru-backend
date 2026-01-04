import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { SettingsProvider, useAppSettings } from './context/SettingsContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Solutions from './pages/Solutions';
import Team from './pages/Team';
import Contact from './pages/Contact';
import News from './pages/News';
import Careers from './pages/Careers';
import AdminDashboard from './pages/AdminDashboard';
import MemberLogin from './pages/MemberLogin';
import MemberProfile from './pages/MemberProfile';
import Maintenance from './pages/Maintenance';
import { ProtectedRoute } from './components/ProtectedRoute';
import { getAllBackendData } from './data/backendData';

// Composant qui affiche le contenu avec vérification maintenance
function AppContent() {
  const { settings } = useAppSettings();
  const location = useLocation();
  
  const getCurrentPageName = () => {
    const path = location.pathname.toLowerCase().slice(1) || 'home';
    return path;
  };
  
  // Si mode maintenance actif et pas en admin, afficher la page maintenance
  if (settings?.maintenanceMode && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/member')) {
    return <Maintenance />;
  }

  return (
    <>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/member/login" element={<MemberLogin />} />
        <Route 
          path="/member/dashboard" 
          element={
            <ProtectedRoute>
              <MemberProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/member/profile" 
          element={
            <ProtectedRoute>
              <MemberProfile />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <Layout currentPageName={getCurrentPageName(location)}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/team" element={<Team />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/news" element={<News />} />
          <Route path="/careers" element={<Careers />} />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </>
  );
}

export default function App() {
  // Charger les données du backend au démarrage
  useEffect(() => {
    console.log('🔄 Chargement des données du backend...');
    getAllBackendData().then((data) => {
      console.log('✅ Données du backend chargées:', data);
      // Stocker dans sessionStorage pour accès rapide
      sessionStorage.setItem('backendData', JSON.stringify(data));
    }).catch((error) => {
      console.warn('⚠️ Erreur lors du chargement des données:', error);
    });
  }, []);

  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
