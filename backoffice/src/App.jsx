import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminLayout from './components/AdminLayout'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import EquipeSimplePage from './pages/EquipeSimplePage'
import ServicesPage from './pages/ServicesPage'
import SolutionsPage from './pages/SolutionsPage'
import ContactsPage from './pages/ContactsPage'
import TestimonialsPage from './pages/TestimonialsPage'
import NewsPage from './pages/NewsPage'
import JobsPage from './pages/JobsPage'
import ApplicationsPage from './pages/ApplicationsPage'
import SettingsPage from './pages/SettingsPage'
import SyncViewPage from './pages/SyncViewPage'
import './index.css'

const queryClient = new QueryClient()

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-orange-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {!isAuthenticated ? (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <AdminLayout onLogout={handleLogout}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/equipe" element={<EquipeSimplePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/solutions" element={<SolutionsPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/testimonials" element={<TestimonialsPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/sync" element={<SyncViewPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AdminLayout>
        )}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
