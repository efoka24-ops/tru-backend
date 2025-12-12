# 🔗 Liens importants de déploiement

## 📌 Liens GitHub

- **Repository:** https://github.com/efoka24-ops/tru-website
- **Actions/CI-CD:** https://github.com/efoka24-ops/tru-website/actions
- **Settings:** https://github.com/efoka24-ops/tru-website/settings
- **Secrets:** https://github.com/efoka24-ops/tru-website/settings/secrets/actions
- **Deployments:** https://github.com/efoka24-ops/tru-website/deployments

## 🚀 Liens Vercel

- **Dashboard:** https://vercel.com/dashboard
- **Project:** https://vercel.com/efoka24-ops/tru-website
- **Settings:** https://vercel.com/efoka24-ops/tru-website/settings
- **Deployments:** https://vercel.com/efoka24-ops/tru-website/deployments
- **Environment:** https://vercel.com/efoka24-ops/tru-website/settings/environment-variables
- **Domains:** https://vercel.com/efoka24-ops/tru-website/settings/domains
- **Tokens:** https://vercel.com/account/tokens

## 🗄️ Liens Vercel Postgres

- **Storage:** https://vercel.com/storage
- **Postgres Dashboard:** https://vercel.com/storage/postgres
- **Connection Strings:** https://vercel.com/docs/storage/vercel-postgres/tokens-and-connection-strings

## 📝 Documentation locale

- **[README.md](./README.md)** - Vue d'ensemble du projet
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Guide complet de déploiement
- **[VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md)** - Démarrage rapide Vercel
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Checklist étape par étape
- **[GITHUB_SECRETS.md](./GITHUB_SECRETS.md)** - Configuration des secrets GitHub
- **[.github/workflows/README.md](./.github/workflows/README.md)** - Documentation GitHub Actions

## 🚀 Guides rapides

### Première fois (Setup complet)
1. Lire: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Suivre: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
3. Configurer: [GITHUB_SECRETS.md](./GITHUB_SECRETS.md)

### Redéployer (après changements)
1. Faire vos changements
2. `git add . && git commit -m "message"` 
3. `git push origin main`
4. GitHub Actions se charge du reste!

### Accès rapide à Vercel
- Logs: https://vercel.com/efoka24-ops/tru-website/deployments
- Variables Env: https://vercel.com/efoka24-ops/tru-website/settings/environment-variables
- Domaine: https://vercel.com/efoka24-ops/tru-website/settings/domains

## 🔐 Secrets à mémoriser

Ces secrets sont nécessaires pour GitHub Actions:

| Secret | Où le trouver |
|--------|---------------|
| `VERCEL_TOKEN` | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | https://vercel.com > Settings > Account |
| `VERCEL_PROJECT_ID` | Project > Settings > General |

## 📞 Support et documentation externe

- **Vercel Status:** https://status.vercel.com
- **Vercel Support:** https://vercel.com/support
- **GitHub Status:** https://www.githubstatus.com
- **GitHub Support:** https://github.com/support
- **GitHub Docs:** https://docs.github.com

## 🎯 Commandes utiles

```bash
# Cloner le repo
git clone https://github.com/efoka24-ops/tru-website.git

# Mettre à jour
git pull origin main

# Créer une branche
git checkout -b feature/ma-feature

# Pousser des changements
git add .
git commit -m "Mon message"
git push origin feature/ma-feature

# Voir l'historique
git log --oneline

# Voir le statut
git status
```

## 📊 Tableau de bord unique

Pour avoir accès à tout d'un seul endroit:

1. **GitHub:** https://github.com/efoka24-ops/tru-website
2. **Vercel:** https://vercel.com/efoka24-ops/tru-website
3. **Postgres:** https://vercel.com/storage/postgres

Garder ces trois onglets ouverts pour un monitoring optimal!

---

**Last Updated:** 2025-12-12  
**Status:** Production Ready ✅
