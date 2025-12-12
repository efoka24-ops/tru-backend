# ⚙️ Configuration Vercel optimisée

Ce fichier documenti les meilleures configurations pour Vercel.

## 📄 vercel.json - Configuration complète

Voir le fichier `vercel.json` à la racine du projet.

### Configuration recommandée pour notre stack:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "env": {
    "NODE_ENV": {
      "type": "string",
      "default": "production",
      "description": "Environment mode"
    },
    "DATABASE_URL": "@database_url",
    "POSTGRES_URL": "@postgres_url",
    "POSTGRES_PRISMA_URL": "@postgres_prisma_url"
  },
  "functions": {
    "backend/server.js": {
      "runtime": "nodejs18.x",
      "memory": 1024,
      "maxDuration": 60
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/backend/server.js"
    }
  ],
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ]
}
```

## 🔑 Variables d'environnement Vercel

### Pour la base de données

```
DATABASE_URL=postgres://user:password@db.prisma.io:5432/database
POSTGRES_URL=postgres://user:password@db.prisma.io:5432/database
POSTGRES_PRISMA_URL=postgres://user:password@db.prisma.io:5432/database
POSTGRES_URL_NO_SSL=postgres://user:password@db.prisma.io:5432/database
POSTGRES_USER=username
POSTGRES_PASSWORD=password
POSTGRES_HOST=db.prisma.io
POSTGRES_PORT=5432
POSTGRES_DATABASE=database
```

### Pour Node.js

```
NODE_ENV=production
NODE_VERSION=18
```

## 🏗️ Optimisations de build

### Réduire la taille du bundle

Dans `vite.config.js`:
```javascript
export default {
  build: {
    minify: 'terser',
    target: 'ES2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
}
```

### Analyser la taille du bundle

```bash
npm install -D rollup-plugin-visualizer

# Dans vite.config.js:
import { visualizer } from "rollup-plugin-visualizer";

export default {
  plugins: [visualizer()]
}

npm run build
# Ouvre dist/stats.html
```

## 🚀 Optimisations de runtime

### Pooling de base de données

Le backend utilise déjà un pool avec 20 connexions max:

```javascript
const pool = new Pool({
  max: 20,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  ssl: { rejectUnauthorized: false }
});
```

### Limite de payload

Dans `backend/server.js`:
```javascript
app.use(express.json({ limit: '50mb' }));
```

## 📊 Monitoring et logging

### Logs sur Vercel

Tous les logs `console.log()`, `console.error()` apparaissent dans Vercel Dashboard.

### Voir les logs en direct

```bash
# Installation Vercel CLI
npm install -g vercel

# Login
vercel login

# Voir les logs
vercel logs
```

### Logs recommandés

```javascript
// Dans server.js
console.log('✅ Connecté à la BD');
console.log('❌ Erreur:', error.message);
console.warn('⚠️ Attention:', message);
```

## 🔒 Sécurité

### CORS Configuration

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://yourdomain.vercel.app',
    'https://yourdomain.com'
  ],
  credentials: true
}));
```

### Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

### Helmet.js pour sécurité

```bash
npm install helmet
```

```javascript
import helmet from 'helmet';
app.use(helmet());
```

## 📈 Performance

### Cache statique

```javascript
app.use(express.static('dist', {
  maxAge: '1d',
  etag: false
}));
```

### Compression

```bash
npm install compression
```

```javascript
import compression from 'compression';
app.use(compression());
```

### Image optimization

Vite optimise automatiquement les images:
- Webp conversion
- Lazy loading
- Responsive images

## 🔄 Continuous Deployment

### Auto-deploy sur push

Configuration dans Vercel Dashboard:
1. Project > Settings > Git
2. Deploy on push: **Enabled**
3. Branches: `main` (production), `develop` (preview)

### Preview URLs

Chaque PR sur GitHub crée une preview URL unique:
- Vercel commente automatiquement le PR
- URL valide pendant que le PR est ouvert
- Utile pour review avant merge

## 🧪 Testing avant déploiement

### Test local avec production build

```bash
# Build
npm run build

# Preview
npm run preview

# Tester
curl http://localhost:4173
```

### Test de la BD

```bash
# Sur votre machine
cd backend
node reset-db.cjs

# Vérifier que les tables existent
psql $DATABASE_URL -c "\dt"
```

## 📝 Checklist avant production

- [ ] `npm run build` fonctionne
- [ ] `npm run preview` fonctionne
- [ ] Variables d'environnement configurées dans Vercel
- [ ] Base de données initialisée
- [ ] Tests API passent: `node test-api.cjs`
- [ ] Checks pré-déploiement passent: `node check-deployment.cjs`
- [ ] Secrets GitHub configurés si utilisant GitHub Actions
- [ ] Domain configuré (optionnel)
- [ ] CORS correctement configuré
- [ ] Logs Vercel vérifiés

## 🔗 Ressources

- **Vercel Docs:** https://vercel.com/docs
- **Vite Docs:** https://vitejs.dev
- **Node.js Docs:** https://nodejs.org/docs
- **PostgreSQL:** https://www.postgresql.org/docs

---

**Version:** 1.0  
**Last Updated:** 2025-12-12
