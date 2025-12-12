# GitHub Actions - Déploiement Automatique

Ce répertoire contient les workflows GitHub Actions pour déployer automatiquement le projet sur Vercel.

## 📁 Structure

```
.github/
└── workflows/
    └── deploy.yml          # Workflow principal de déploiement
```

## 🚀 Workflow: deploy.yml

### Déclencheurs

Le workflow se déclenche automatiquement pour:
- ✅ **Push sur main** - Déploiement production immédiat
- ✅ **Pull Requests vers main** - Build de vérification + commentaire

### Étapes

1. **Checkout** - Télécharger le code du repository
2. **Setup Node.js** - Installer Node.js v18
3. **Install dependencies** - `npm install`
4. **Build project** - `npm run build`
5. **Pre-deployment checks** - Vérifier la configuration
6. **Deploy to Vercel** - Déployer sur Vercel (main uniquement)
7. **Comment PR** - Ajouter un commentaire au PR (PR uniquement)

### Secrets requis

Pour que le workflow fonctionne, vous devez configurer ces secrets GitHub:

```
VERCEL_TOKEN        # Token d'authentification Vercel
VERCEL_ORG_ID       # ID de l'organisation Vercel
VERCEL_PROJECT_ID   # ID du projet Vercel
```

📖 Voir [GITHUB_SECRETS.md](../GITHUB_SECRETS.md) pour l'installation complète.

## 📊 Statuts de déploiement

Vous pouvez voir l'état de chaque déploiement dans GitHub:

1. Aller sur https://github.com/efoka24-ops/tru-website
2. Cliquer sur l'onglet **"Actions"**
3. Voir les workflows en cours et passés

### Symboles de statut

| Symbole | Signification |
|---------|---------------|
| ✅ | Build réussi |
| ❌ | Build échoué |
| ⏳ | Build en cours |
| ⊘ | Build annulé |

## 💡 Exemples d'utilisation

### Déclencher un déploiement automatique

```bash
# Faire un changement
echo "// Mon changement" >> src/App.jsx

# Committer
git add .
git commit -m "Update: Add my change"

# Pousser vers main
git push origin main

# Le workflow se déclenche automatiquement!
```

### Vérifier le statut

```bash
# Voir les workflows GitHub
gh workflow list

# Voir les derniers runs
gh run list

# Voir les détails d'un run spécifique
gh run view <RUN_ID>
```

## 🔧 Configuration manuelle

Si vous devez modifier le workflow:

1. Éditer `.github/workflows/deploy.yml`
2. Faire vos changements
3. Committer et pousser
4. Le nouveau workflow s'applique automatiquement

### Exemple: Ajouter une étape

```yaml
- name: Run tests
  run: npm test

- name: Deploy to Vercel
  # ... reste de la config
```

## ⚠️ Troubleshooting

### Le workflow ne se déclenche pas

**Solution:**
- Vérifier que vous avez activé GitHub Actions
- Vérifier que les secrets sont configurés
- Vérifier que vous pushez vers `main`

### Build échoue avec "VERCEL_TOKEN not found"

**Solution:**
- Aller sur https://github.com/efoka24-ops/tru-website/settings/secrets/actions
- Vérifier que `VERCEL_TOKEN` existe
- Vérifier que le token est correct (pas expiré)

### "Project not found" error

**Solution:**
- Vérifier `VERCEL_PROJECT_ID` dans les secrets
- Vérifier que le projet existe sur Vercel
- Vérifier que l'ID est correct

## 📈 Monitoring et logs

### Voir les logs en détail

1. GitHub > Actions > [Workflow name]
2. Cliquer sur le run que vous voulez voir
3. Cliquer sur "Build" pour voir les détails

### Vérifier les logs Vercel

1. Vercel Dashboard > Deployments
2. Cliquer sur le dernier déploiement
3. Voir les logs complets

## 🔄 Re-run un workflow

Si un déploiement échoue, vous pouvez le relancer:

1. GitHub > Actions
2. Sélectionner le workflow échoué
3. Cliquer "Re-run jobs"
4. Le workflow se relance automatiquement

## 📚 Documentation référence

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel GitHub Integration](https://vercel.com/docs/concepts/git/vercel-for-github)
- [Workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

## 🎯 Bonnes pratiques

✅ **À faire:**
- Tester localement avant de pusher
- Écrire des messages de commit clairs
- Monitorer les logs après le déploiement
- Garder les secrets secrets!

❌ **À éviter:**
- Committer les fichiers `.env`
- Pousser du code cassé sur main
- Modifier les secrets sans mise à jour
- Ignorer les erreurs de déploiement

## 🚨 Emergency: Rollback

Si le déploiement produit des erreurs critiques:

```bash
# Annuler le dernier commit
git revert HEAD

# Ou revenir à un commit spécifique
git revert <commit-hash>

# Pousser
git push origin main

# GitHub relancera automatiquement le workflow
# Vercel re-déploiera la version précédente
```

---

**Pour l'aide complète:** Voir [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)
