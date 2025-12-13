# 🚀 Déployer Backend + Frontend sur Vercel

## Architecture du Déploiement

Votre projet utilise une **architecture monorepo** sur Vercel:
```
Frontend (React/Vite)  → dist/
Backend (Express)      → backend/server.js (Serverless Function)
API Routes             → /api/* → backend/server.js
```

## ✅ Configuration Actuelle

Votre `vercel.json` est déjà optimisé:
- ✅ Build frontend avec Vite: `npm run build`
- ✅ Backend en Serverless Function (Node 18)
- ✅ Routes API réécrites vers `/api/*`

## 🔧 Étape 1: Préparer le Projet Localement

### Vérifier que tout fonctionne

```powershell
cd "c:\Users\EMMANUEL\Documents\site tru"

# Installer dépendances
npm install
cd backend
npm install
cd ..

# Builder le frontend
npm run build

# Vérifier le build
dir dist/
```

### Tester le backend localement

```powershell
cd backend
npm start
```

Vérifiez que l'API répond: `http://localhost:3000/api/team`

## 🔑 Étape 2: Configurer les Variables d'Environnement

### Via CLI Vercel

```powershell
vercel login
vercel
```

Puis ajoutez les variables:

```powershell
vercel env add DATABASE_URL "postgresql://user:password@host:5432/database"
vercel env add POSTGRES_URL "postgresql://user:password@host:5432/database"
vercel env add POSTGRES_PRISMA_URL "postgresql://user:password@host:5432/database?schema=prisma"
vercel env add POSTGRES_URL_NO_SSL "postgresql://user:password@host:5432/database"
vercel env add POSTGRES_USER "postgres"
vercel env add POSTGRES_PASSWORD "your-password"
vercel env add POSTGRES_HOST "hostname.postgres.vercel-storage.com"
vercel env add POSTGRES_PORT "5432"
vercel env add POSTGRES_DATABASE "database_name"
vercel env add NODE_ENV "production"
vercel env add CORS_ORIGIN "https://votre-projet.vercel.app"
vercel env add PORT "3000"
```

### Via Dashboard Web

