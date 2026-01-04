import React, { useEffect } from 'react';
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

function AppContent() {
  const { settings } = useAppSettings();
  const location = useLocation();
  
  if (settings?.maintenanceMode && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/member')) {
    return <Maintenance />;
  }

  return (
    <Routes>
      {/* Admin Routes */}
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
      
      {/* Public Routes with Layout */}
      <Route path="/" element={<Layout currentPageName="home"><Home /></Layout>} />
      <Route path="/home" element={<Layout currentPageName="home"><Home /></Layout>} />
      <Route path="/about" element={<Layout currentPageName="about"><About /></Layout>} />
      <Route path="/services" element={<Layout currentPageName="services"><Services /></Layout>} />
      <Route path="/solutions" element={<Layout currentPageName="solutions"><Solutions /></Layout>} />
      <Route path="/team" element={<Layout currentPageName="team"><Team /></Layout>} />
      <Route path="/contact" element={<Layout currentPageName="contact"><Contact /></Layout>} />
      <Route path="/news" element={<Layout currentPageName="news"><News /></Layout>} />
      <Route path="/careers" element={<Layout currentPageName="careers"><Careers /></Layout>} />
      
      {/* Catch all */}
      <Route path="*" element={<Layout currentPageName="home"><Home /></Layout>} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    console.log('🔄 Chargement des données du backend...');
    getAllBackendData().then((data) => {
      console.log('✅ Données du backend chargées:', data);
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
