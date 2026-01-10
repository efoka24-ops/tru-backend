import logoUrl from '../assets/trugroup-logo.png';

// Exported logo for use throughout the app
export { logoUrl };

export const siteSettings = {
  company_name: 'TRU GROUP',
  slogan: 'Au cœur de l\'innovation',
  phone: '+237 691 22 71 49',
  email: 'info@trugroup.cm',
  address: 'Garoua, Cameroun',
  primary_color: '#22c55e',
  logo_url: logoUrl,
  facebook_url: '#',
  linkedin_url: '#',
  twitter_url: '#'
};

export const navItems = [
  { name: 'Accueil', page: 'home' },
  { name: 'À propos', page: 'about' },
  { name: 'Services', page: 'services' },
  { name: 'Solutions', page: 'solutions' },
  { name: 'Équipe', page: 'team' },
  { name: 'Contact', page: 'contact' }
];

export const services = [
  {
    id: 1,
    icon: 'Building2',
    title: 'Conseil & Organisation',
    description: 'Nous accompagnons les institutions dans leur modernisation organisationnelle.',
    features: [
      'Audit organisationnel',
      'Cartographie et optimisation des processus',
      'Rédaction de manuels et procédures',
      'Conduite du changement'
    ],
    objective: 'Rendre les organisations plus efficientes, modernes et transparentes.',
    color: 'from-blue-500 to-indigo-600',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop'
  },
  {
    id: 2,
    icon: 'Monitor',
    title: 'Transformation digitale',
    description: 'Nous concevons et déployons des solutions numériques adaptées à vos besoins.',
    features: [
      'Digitalisation des services publics',
      'E-administration',
      'Outils de gestion',
      'Tableaux de bord décisionnels'
    ],
    objective: 'Rendre la technologie accessible et durable.',
    color: 'from-amber-500 to-orange-600',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop'
  },
  {
    id: 3,
    icon: 'Smartphone',
    title: 'Développement d\'applications',
    description: 'Nous créons des plateformes et applications sur mesure.',
    features: [
      'Applications mobiles',
      'Plateformes web',
      'Systèmes d\'information sectoriels',
      'Outils SaaS'
    ],
    objective: 'Concevoir des solutions sur mesure, scalables et sécurisées.',
    color: 'from-emerald-500 to-teal-600',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop'
  },
  {
    id: 4,
    icon: 'ClipboardCheck',
    title: 'Gestion de projet & assistance technique',
    description: 'Nous mettons à disposition des experts pour garantir le succès de vos projets.',
    features: [
      'Gestion de projet',
      'Pilotage stratégique',
      'Suivi-évaluation',
      'Coordination multisectorielle'
    ],
    objective: 'Garantir la réussite de chaque projet.',
    color: 'from-purple-500 to-violet-600',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop'
  },
  {
    id: 5,
    icon: 'GraduationCap',
    title: 'Formation & renforcement des capacités',
    description: 'Nous proposons des formations professionnelles adaptées.',
    features: [
      'Gestion de projet (classique & agile)',
      'Outils numériques',
      'Data & intelligence décisionnelle',
      'Leadership et innovation'
    ],
    objective: 'Renforcer l\'employabilité des jeunes et cadres locaux.',
    color: 'from-pink-500 to-rose-600',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=600&fit=crop'
  }
];

export const solutions = [
  {
    name: 'MokineVeto',
    subtitle: 'Télémédecine vétérinaire',
    description: 'Consultations vétérinaires en ligne, géolocalisation du bétail et détection précoce des maladies.',
    longDescription: 'Un outil digital permettant aux éleveurs d\'accéder à des consultations vétérinaires en ligne, la géolocalisation du bétail, la détection précoce des maladies et des conseils en santé animale. Une innovation majeure pour les zones rurales.',
    color: 'from-emerald-500 to-teal-600',
    icon: '🐄',
    features: ['Consultations en ligne', 'Géolocalisation bétail', 'Détection maladies', 'Conseils santé animale']
  },
  {
    name: 'Mokine',
    subtitle: 'Traçabilité & Sécurité',
    description: 'Solution IoT pour la géolocalisation en temps réel et la protection du bétail.',
    longDescription: 'Solution IoT pensée pour lutter contre le vol de bétail, les pertes et le manque de contrôle du mouvement des animaux. Inclut géolocalisation en temps réel, alertes intelligentes et tableau de bord éleveur.',
    color: 'from-blue-500 to-indigo-600',
    icon: '📍',
    features: ['Géolocalisation temps réel', 'Alertes intelligentes', 'Dashboard éleveur', 'Protection bétail']
  },
  {
    name: 'MokineKid',
    subtitle: 'Sécurité enfants',
    description: 'Bracelet intelligent avec géolocalisation, zones de sécurité et bouton SOS.',
    longDescription: 'Solution de sécurité personnelle offrant géolocalisation en temps réel, zone de sécurité (geofencing), bouton SOS et alertes instantanées aux parents. Un outil essentiel pour la sécurité des enfants en Afrique.',
    color: 'from-amber-500 to-orange-600',
    icon: '👶',
    features: ['Géolocalisation temps réel', 'Zones sécurisées', 'Bouton SOS', 'Alertes parents']
  }
];

