import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex justify-center mb-8"
        >
          <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <Clock className="w-12 h-12 text-yellow-400" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4"
        >
          Maintenance en cours
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl md:text-2xl text-slate-400 mb-8"
        >
          Nous améliorons notre site pour vous offrir une meilleure expérience.
        </motion.p>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 mb-8"
        >
          <div className="flex items-start gap-4 mb-6">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="text-left">
              <p className="text-slate-300 text-lg">
                Le site TRU GROUP est actuellement en mode maintenance. Nous travaillons dur pour revenir en ligne avec de meilleures fonctionnalités et performances.
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            Merci de votre patience et de votre compréhension. Nous serons de retour très bientôt!
          </p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-green-500 rounded-full"
              animate={{ y: [-8, 0, -8] }}
              transition={{
                delay: i * 0.15,
                duration: 0.8,
                repeat: Infinity
              }}
            />
          ))}
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <p className="text-slate-500 text-sm">
            Pour toute question urgente, contactez-nous à:
          </p>
          <a
            href="mailto:info@trugroup.cm"
            className="text-green-400 hover:text-green-300 transition-colors text-lg font-semibold mt-2"
          >
            info@trugroup.cm
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
