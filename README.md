# TRU GROUP - Site Web Officiel

Un site web moderne et professionnel pour TRU GROUP, cabinet de conseil et d'ingénierie digitale basé au Cameroun.

## 🚀 Technologies utilisées

- **React 18** - Framework JavaScript
- **Vite** - Bundler moderne et rapide
- **React Router** - Navigation et routing
- **Tailwind CSS** - Styling CSS utilitaire
- **Framer Motion** - Animations fluides
- **Lucide React** - Icônes vectorielles
- **React Query** - Gestion d'état (optionnel)

## 📁 Structure du projet

```
src/
├── pages/              # Pages du site
│   ├── Home.jsx       # Accueil
│   ├── About.jsx      # À propos
│   ├── Services.jsx   # Services
│   ├── Solutions.jsx  # Solutions (MokineVeto, Mokine, MokineKid)
│   ├── Team.jsx       # Notre équipe
│   └── Contact.jsx    # Contact
├── components/        # Composants réutilisables
│   ├── Layout.jsx     # Layout principal (nav + footer)
│   ├── Button.jsx     # Bouton personnalisé
│   ├── Card.jsx       # Carte
│   ├── Input.jsx      # Input
│   └── Textarea.jsx   # Textarea
├── data/             # Données statiques
│   └── content.js    # Contenu du site
├── App.jsx           # Component principal avec routing
├── main.jsx          # Point d'entrée
└── index.css         # Styles globaux
```

## 🛠️ Installation

1. **Cloner le repository** (ou télécharger les fichiers)

2. **Installer les dépendances**
```bash
npm install
```

3. **Démarrer le serveur de développement**
```bash
npm run dev
```

4. **Accéder au site**
Ouvrir [http://localhost:5173](http://localhost:5173) dans votre navigateur

## 📝 Pages du site

### 🏠 Accueil (Home)
- Hero section impactant
- Mission, force et vision
- Domaines d'excellence
- Solutions innovantes
- Call-to-action

### ℹ️ À propos (About)
- Histoire de l'entreprise
- Valeurs fondamentales
- Mission, vision et ambition
- Profil du leadership

### 🔧 Services (Services)
1. Conseil & Organisation
2. Transformation digitale
3. Développement d'applications
4. Gestion de projet & assistance technique
5. Formation & renforcement des capacités

### 💡 Solutions (Solutions)
- **MokineVeto** - Télémédecine vétérinaire
- **Mokine** - Traçabilité & Sécurité du bétail
- **MokineKid** - Bracelet intelligent pour enfants

### 👥 Notre équipe (Team)
- Leadership et fondateur
- Domaines d'expertise
- Culture d'équipe

### 📧 Contact (Contact)
- Formulaire de contact
- Informations de contact
- Horaires d'ouverture
- Localisation

## 🎨 Personnalisation

### Modifier les couleurs
Éditer `src/tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#22c55e', // Votre couleur
  }
}
```

### Modifier le contenu
Éditer `src/data/content.js` pour changer:
- Nom de l'entreprise
- Slogan
- Services
- Solutions
- Engagements
- Équipe

### Ajouter des images
Placer les images dans `src/assets/` et les importer dans les pages

## 🚀 Déploiement

### Build pour production
```bash
npm run build
```

### Preview du build
```bash
npm run preview
```

Les fichiers compilés seront dans le dossier `dist/`

### 📖 Guides de déploiement complets
- **[VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md)** - Déployer rapidement sur Vercel
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Guide détaillé avec toutes les options

### Déployer sur
- **Vercel** ⭐ Recommandé - Optimisé pour React/Vite
  - Intégration GitHub automatique
  - Previews sur chaque PR
  - Serverless functions
  - PostgreSQL intégré
  
- **Netlify** - Connexion simple depuis GitHub
- **GitHub Pages** - Gratuit et facile (static sites)
- Votre propre serveur avec nginx/Apache

## 📱 Responsive Design

Le site est entièrement responsive:
- Mobile (< 640px)
- Tablette (640px - 1024px)
- Desktop (> 1024px)

## ⚡ Optimisations

- Code splitting automatique
- Lazy loading des images
- CSS purging pour production
- Minification des assets
- Cache optimal

## 📚 Ressources utiles

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Lucide Icons](https://lucide.dev)

## 🤝 Support

Pour toute question ou modification, contactez:
- 📧 info@trugroup.cm
- 📞 +237 691 22 71 49

## 📄 License

© 2025 TRU GROUP. Tous droits réservés.