1. [Allez à vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez **tru-website**
3. **Settings** → **Environment Variables**
4. Cliquez **Add New** pour chaque variable
5. Configurez pour **Production** ✅

**Où trouver DATABASE_URL:**
1. [vercel.com/storage/postgres](https://vercel.com/storage/postgres)
2. Cliquez sur votre instance PostgreSQL
3. **Connect** → Copiez la chaîne

## 🚀 Étape 3: Déployer

### Déploiement Initial

```powershell
vercel --prod
```

Vercel va:
1. ✅ Installer les dépendances (`npm install`)
2. ✅ Builder le frontend (`npm run build`)
3. ✅ Créer les Serverless Functions du backend
4. ✅ Vous donner l'URL: `https://tru-website.vercel.app`

### Logs du Déploiement

```powershell
# Voir les logs en direct
vercel logs https://tru-website.vercel.app

# Voir les déploiements récents
vercel ls
```

## 🗄️ Étape 4: Initialiser la Base de Données

Une fois déployé, initialisez les tables:

```powershell
# Si vous avez un script d'init
node backend/reset-db.cjs

# OU manuellement - créer les tables via psql ou Vercel Console
```

## ✔️ Étape 5: Vérifier le Déploiement

### Tester le Frontend
```
https://tru-website.vercel.app
```

### Tester l'API Backend
```powershell
# Via PowerShell
Invoke-RestMethod -Uri "https://tru-website.vercel.app/api/health" -Method Get

# Via curl
curl https://tru-website.vercel.app/api/team
```

### Vérifier les Logs

```powershell
# Logs temps réel
vercel logs https://tru-website.vercel.app

# Ou dans Vercel Dashboard → Deployments → Logs
```

## 🔄 Étape 6: Mises à Jour Futures

### Option A: Via GitHub (Recommandé - CI/CD Automatique)

```powershell
git add .
git commit -m "Feat: Description des changements"
git push origin main
```

GitHub Actions se déclenche automatiquement → Vercel se déploie → Site mis à jour ✅

### Option B: Via Vercel CLI

```powershell
vercel --prod
```

## 📊 Vérifier la Structure du Déploiement

Une fois déployé, Vercel crée:

```
Production URL (Frontend + API)
├── Frontend files (dist/)
│   ├── index.html
│   ├── assets/
│   └── ...
├── API Routes (/api/*)
│   └── backend/server.js (Serverless Function)
└── Functions
    └── api/
```

**Vérifier dans Vercel Dashboard:**
1. **Deployments** → Voir chaque déploiement
2. **Functions** → Voir les Serverless Functions
3. **Storage** → Voir votre PostgreSQL connectée

## 🆘 Dépannage

### Erreur: "DATABASE_URL not found"

```powershell
# Vérifier les variables ajoutées
vercel env ls

# Redéployer après ajout des variables
vercel --prod
```

### Erreur: "Build failed"

```powershell
# Tester le build localement
npm run build
cd backend && npm install && npm run build && cd ..

# Vérifier vercel.json
type vercel.json
```

### Erreur: "Cannot GET /api/team"

```powershell
# Vérifier que backend/server.js existe
dir backend/server.js

# Vérifier que les rewrites sont correctes dans vercel.json
type vercel.json
```

### Images ne s'affichent pas

```powershell
# Mettre à jour CORS_ORIGIN
vercel env add CORS_ORIGIN "https://tru-website.vercel.app"
vercel --prod
```

### Temps d'attente long au démarrage

```json
{
  "buildCommand": "npm run build",
  "functions": {
    "backend/server.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

## 📋 Checklist Complet

```
Préparation
- [ ] npm install (root)
- [ ] cd backend && npm install (backend)
- [ ] npm run build (test frontend build)
- [ ] vercel login

Variables d'Environnement
- [ ] DATABASE_URL
- [ ] POSTGRES_URL
- [ ] POSTGRES_USER / PASSWORD / HOST
- [ ] NODE_ENV = production
- [ ] CORS_ORIGIN

Déploiement
- [ ] vercel --prod
- [ ] Vérifier l'URL donnée
- [ ] Logs sans erreurs
- [ ] node backend/reset-db.cjs (init base)

Vérification
- [ ] https://tru-website.vercel.app accessible
- [ ] /api/health répond
- [ ] /api/team affiche les données
- [ ] Frontend charge sans erreurs
- [ ] Images s'affichent (Hervé, Halimatou, etc.)
- [ ] Formulaire Contact fonctionne

Post-Déploiement
- [ ] Domaine personnalisé (optionnel)
- [ ] GitHub Secrets pour CI/CD
- [ ] Monitoring des logs
```

## 🎯 Architecture Finale

```
GitHub (main branch)
    ↓
GitHub Actions (CI/CD)
    ↓
Vercel Build
    ├── Frontend: npm run build → dist/
    └── Backend: Serverless Function
    ↓
Vercel Deployment
    ├── https://tru-website.vercel.app (Frontend)
    └── /api/* (Backend API)
    ↓
Vercel PostgreSQL (Database)
```

## 📞 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Vercel Functions](https://vercel.com/docs/functions/serverless-functions)
- [Vercel Storage](https://vercel.com/docs/storage)
- [Troubleshooting Guide](https://vercel.com/docs/edge-network/diagnostics)

## 🔗 Commandes Utiles

```powershell
# Voir votre projet sur Vercel
vercel ls

# Redéployer
vercel --prod

# Voir les variables d'env
vercel env ls

# Voir les logs
vercel logs https://tru-website.vercel.app

# Netlier un domaine perso
vercel domains add votre-domaine.com

# Supprimer un déploiement
vercel remove <url>
```

## ⚡ Performance Tips

1. **Optimiser les images** - Compresser avant upload
2. **Lazy loading** - Charger images on-demand
3. **Caching** - Ajouter headers de cache
4. **Minify** - Assets minifiés (Vite déjà fait)
5. **Database** - Connection pooling activé

---

**Status:** ✅ Prêt pour production!

Votre `vercel.json` est déjà configuré correctement. Suivez simplement les étapes 1-5 ci-dessus pour déployer. 🚀
