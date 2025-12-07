# TRU Website - Project Complete

Un projet web complet pour Site TRU avec frontend, backend et administration.

## 🚀 Structure du projet

```
tru-website/
├── frontend/                 # Site web principal
│   ├── src/
│   │   ├── pages/           # Pages principales
│   │   ├── components/      # Composants réutilisables
│   │   ├── api/            # Services API
│   │   └── data/           # Données statiques
│   └── vite.config.js
├── backend/                  # API Node.js/Express
│   ├── server.js           # Serveur principal
│   ├── data.json           # Base de données JSON
│   └── package.json
├── backoffice/              # Panneau d'administration
│   ├── src/
│   │   ├── pages/          # Pages admin
│   │   ├── components/     # Composants UI
│   │   └── services/       # Services API
│   └── vite.config.js
└── README.md
```

## 📋 Fonctionnalités

### Frontend (Site Principal)
- ✅ Accueil avec Hero Section
- ✅ Pages Services, Équipe, À propos
- ✅ Formulaire de contact
- ✅ Pages Solutions
- ✅ Intégration API complète
- ✅ Design responsive moderne
- ✅ Animations Framer Motion

### Backend (API)
- ✅ Express.js API
- ✅ Routes CRUD complètes
  - Services
  - Contenu
  - Équipe
- ✅ Synchronisation de données
- ✅ Base de données JSON
- ✅ CORS activé
- ✅ Health check

### Back Office (Administration)
- ✅ Tableau de bord
- ✅ Gestion des Services
  - Créer, lire, modifier, supprimer
- ✅ Gestion de l'Équipe
  - Upload d'images
  - Gestion des profils
- ✅ Gestion du Contenu
- ✅ Interface moderne avec Tailwind CSS
- ✅ React Query pour la gestion d'état
- ✅ Animations Framer Motion

## 🛠️ Démarrage rapide

### Prérequis
- Node.js >= 16
- npm ou yarn

### Installation

```bash
# Clone le dépôt
git clone https://github.com/efoka24-ops/tru-website.git
cd tru-website

# Installe les dépendances du frontend
npm install

# Installe les dépendances du backend
cd backend
npm install
cd ..

# Installe les dépendances du back office
cd backoffice
npm install
cd ..
```

### Démarrage en développement

Démarrez les services dans différents terminaux :

```bash
# Terminal 1 - Backend (port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5174)
npm run dev

# Terminal 3 - Back Office (port 3000)
cd backoffice
npm run dev
```

## 📝 API Endpoints

### Services
- `GET /api/services` - Récupère tous les services
- `POST /api/services` - Crée un service
- `PUT /api/services/:id` - Modifie un service
- `DELETE /api/services/:id` - Supprime un service

### Équipe
- `GET /api/team` - Récupère l'équipe
- `POST /api/team` - Ajoute un membre
- `PUT /api/team/:id` - Modifie un membre
- `DELETE /api/team/:id` - Supprime un membre

### Contenu
- `GET /api/content` - Récupère le contenu
- `POST /api/content` - Ajoute du contenu
- `PUT /api/content/:id` - Modifie du contenu
- `DELETE /api/content/:id` - Supprime du contenu

### Health
- `GET /api/health` - Vérifie l'état du serveur

## 🗂️ Architecture

### Frontend
- **React** 18+ avec Hooks
- **Vite** pour le build
- **Tailwind CSS** pour le styling
- **Framer Motion** pour les animations
- **Lucide React** pour les icônes
- **Axios** pour les requêtes HTTP

### Backend
- **Express.js** framework
- **CORS** pour les requêtes cross-origin
- **dotenv** pour les variables d'environnement
- **File System** pour la persistence (data.json)

### Back Office
- **React** 18+ avec Hooks
- **TanStack React Query** pour le fetch de données
- **Framer Motion** pour les animations
- **Tailwind CSS** pour le styling
- **Composants UI personnalisés**

## 📚 Technologies

- React.js
- Node.js
- Express.js
- Vite
- Tailwind CSS
- Framer Motion
- React Query
- Axios

## 🔒 Variables d'environnement

### Backend (.env)
```
PORT=5000
NODE_ENV=development
```

### Back Office (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 📱 Responsive Design

Le projet est entièrement responsive et compatible avec :
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (< 768px)

## 🚀 Déploiement

Prêt pour être déployé sur :
- Vercel (Frontend)
- Heroku/Railway (Backend)
- Netlify (Back Office)

## 📄 Licence

Tous droits réservés © 2025 TRU GROUP

## 👤 Auteur

Efoka Emmanuel - [GitHub](https://github.com/efoka24-ops)

## 📞 Support

Pour toute question ou problème, contactez : efoka24ops@gmail.com

---

**Dernière mise à jour:** 7 Décembre 2025
