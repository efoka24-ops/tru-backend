import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService } from '../api/apiService';

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNews = async () => {
    try {
      const data = await apiService.getNews();
      setNews(data || []);
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur:', error);
      setLoading(false);
    }
  };

  const handleReadMore = (article, index) => {
    setSelectedArticle(article);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex !== null && currentIndex < news.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedArticle(news[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (currentIndex !== null && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setSelectedArticle(news[prevIndex]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'Escape') setSelectedArticle(null);
  };

  return (
    <div className="min-h-screen bg-white" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-r from-slate-900 to-slate-800 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-600 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Actualités TRU GROUP
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Suivez les dernières nouvelles, projets et mises à jour de notre cabinet
            </p>
          </motion.div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">Aucune actualité pour le moment</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {/* Image */}
                  {item.image && (
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img
                        src={`http://localhost:5000${item.image}`}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-emerald-600 text-sm mb-3">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                      {item.description}
                    </p>

                    {/* Category */}
                    {item.category && (
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                          {item.category}
                        </span>
                      </div>
                    )}

                    {/* Read More */}
                    <button 
                      onClick={() => handleReadMore(item, index)}
                      className="flex items-center gap-2 text-emerald-600 font-semibold hover:gap-3 transition-all"
                    >
                      Lire plus <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-96 overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-lg transition-colors z-10"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>

              {/* Image */}
              {selectedArticle.image && (
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <img
                    src={`http://localhost:5000${selectedArticle.image}`}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className="p-8">
                {/* Header Info */}
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <div className="flex items-center gap-2 text-emerald-600 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedArticle.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    {selectedArticle.category && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                        {selectedArticle.category}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                    {selectedArticle.title}
                  </h1>
                  <p className="text-slate-600 text-lg">
                    {selectedArticle.description}
                  </p>
                </div>

                {/* Article Body */}
                <div className="prose prose-sm max-w-none mb-8">
                  <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selectedArticle.content || selectedArticle.description}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Précédent
                  </button>

                  <div className="text-sm text-slate-600">
                    <span className="font-semibold">{currentIndex + 1}</span> / <span>{news.length}</span>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={currentIndex === news.length - 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Keyboard Hint */}
                <div className="text-xs text-slate-500 text-center mt-4">
                  Utilisez les flèches ← → pour naviguer ou Échap pour fermer
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}