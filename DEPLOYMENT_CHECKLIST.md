# 📋 Checklist Déploiement Complet

## ✅ Phase 1: Préparation (15 minutes)

- [ ] Vérifier que tous les fichiers sont dans le repo
- [ ] Vérifier que `.env` est dans `.gitignore`
- [ ] Exécuter: `node check-deployment.cjs`
- [ ] Vérifier que les serveurs fonctionnent localement
- [ ] Exécuter: `npm run build` avec succès

## ✅ Phase 2: GitHub Setup (5 minutes)

- [ ] Exécuter: `.\deploy.ps1` (depuis PowerShell)
- [ ] Vérifier sur https://github.com/efoka24-ops/tru-website que les fichiers sont poussés
- [ ] Vérifier que la branche `main` existe

## ✅ Phase 3: Vercel Setup (10 minutes)

**Account Setup:**
- [ ] Créer compte Vercel: https://vercel.com
- [ ] S'inscrire avec GitHub
- [ ] Autoriser Vercel à accéder aux repositories

**Project Setup:**
- [ ] Aller sur https://vercel.com/new
- [ ] Sélectionner `tru-website` repository
- [ ] Framework: **Vite**
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Cliquer "Deploy"
- [ ] Attendre 3-5 minutes

**Environment Variables:**
- [ ] Dans Vercel Dashboard > Settings > Environment Variables
- [ ] Ajouter `DATABASE_URL` (depuis Vercel Postgres)
- [ ] Ajouter `POSTGRES_URL`
- [ ] Ajouter `POSTGRES_PRISMA_URL`
- [ ] Ajouter `POSTGRES_USER`
- [ ] Ajouter `POSTGRES_PASSWORD`
- [ ] Ajouter `POSTGRES_HOST`
- [ ] Ajouter `POSTGRES_PORT`
- [ ] Ajouter `POSTGRES_DATABASE`

## ✅ Phase 4: Database Initialization (5 minutes)

**Sur votre machine locale:**
```bash
cd backend
node reset-db.cjs
```

- [ ] Les 9 tables sont créées
- [ ] Pas d'erreurs dans les logs

## ✅ Phase 5: Verification (10 minutes)

**Frontend:**
- [ ] Visiter https://your-domain.vercel.app
- [ ] Vérifier que la page d'accueil charge
- [ ] Vérifier que les images chargent
- [ ] Ouvrir DevTools > Console (pas d'erreurs)
- [ ] Tester la navigation entre les pages

**API Endpoints:**
```bash
curl https://your-domain.vercel.app/api/team
curl https://your-domain.vercel.app/api/testimonials
curl https://your-domain.vercel.app/api/solutions
```
- [ ] Les réponses JSON sont valides
- [ ] Les données chargent correctement

**Images:**
- [ ] /team - Images des membres affichent
- [ ] /solutions - Images des solutions affichent
- [ ] /services - Images des services affichent

## ✅ Phase 6: GitHub Actions Setup (5 minutes)

**Secrets Configuration:**
- [ ] Créer token Vercel: https://vercel.com/account/tokens
- [ ] Obtenir VERCEL_ORG_ID
- [ ] Obtenir VERCEL_PROJECT_ID

**Ajouter les secrets:**
- [ ] https://github.com/efoka24-ops/tru-website/settings/secrets/actions
- [ ] Ajouter `VERCEL_TOKEN`
- [ ] Ajouter `VERCEL_ORG_ID`
- [ ] Ajouter `VERCEL_PROJECT_ID`

**Tester le workflow:**
- [ ] Faire un petit changement localement
- [ ] Committer et pousser: `git push`
- [ ] Aller sur GitHub > Actions
- [ ] Vérifier que le workflow s'exécute
- [ ] Vérifier que le déploiement réussit

## ✅ Phase 7: Post-Deployment

**Monitoring:**
- [ ] Vérifier les logs Vercel tous les jours pendant 1 semaine
- [ ] Mettre en place des alertes (optionnel)
- [ ] Tester régulièrement les API endpoints

**Domain Configuration (Optionnel):**
- [ ] Acheter un domaine
- [ ] Configurer les DNS vers Vercel
- [ ] Ajouter le domaine dans Vercel Dashboard
- [ ] Vérifier le certificat SSL

**Backup & Security:**
- [ ] Faire un backup de la base de données
- [ ] Configurer des alertes d'erreurs
- [ ] Mettre en place un monitoring
- [ ] Documenter le processus

## 📊 Timeline estimée

| Phase | Durée | Cumul |
|-------|-------|-------|
| Préparation | 15 min | 15 min |
| GitHub Setup | 5 min | 20 min |
| Vercel Setup | 10 min | 30 min |
| DB Initialization | 5 min | 35 min |
| Vérification | 10 min | 45 min |
| GitHub Actions | 5 min | 50 min |
| **Total** | **50 min** | **50 min** |

## 🔗 Ressources rapides

- **GitHub:** https://github.com/efoka24-ops/tru-website
- **Vercel:** https://vercel.com/dashboard
- **Vercel Postgres:** https://vercel.com/storage/postgres
- **GitHub Secrets:** https://github.com/efoka24-ops/tru-website/settings/secrets

## 💡 Tips & Tricks

1. **Avant de déployer:**
   - Faire un commit de tous les changements
   - Vérifier localement que tout fonctionne
   - Exécuter les tests

2. **Pendant le déploiement:**
   - Ne pas fermer le terminal ou le navigateur
   - Garder les logs Vercel open pour debugger
   - Prendre une capture d'écran du déploiement réussi

3. **Après le déploiement:**
   - Tester chaque page du site
   - Vérifier les logs pour erreurs
   - Partager le lien avec l'équipe
   - Documenter les problèmes si trouvés

## ❌ Problèmes courants et solutions

| Problème | Cause | Solution |
|----------|-------|----------|
| Build fails | Dépendances manquantes | Vérifier `npm install` |
| API 404 | Routes non configurées | Vérifier `vercel.json` |
| Images ne chargent pas | CORS mal configuré | Vérifier `server.js` |
| DB connection error | Variables env manquantes | Ajouter les secrets |
| GitHub Actions fails | Secrets mal configurés | Vérifier `GITHUB_SECRETS.md` |

## 📞 Support

Si vous rencontrez des problèmes:

1. **Vérifier les logs:**
   - Vercel Dashboard > Deployments > Logs
   - GitHub > Actions > Workflow logs

2. **Consulter la documentation:**
   - `DEPLOYMENT_GUIDE.md` - Guide complet
   - `VERCEL_QUICK_START.md` - Démarrage rapide
   - `GITHUB_SECRETS.md` - Configuration secrets

3. **Demander de l'aide:**
   - GitHub Issues
   - Discord/Slack du projet
   - Support Vercel: https://vercel.com/support

---

**Status:** ⏳ À compléter  
**Last Updated:** 2025-12-12  
**Next Review:** Après le premier déploiement réussi
