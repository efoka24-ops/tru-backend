import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Briefcase, MessageSquare, Settings, FileText } from 'lucide-react';

export default function AdminNav() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100';

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-green-600">Backoffice TRU GROUP</h1>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Link
            to="/admin/team"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${isActive('/admin/team')}`}
          >
            <Users size={20} /> Équipe
          </Link>
          <Link
            to="/admin/services"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${isActive('/admin/services')}`}
          >
            <Briefcase size={20} /> Services
          </Link>
          <Link
            to="/admin/solutions"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${isActive('/admin/solutions')}`}
          >
            <Briefcase size={20} /> Solutions
          </Link>
          <Link
            to="/admin/testimonials"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${isActive('/admin/testimonials')}`}
          >
            <MessageSquare size={20} /> Témoignages
          </Link>
          <Link
            to="/admin/content"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${isActive('/admin/content')}`}
          >
            <FileText size={20} /> Contenus
          </Link>
          <Link
            to="/admin/settings"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${isActive('/admin/settings')}`}
          >
            <Settings size={20} /> Paramètres
          </Link>
        </div>
      </div>
    </nav>
  );
}
