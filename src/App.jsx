import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
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

export default function App() {
  const location = useLocation();

  // Get current page name from path
  const getCurrentPageName = () => {
    const path = location.pathname.toLowerCase().slice(1) || 'home';
    return path;
  };

  return (
    <SettingsProvider>
      <>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        <Layout currentPageName={getCurrentPageName()}>
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
    </SettingsProvider>
  );
}
