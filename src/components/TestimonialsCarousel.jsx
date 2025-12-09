import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { apiService } from '../api/apiService';

export default function TestimonialsCarousel() {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const autoScrollRef = useRef(null);

  // Fetch testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await apiService.getTestimonials();
        if (Array.isArray(data)) {
          setTestimonials(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des témoignages:', error);
        setIsLoading(false);
      }
    };

    fetchTestimonials();

    // Polling every 30 seconds for updates
    const pollInterval = setInterval(fetchTestimonials, 30000);
    return () => clearInterval(pollInterval);
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (testimonials.length === 0 || isHovering) return;

    autoScrollRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(autoScrollRef.current);
  }, [testimonials.length, isHovering]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 text-lg">Aucun témoignage pour le moment</p>
      </div>
    );
  }

  const currentTestimonial = testimonials[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="flex gap-1 justify-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={20}
            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto px-4"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative">
        {/* Main carousel card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8 md:p-12 relative"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
              {/* Avatar Section */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="flex-shrink-0 w-full md:w-auto flex flex-col items-center md:items-start"
              >
                <div className="w-32 h-32 rounded-full border-4 border-emerald-500 shadow-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center overflow-hidden">
                  {currentTestimonial.image ? (
                    <img
                      src={currentTestimonial.image}
                      alt={currentTestimonial.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Erreur chargement image:', currentTestimonial.image);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-4xl">👤</div>
                  )}
                </div>
                
                {/* Rating */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="mt-6"
                >
                  {renderStars(currentTestimonial.rating || 5)}
                </motion.div>
              </motion.div>

              {/* Content Section */}
              <div className="flex-1 text-center md:text-left">
                {/* Testimonial text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-gray-700 text-lg italic mb-8 leading-relaxed"
                >
                  "{currentTestimonial.testimonial}"
                </motion.p>

                {/* Author info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="border-t border-gray-200 pt-6"
                >
                  <p className="font-semibold text-gray-900 text-lg">
                    {currentTestimonial.name}
                  </p>
                  {currentTestimonial.title && (
                    <p className="text-emerald-600 font-medium">
                      {currentTestimonial.title}
                    </p>
                  )}
                  {currentTestimonial.company && (
                    <p className="text-gray-500 text-sm">
                      {currentTestimonial.company}
                    </p>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <button
          onClick={handlePrevious}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 lg:-translate-x-20 p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors z-10"
          aria-label="Témoignage précédent"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 lg:translate-x-20 p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors z-10"
          aria-label="Témoignage suivant"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-12">
        {testimonials.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
            className={`rounded-full transition-all ${
              index === currentIndex
                ? 'bg-emerald-500 w-3 h-3'
                : 'bg-gray-300 hover:bg-gray-400 w-2 h-2'
            }`}
            aria-label={`Aller au témoignage ${index + 1}`}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="text-center mt-6 text-gray-500 text-sm">
        {currentIndex + 1} / {testimonials.length}
      </div>
    </motion.div>
  );
}