export const commitments = [
  {
    icon: 'Star',
    title: 'Excellence',
    description: 'Nous appliquons les meilleures pratiques internationales adaptées au contexte africain.'
  },
  {
    icon: 'Users',
    title: 'Proximité',
    description: 'Nous travaillons au plus près des institutions, communautés et usagers.'
  },
  {
    icon: 'Heart',
    title: 'Impact social',
    description: 'Nous développons des solutions utiles qui créent des opportunités et renforcent le développement local.'
  },
  {
    icon: 'Lock',
    title: 'Sécurité & confidentialité',
    description: 'Respect strict des normes de cybersécurité et protection des données.'
  }
];

export const team = [
  {
    id: 1,
    name: 'Emmanuel Foka Ziegoube',
    title: 'Fondateur & PDG',
    bio: 'Ingénieur en génie logiciel | Lauréat CASAM-INOV, PNUD, ECAM Expert en transformation digitale et innovation sociale.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    is_founder: true,
    specialties: ['Stratégie', 'Innovation', 'Leadership']
  },
  {
    id: 2,
    name: 'Tatinou Hervé',
    title: 'Senior UI/UX Designer',
    bio: 'Senior UI/UX Designer, Tatinou Hervé conçoit des expériences digitales centrées utilisateur, alliant esthétique, ergonomie et performance produit. Il excelle dans la création d\'interfaces intuitives et évolutives pour des produits à fort impact.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    is_founder: false,
    specialties: ['UI/UX Design', 'Product Design', 'Recherche utilisateur', 'Wireframing & prototypage', 'Design systems', 'Mobile-first']
  },
  {
    id: 3,
    name: 'Halimatou Sadia Ahmadou',
    title: 'Lead Project Manager',
    bio: 'Experte en gestion de projets | Coordination stratégique | Pilotage opérationnel. Pilote des projets complexes avec une approche structurée, orientée performance et collaboration. Elle excelle dans la coordination d\'équipes, le suivi des livrables et l\'alignement des projets avec les objectifs stratégiques.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    is_founder: false,
    specialties: ['Gestion de projets', 'Planification stratégique', 'Coordination d\'équipes', 'Suivi-évaluation', 'Agile et classique']
  },
  {
    id: 4,
    name: 'Marie Tagne',
    title: 'Lead Developer Mobile',
    bio: 'Développeuse mobile spécialisée en React Native et Flutter avec passion pour l\'innovation.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    is_founder: false,
    specialties: ['Mobile', 'React Native', 'UX']
  },
  {
    id: 5,
    name: 'Pierre Bouvier',
    title: 'Expert Data & Analytics',
    bio: 'Data scientist avec spécialisation en intelligence décisionnelle et machine learning.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    is_founder: false,
    specialties: ['Data Science', 'BI', 'Machine Learning']
  }
];

// Projects - Projets réalisés pour les clients
export const projects = [
  {
    id: 1,
    name: 'MokineVeto',
    client: 'Secteur Vétérinaire',
    description: 'Solution de gestion pour cliniques vétérinaires',
    category: 'Développement d\'apps',
    status: 'Produit',
    technologies: ['React', 'Node.js', 'PostgreSQL']
  },
  {
    id: 2,
    name: 'Mokine',
    client: 'Secteur Santé',
    description: 'Plateforme de gestion sanitaire intégrée',
    category: 'Transformation digitale',
    status: 'Produit',
    technologies: ['React', 'Node.js', 'PostgreSQL']
  },
  {
    id: 3,
    name: 'MokineKid',
    client: 'Secteur Éducation',
    description: 'Plateforme de gestion éducative pour enfants',
    category: 'Développement d\'apps',
    status: 'Produit',
    technologies: ['React', 'Node.js', 'PostgreSQL']
  },
  {
    id: 4,
    name: 'Portail de Gestion Administrative',
    client: 'Collectivités Territoriales',
    description: 'Solution de modernisation administrative pour collectivités',
    category: 'Conseil & Organisation',
    status: 'Réalisé',
    technologies: ['React', 'API REST', 'PostgreSQL']
  },
  {
    id: 5,
    name: 'Système de Gestion des Ressources Humaines',
    client: 'PME/Grandes Entreprises',
    description: 'Plateforme SIRH complète pour gestion des talents',
    category: 'Transformation digitale',
    status: 'Réalisé',
    technologies: ['React', 'Node.js', 'MongoDB']
  },
  {
    id: 6,
    name: 'ERP Intégré',
    client: 'Groupe Commerce & Industrie',
    description: 'Système de planification des ressources d\'entreprise',
    category: 'Développement d\'apps',
    status: 'Réalisé',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker']
  }
];
