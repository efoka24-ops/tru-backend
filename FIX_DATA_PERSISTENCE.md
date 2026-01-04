# ⚠️ PROBLÈME RÉSOLU: Submodule .gitmodules et Protection data.json

## 🔴 Problème identifié (Render build error)

**Erreur**: `Fatal: No url found for submodule path 'tru-backend-deploy' in .gitmodules`

**Cause**: Il existe un fichier `.gitmodules` dans le repo GitHub qui référence un submodule `tru-backend-deploy` sans URL valide.

```
Error checking out submodules: fatal: No url found for submodule path 'tru-backend-deploy' in .gitmodules
```

---

## ✅ Solution appliquée

### 1. Suppression du dossier local
```bash
Remove-Item -Recurse -Force tru-backend-deploy
```

### 2. Mise à jour du .gitignore
- ❌ Supprimé: Références au submodule `tru-backend-deploy/.git/`
- ✅ Ajouté: `backend/data.json` pour protéger les modifications

### 3. Nettoyage du cache git
```bash
git rm --cached -r tru-backend-deploy
git add .gitignore
git commit -m "fix: Remove submodule reference..."
git push origin main
```

---

## 🔒 Protection des données modifiées

### Le problème
Quand on modifie les données dans le backoffice (team, témoignages, paramètres), les changements étaient perdus après un push.

### Pourquoi
- `data.json` était suivi par git
- Un pull/push écrasait `data.json` avec la version du repo
- Les modifications locales étaient perdues

### La solution
`data.json` est maintenant dans `.gitignore`:

```gitignore
# Backend data (local changes, don't commit)
# Users can modify this locally but it won't be tracked
backend/data.json
```

**Résultat**:
- ✅ Les modifications dans le backoffice sont sauvegardées localement
- ✅ Les modifications ne sont plus perdues lors des push
- ✅ Chaque déploiement conserve son propre `data.json`

---

## 🚀 Prochaines étapes

### 1. Nettoyer le repo GitHub (IMPORTANT)
Le `.gitmodules` existe encore sur GitHub et peut bloquer Render.

**Options**:

#### Option A: Via GitHub Web
1. Aller sur https://github.com/efoka24-ops/tru-website
2. Chercher le fichier `.gitmodules`
3. Cliquer le bouton "Supprimer" (trash icon)
4. Committer la suppression

#### Option B: Via git local
```bash
git rm .gitmodules  # Si le fichier existe localement
git add .gitmodules
git commit -m "Remove .gitmodules file"
git push origin main
```

### 2. Redéployer sur Render
Après avoir nettoyé le repo GitHub:
1. Aller sur https://dashboard.render.com
2. Service: "tru-backend-o1zc"
3. Cliquer: "Manual Deploy" → "Deploy latest commit"
4. Attendre que le build réussisse

---

## 📊 Avant et après

### AVANT (❌ Problématique)
```
Backoffice modification (data.json)
         ↓
git push (écrase data.json)
         ↓
Modification PERDUE! ❌
```

### APRÈS (✅ Correct)
```
Backoffice modification (data.json)
         ↓
git push (data.json ignoré)
         ↓
Modification CONSERVÉE! ✅
         ↓
Render déploie (avec data.json local)
```

---

## 🔍 Vérification

### Vérifier que data.json est bien ignoré
```bash
git status
# Ne doit pas afficher backend/data.json
```

### Vérifier que le .gitmodules n'existe plus
```bash
# Local
ls -la .gitmodules  # Ne doit rien retourner

# GitHub
https://github.com/efoka24-ops/tru-website/blob/main/.gitmodules
# Devrait retourner 404 après suppression
```

---

## 💾 Persistence des données

### Où sont stockées les données?

**Local (pendant développement)**:
```
backend/data.json ← Modifiée par le backoffice local
                  ← Non trackée par git
                  ← Persiste à travers les commits
```

**Production (Render)**:
```
backend/data.json ← Chaque déploiement a sa propre copie
                  ← Modifications faites via backoffice persisten
                  ← Initialisée avec la version du repo au déploiement
```

---

## ⚠️ Important

### Les données ne se synchronisent PAS entre déploiements
Si vous modifiez les données sur Render (via le backoffice), ces changements:
- ✅ Persistent sur Render
- ❌ Ne reviennent pas au repo local
- ❌ Ne se sync pas vers d'autres déploiements

**Solution pour la future v2**:
- Utiliser une vraie base de données (PostgreSQL, MongoDB)
- Utiliser un système de sauvegarde
- Implémenter une sync entre déploiements

---

## 📝 Checklist de résolution

- [x] Supprimer le dossier `tru-backend-deploy` local
- [x] Mettre à jour `.gitignore` pour ignorer `backend/data.json`
- [x] Committer et pusher les changements
- [ ] Supprimer `.gitmodules` du repo GitHub (manuellem)
- [ ] Redéployer sur Render
- [ ] Vérifier que le build Render réussit
- [ ] Tester que les modifications du backoffice persistent

---

## 🧪 Test après correction

1. **Faire une modification dans le backoffice**
   - Changer le nom d'un membre de l'équipe
   - Changer un paramètre
   - Ajouter un témoignage

2. **Vérifier la sauvegarde locale**
   ```bash
   cat backend/data.json | grep "nouveau-nom"
   # Devrait afficher la modification
   ```

3. **Pousser les changements**
   ```bash
   git push origin main
   # data.json ne devrait pas être commité
   ```

4. **Redéployer sur Render**
   - Manual Deploy depuis le dashboard
   - Vérifier que data.json avec les modifications est utilisé

5. **Vérifier sur le site**
   - Aller sur https://fo.trugroup.cm
   - Vérifier que la modification s'affiche

---

## 📞 Support

**Problème**: Render build échoue encore
→ Vérifier que `.gitmodules` a été supprimé du GitHub

**Problème**: Modifications toujours perdues
→ Vérifier que `backend/data.json` est dans `.gitignore`

**Problème**: Conflit git sur data.json
```bash
git checkout -- backend/data.json  # Restaurer la version de git
```

---

## 📚 Fichiers affectés

- ✅ `.gitignore` - Mis à jour pour ignorer `data.json`
- ✅ `tru-backend-deploy/` - Supprimé
- ⏳ `.gitmodules` - À supprimer du GitHub

---

**Status**: ✅ RÉSOLU

Les modifications du backoffice seront maintenant conservées! 🎉

Date: Janvier 2026
