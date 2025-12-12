# 🚀 Guide Rapide - Déploiement Vercel

## Étape 1: Préparer GitHub

```powershell
# Ouvrir PowerShell dans C:\Users\EMMANUEL\Documents\site tru
cd "C:\Users\EMMANUEL\Documents\site tru"

# Exécuter le script de déploiement
.\deploy.ps1
```

Cela va:
- Configurer Git avec vos identifiants
- Ajouter tous les fichiers
- Créer un commit
- Pousser vers GitHub

## Étape 2: Connecter Vercel

1. **Créer un compte Vercel** (si nécessaire)
   - Aller sur https://vercel.com
   - S'inscrire avec GitHub

2. **Importer le project**
   - Aller sur https://vercel.com/new
   - Cliquer "Continue with GitHub"
   - Sélectionner `tru-website`

3. **Configurer Build Settings** (defaults OK)
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Ajouter Environment Variables**
   - Cliquer "Environment Variables"
   - Ajouter celles-ci (depuis Vercel Postgres dashboard):

```
DATABASE_URL=postgres://user:password@db.prisma.io:5432/verceldb
POSTGRES_URL=postgres://user:password@db.prisma.io:5432/verceldb
POSTGRES_PRISMA_URL=postgres://user:password@db.prisma.io:5432/verceldb
POSTGRES_URL_NO_SSL=postgres://user:password@db.prisma.io:5432/verceldb
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=db.prisma.io
POSTGRES_PORT=5432
POSTGRES_DATABASE=verceldb
```

5. **Déployer**
   - Cliquer "Deploy"
   - Attendre 3-5 minutes
   - Visiter votre site! 🎉

## Étape 3: Initialiser la Base de Données (First Deploy Only)

Après le premier déploiement:

```bash
# Sur votre machine locale
cd backend
node reset-db.cjs
```

Cela créera les 9 tables dans la base de données Vercel.

## ✅ Vérification Post-Déploiement

1. **Vérifier le Frontend**
   - Visiter: https://yourdomain.vercel.app
   - Vérifier que les pages chargent
   - Ouvrir DevTools > Console pour voir les erreurs

2. **Tester les API Endpoints**
   ```bash
   curl https://yourdomain.vercel.app/api/team
   curl https://yourdomain.vercel.app/api/testimonials
   ```

3. **Monitorer les Logs**
   - Dashboard Vercel > Deployments
   - Cliquer sur le dernier déploiement
   - Vérifier les logs pour erreurs

## 🔧 Troubleshooting

| Problème | Solution |
|----------|----------|
| Build fails | Vérifier `npm run build` localement |
| API 404 | Vérifier `vercel.json` configuration |
| Database error | Vérifier `DATABASE_URL` format et variables env |
| Images not loading | Vérifier CORS dans `backend/server.js` |

## 📚 Documentation Complète

Consultez `DEPLOYMENT_GUIDE.md` pour:
- Configuration détaillée
- Options de déploiement
- Troubleshooting avancé
- Plan de rollback

## 🎯 Commandes Utiles

```powershell
# Voir le statut du repository
git status

# Voir l'historique des commits
git log --oneline -n 5

# Faire un push manual
git push origin main

# Voir les branches
git branch -a
```

---

**Durée estimée:** 10-15 minutes  
**Coût:** Gratuit (forfait hobbyist Vercel)  
**Support:** https://vercel.com/support
