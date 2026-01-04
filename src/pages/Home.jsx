import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { siteSettings as defaultSettings, solutions } from '../data/content';
import { useAppSettings } from '../context/SettingsContext';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Building2, 
  Users, 
  Lightbulb, 
  Globe,
  Smartphone,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Button } from "../components/Button";

export default function Home() {
  const { settings } = useAppSettings();
  const displaySettings = settings || defaultSettings;
  const features = [
    { icon: Building2, title: "Conseil en organisation", desc: "Audit et optimisation des processus" },
    { icon: Smartphone, title: "Transformation digitale", desc: "E-administration et solutions numériques" },
    { icon: Users, title: "Développement web & mobile", desc: "Applications sur mesure" },
    { icon: Sparkles, title: "Télémédecine vétérinaire", desc: "MokineVeto pour les éleveurs" },
    { icon: Globe, title: "Traçabilité & IoT", desc: "Mokine et MokineKid" },
    { icon: GraduationCap, title: "Formation", desc: "Renforcement des capacités" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-600 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32 w-full h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-green-400 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Au cœur de l'innovation
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Innovation digitale
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-500">
                adaptée à l'Afrique
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-10 mx-auto">
              Nous accompagnons les institutions, entreprises et communautés dans leur transition numérique grâce à des solutions technologiques innovantes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('services')}>
                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-6 text-lg rounded-full">
                  Découvrir nos services
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl('contact')}>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full">
                  Nous contacter
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              { icon: Lightbulb, title: "Notre mission", text: "Rendre le digital accessible, utile et durable pour tous.", color: "bg-green-500" },
              { icon: Users, title: "Notre force", text: "Allier expertise organisationnelle et ingénierie digitale.", color: "bg-blue-600" },
              { icon: Globe, title: "Notre vision", text: "Devenir le cabinet de référence en Afrique francophone.", color: "bg-emerald-600" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Domaines d'excellence */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Nos domaines d'excellence
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Une expertise complète pour accompagner votre transformation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <feature.icon className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Nos solutions innovantes
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Des technologies conçues pour les réalités africaines
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((solution, index) => {
              const bgGradients = [
                'from-teal-600 to-teal-800',
                'from-blue-600 to-blue-800',
                'from-amber-600 to-orange-800'
              ];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className={`bg-gradient-to-br ${bgGradients[index]} rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500`}
                >
                  <div className="p-8 h-full flex flex-col">
                    <span className="text-5xl mb-6 block">{solution.icon}</span>
                    <h3 className="text-2xl font-bold text-white mb-2">{solution.name}</h3>
                    <p className="text-gray-200 font-medium mb-4">{solution.subtitle}</p>
                    <p className="text-gray-300 mb-6 flex-grow">{solution.description}</p>
                    
                    <Link to={createPageUrl('solutions')} className="inline-flex items-center gap-2 text-white font-medium hover:text-green-300 transition-colors">
                      En savoir plus
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-green-500">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Prêt à transformer votre organisation ?
            </h2>
            <p className="text-lg text-white/90 mb-10">
              Discutons ensemble de vos besoins et trouvons la solution adaptée à vos enjeux.
            </p>
            <Link to={createPageUrl('contact')}>
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-10 py-6 text-lg rounded-full">
                Contactez-nous
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
