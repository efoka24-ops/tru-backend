# GitHub Secrets Configuration Guide

Pour la configuration du déploiement automatique avec GitHub Actions, vous devez ajouter les secrets suivants à votre repository GitHub.

## 📋 Secrets à configurer

### 1. VERCEL_TOKEN
- **Obtenir:** https://vercel.com/account/tokens
- **Description:** Token d'authentification Vercel
- **Étapes:**
  1. Aller sur https://vercel.com/account/tokens
  2. Créer un nouveau token
  3. Copier le token
  4. Coller dans GitHub Secrets

### 2. VERCEL_ORG_ID
- **Description:** ID de votre organisation Vercel
- **Comment obtenir:**
  1. Aller sur https://vercel.com/dashboard
  2. Settings > Account
  3. Chercher "Organization ID"
  4. Copier l'ID

### 3. VERCEL_PROJECT_ID
- **Description:** ID du projet Vercel
- **Comment obtenir:**
  1. Aller sur https://vercel.com/dashboard
  2. Sélectionner votre projet "tru-website"
  3. Settings > General
  4. Chercher "Project ID"
  5. Copier l'ID

## 🔐 Ajouter les secrets à GitHub

### Via GitHub Web Interface

1. **Ouvrir:** https://github.com/efoka24-ops/tru-website/settings/secrets/actions

2. **Cliquer:** "New repository secret"

3. **Ajouter chaque secret:**
   - Name: `VERCEL_TOKEN`
   - Value: [Votre token Vercel]
   
   Répéter pour `VERCEL_ORG_ID` et `VERCEL_PROJECT_ID`

### Via GitHub CLI

```bash
gh secret set VERCEL_TOKEN --body "YOUR_TOKEN"
gh secret set VERCEL_ORG_ID --body "YOUR_ORG_ID"
gh secret set VERCEL_PROJECT_ID --body "YOUR_PROJECT_ID"
```

## ✅ Vérification

Une fois les secrets configurés:

1. **Faire un push** vers `main` branch
2. **Aller sur** GitHub > Actions
3. **Attendre** le déploiement automatique
4. **Vérifier** le statut dans Vercel Dashboard

## 🔒 Bonnes pratiques

- ✅ Ne JAMAIS committer les tokens
- ✅ Vérifier que `.env` est dans `.gitignore`
- ✅ Utiliser des secrets pour les valeurs sensibles
- ✅ Rotationner régulièrement les tokens
- ✅ Limiter les permissions des tokens

## 📚 Documentation référence

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Vercel Deployment Integration](https://vercel.com/docs/concepts/git/vercel-for-github)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## ❓ Troubleshooting

### "Deployment failed: No VERCEL_TOKEN"
- Vérifier que le secret est correctement ajouté
- Vérifier le nom du secret (case-sensitive)
- Attendre quelques minutes après l'ajout

### "Project not found: VERCEL_PROJECT_ID"
- Vérifier que l'ID est correct
- Vérifier que le projet existe sur Vercel
- Créer le projet si nécessaire

### "Organization not found: VERCEL_ORG_ID"
- Vérifier que l'ID est correct
- Vérifier que vous êtes propriétaire de l'organisation

---

**Support:** Consultez [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) pour l'aide complète.
