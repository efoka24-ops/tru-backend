import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { navItems, siteSettings as defaultSettings, logoUrl } from '../data/content';
import { useAppSettings } from '../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export default function Layout({ children, currentPageName }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { settings } = useAppSettings();
  
  // Utiliser les settings du backend, ou les defaults
  const displaySettings = settings || defaultSettings;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const isHomePage = currentPageName === 'home';

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        :root {
          --primary-color: ${displaySettings.primary_color || '#22c55e'};
          --secondary-color: ${displaySettings.secondary_color || '#16a34a'};
        }
      `}</style>

      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled || !isHomePage
            ? 'bg-white/95 backdrop-blur-lg shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={createPageUrl('home')} className="flex items-center gap-3">
              <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shadow-lg transition-colors duration-300 ${
                isScrolled || !isHomePage
                  ? 'bg-white' 
                  : 'bg-slate-800 border border-slate-700'
              }`}>
                <img 
                  src={logoUrl} 
                  alt={displaySettings.company_name} 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <span className={`font-bold text-lg block leading-tight transition-colors duration-300 ${
                  isScrolled || !isHomePage ? 'text-slate-900' : 'text-white'
                }`}>
                  {displaySettings.company_name}
                </span>
                <span className={`text-xs transition-colors duration-300 ${
                  isScrolled || !isHomePage ? 'text-green-600' : 'text-green-400'
                }`}>
                  {displaySettings.slogan}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                    isScrolled || !isHomePage
                      ? 'text-slate-700 hover:text-green-600 hover:bg-green-50'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="hidden lg:block">
              <Link to={createPageUrl('contact')}>
                <Button size="sm" className="rounded-full">
                  Nous contacter
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden"
            >
              {isMobileMenuOpen ? (
                <X className={`w-6 h-6 ${isScrolled || !isHomePage ? 'text-slate-900' : 'text-white'}`} />
              ) : (
                <Menu className={`w-6 h-6 ${isScrolled || !isHomePage ? 'text-slate-900' : 'text-white'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-slate-200"
            >
              <div className="px-6 py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className="block px-4 py-2 rounded-lg text-slate-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
                <Link to={createPageUrl('contact')} className="block pt-2">
                  <Button className="w-full rounded-full">
                    Nous contacter
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center shadow-lg border border-slate-700">
                  <img 
                    src={logoUrl} 
                    alt={displaySettings.company_name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{displaySettings.company_name}</h3>
                  <p className="text-green-400 text-sm">{displaySettings.slogan}</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                {settings?.description || "Cabinet de conseil et d'ingénierie digitale dédié à la transformation numérique en Afrique."}
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-bold text-lg mb-4">Services</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to={createPageUrl('services')} className="hover:text-green-400 transition-colors">Conseil & Organisation</Link></li>
                <li><Link to={createPageUrl('services')} className="hover:text-green-400 transition-colors">Transformation digitale</Link></li>
                <li><Link to={createPageUrl('services')} className="hover:text-green-400 transition-colors">Développement d'apps</Link></li>
                <li><Link to={createPageUrl('services')} className="hover:text-green-400 transition-colors">Formation</Link></li>
              </ul>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="font-bold text-lg mb-4">Solutions</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to={createPageUrl('solutions')} className="hover:text-green-400 transition-colors">MokineVeto</Link></li>
                <li><Link to={createPageUrl('solutions')} className="hover:text-green-400 transition-colors">Mokine</Link></li>
                <li><Link to={createPageUrl('solutions')} className="hover:text-green-400 transition-colors">MokineKid</Link></li>
              </ul>
            </div>

            {/* Actualités & Recrutement */}
            <div>
              <h4 className="font-bold text-lg mb-4">Entreprise</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to={createPageUrl('news')} className="hover:text-green-400 transition-colors">Actualités</Link></li>
                <li><Link to={createPageUrl('careers')} className="hover:text-green-400 transition-colors">Offres d'emploi</Link></li>
                <li><Link to={createPageUrl('about')} className="hover:text-green-400 transition-colors">À propos</Link></li>
                <li><Link to={createPageUrl('team')} className="hover:text-green-400 transition-colors">Notre équipe</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <div className="space-y-3 text-sm text-slate-400">
                {settings?.phone && (
                  <div>
                    <p className="text-white font-semibold mb-1">Téléphone</p>
                    <a href={`tel:${settings.phone}`} className="hover:text-green-400 transition-colors">
                      {settings.phone}
                    </a>
                  </div>
                )}
                {settings?.email && (
                  <div>
                    <p className="text-white font-semibold mb-1">Email</p>
                    <a href={`mailto:${settings.email}`} className="hover:text-green-400 transition-colors">
                      {settings.email}
                    </a>
                  </div>
                )}
                {settings?.address && (
                  <div>
                    <p className="text-white font-semibold mb-1">Adresse</p>
                    <p>{settings.address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
              <p>© 2025 {settings?.company_name || displaySettings.company_name}. Tous droits réservés.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                {settings?.socialMedia?.facebook && (
                  <a href={settings.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">Facebook</a>
                )}
                {settings?.socialMedia?.linkedin && (
                  <a href={settings.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">LinkedIn</a>
                )}
                {settings?.socialMedia?.twitter && (
                  <a href={settings.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">Twitter</a>
                )}
                {settings?.socialMedia?.instagram && (
                  <a href={settings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">Instagram</a>
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
