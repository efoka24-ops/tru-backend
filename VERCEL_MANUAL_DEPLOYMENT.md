# 📋 Guide Complet: Déployer sur Vercel Manuellement

## Pré-requis

- [x] Compte Vercel créé (gratuit)
- [x] Projet pushé sur GitHub
- [x] Node.js 18+ installé localement
- [x] CLI Vercel installée

## Étape 1: Installer Vercel CLI

```powershell
npm install -g vercel
```

## Étape 2: Se Connecter à Vercel

```powershell
vercel login
```

Cela ouvrira une page de connexion. Authentifiez-vous avec GitHub ou email Vercel.

## Étape 3: Initialiser le Projet

Naviguez dans le répertoire racine du projet:

```powershell
cd "c:\Users\EMMANUEL\Documents\site tru"
```

Puis initialisez Vercel:

```powershell
vercel
```

**Répondez aux questions:**
- `Set up and deploy "site tru"?` → **y** (yes)
- `Which scope should we deploy to?` → Sélectionnez votre compte personnel
- `Link to existing project?` → **n** (no) - créer un nouveau projet
- `What's your project's name?` → `tru-website` (ou votre nom)
- `In which directory is your code located?` → **.** (point - répertoire courant)
- `Want to modify vercel.json?` → **n** (non, on utilisera le nôtre)

## Étape 4: Ajouter les Variables d'Environnement

### Option A: Via Vercel CLI (Recommandé)

```powershell
vercel env add DATABASE_URL
```

Entrez votre chaîne de connexion PostgreSQL depuis Vercel Postgres:
```
postgresql://user:password@host:5432/database
```

Répétez pour les autres variables:

```powershell
vercel env add POSTGRES_URL
vercel env add POSTGRES_PRISMA_URL
vercel env add POSTGRES_URL_NO_SSL
vercel env add POSTGRES_USER
vercel env add POSTGRES_PASSWORD
vercel env add POSTGRES_HOST
vercel env add POSTGRES_PORT
vercel env add POSTGRES_DATABASE
vercel env add NODE_ENV production
vercel env add CORS_ORIGIN https://votre-domaine.vercel.app
```

### Option B: Via Interface Web Vercel

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet `tru-website`
3. Cliquez sur **Settings** → **Environment Variables**
4. Ajoutez chaque variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Votre chaîne de connexion PostgreSQL
5. Cliquez **Save**
6. Répétez pour chaque variable

**📌 Obtenir la Connection String PostgreSQL:**

1. Allez sur [vercel.com/storage/postgres](https://vercel.com/storage/postgres)
2. Cliquez sur votre instance PostgreSQL
3. Cliquez sur **Connect**
4. Copiez la chaîne de connexion `.env.local`
5. Collez dans Vercel (sans `POSTGRES_PRISMA_URL=`)

## Étape 5: Déployer le Projet

### Déploiement Initial

```powershell
vercel --prod
```

Le CLI va:
- ✅ Installer les dépendances
- ✅ Builder le frontend (Vite)
- ✅ Déployer sur Vercel
- ✅ Vous donner l'URL de production

### Mettre à Jour après Changements

```powershell
# Push vers GitHub
git add .
git commit -m "Update: description des changements"
git push origin main

# OU directement sur Vercel
vercel --prod
```

## Étape 6: Initialiser la Base de Données

Une fois le projet déployé:

```powershell
node backend/reset-db.cjs
```

Cela crée les tables et ajoute les données d'exemple.

## Étape 7: Vérifier le Déploiement

```powershell
# Tester l'API
curl https://votre-projet.vercel.app/api/health

# Ou visitez
https://votre-projet.vercel.app
```

## 🔍 Dépannage

### Erreur: "DATABASE_URL not found"

**Solution:**
- Vérifiez que les variables d'environnement sont ajoutées
- Attendez 2-3 minutes après l'ajout (propagation)
- Redéployez: `vercel --prod`

### Erreur: "Build failed"

**Vérifiez:**
```powershell
# Frontend
npm run build

# Backend
cd backend
npm install
npm run build
cd ..
```

### Images ne s'affichent pas

**Vérifiez CORS:**
```powershell
# Changer CORS_ORIGIN dans Vercel Settings
vercel env add CORS_ORIGIN https://votre-projet.vercel.app
vercel --prod
```

### Données n'apparaissent pas

**Réinitialisez la DB:**
```powershell
node backend/reset-db.cjs
```

## 📊 Variables d'Environnement Complètes

Créez un fichier `.env.local` temporaire pour la référence:

```env
# PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/database
POSTGRES_URL=postgresql://user:password@host:5432/database
POSTGRES_PRISMA_URL=postgresql://user:password@host:5432/database?schema=prisma
POSTGRES_URL_NO_SSL=postgresql://user:password@host:5432/database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_HOST=hostname.postgres.vercel-storage.com
POSTGRES_PORT=5432
POSTGRES_DATABASE=database_name

# Node
NODE_ENV=production
PORT=3000

# CORS
CORS_ORIGIN=https://votre-projet.vercel.app
```

## 📝 Commandes Utiles

```powershell
# Voir le statut du déploiement
vercel ls

# Afficher les logs en direct
vercel logs https://votre-projet.vercel.app

# Voir les variables d'environnement
vercel env ls

# Redéployer sans changements
vercel --prod

# Nettoyer les builds anciens
vercel remove
```

## ✅ Checklist de Déploiement

- [ ] Compte Vercel créé
- [ ] Vercel CLI installée
- [ ] Connecté à Vercel: `vercel login`
- [ ] Projet initialisé: `vercel`
- [ ] PostgreSQL instance créée sur Vercel
- [ ] Variables d'environnement ajoutées
- [ ] Déploiement effectué: `vercel --prod`
- [ ] Base de données initialisée: `node backend/reset-db.cjs`
- [ ] Site accessible sur Vercel
- [ ] Images s'affichent correctement
- [ ] API répond (`/api/health`)

## 🎯 Après le Déploiement

1. **Configurez le domaine personnalisé** (optionnel):
   - Vercel Dashboard → Settings → Domains
   - Ajoutez votre domaine
   - Modifiez les records DNS

2. **Configurez les GitHub Secrets** (pour CI/CD automatique):
   - GitHub Repo → Settings → Secrets and Variables → Actions
   - Ajoutez: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

3. **Testez le CI/CD**:
   - Poussez vers main
   - Vérifiez que GitHub Actions déclenche le déploiement

## 📞 Besoin d'Aide?

- Docs Vercel: [vercel.com/docs](https://vercel.com/docs)
- Forum Vercel: [forums.vercel.com](https://forums.vercel.com)
- Issues du projet: Vérifiez les logs avec `vercel logs`
