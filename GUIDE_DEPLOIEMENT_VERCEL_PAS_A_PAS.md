# 🚀 GUIDE COMPLET - Déployer Backend & Backoffice sur Vercel

## 📌 Situation Actuelle

Tu as un **projet Git** avec 3 dossiers dans le même repository:
```
tru-website/
  ├── frontend (site principal) 
  ├── backend (API Express)
  └── backoffice (admin panel)
```

Vercel voit ton projet comme **1 seul dépôt**, mais tu dois le découper en **3 projets Vercel séparés**.

---

## ✅ ÉTAPE 1: Vérifier tes fichiers de configuration

Avant de commencer, assure-toi que ces fichiers existent:

### ✓ Root (Frontend)
```
vercel.json ✓
.vercelignore ✓
```

### ✓ Dans `/backend`
```
backend/vercel.json ✓
backend/.vercelignore ✓
backend/server.js ✓
backend/package.json ✓
```

### ✓ Dans `/backoffice`
```
backoffice/vercel.json ✓
backoffice/.vercelignore ✓
backoffice/package.json ✓
```

**Status**: ✅ Tous les fichiers sont prêts!

---

## 🔴 ÉTAPE 2: Déployer le BACKEND (API)

### 2.1 - Ouvrir Vercel

1. Va sur: **https://vercel.com/new**
2. Tu dois être connecté avec ton compte (celui qui a `tru-website`)

### 2.2 - Importer le repo

1. Clique sur **"Import Git Repository"**
2. Cherche et clique sur **`efoka24-ops/tru-website`**

**Tu vois**: Une page avec des options de configuration

### 2.3 - Configurer le ROOT DIRECTORY

**C'EST L'ÉTAPE CRUCIALE!**

1. Tu vois un champ: **"Root Directory"** (vide par défaut)
2. Clique dessus
3. Tape ou sélectionne: **`backend`**
4. Tu dois voir: ✓ `backend/` (avec un checkmark)

### 2.4 - Ajouter un NOM

1. En haut, tu vois "Project Name"
2. Change-le en: **`tru-backend`**

### 2.5 - Cliquer DEPLOY

1. Clique sur le bouton **"Deploy"** (bleu, en bas à droite)
2. **Attends 2-3 minutes** pendant le déploiement
3. Quand tu vois ✅ **"Congratulations! Your project has been successfully deployed"**

### 2.6 - 🎯 NOTE l'URL du Backend

Tu vois une URL comme:
```
https://tru-backend-xxxxx.vercel.app
```

**COPIE ET GARDE CETTE URL QUELQUE PART!** 📝

**Exemple** (ta URL sera différente):
```
https://tru-backend-a1b2c3d4.vercel.app
```

---

## 🟢 ÉTAPE 3: Déployer le BACKOFFICE (Admin Panel)

### 3.1 - Ouvrir Vercel à nouveau

1. Va sur: **https://vercel.com/new**

### 3.2 - Importer le repo

1. Clique sur **"Import Git Repository"**
2. Cherche et clique sur **`efoka24-ops/tru-website`** (encore une fois)

### 3.3 - Configurer le ROOT DIRECTORY

1. Tu vois le champ: **"Root Directory"**
2. Clique dessus
3. Tape: **`backoffice`**
4. Tu dois voir: ✓ `backoffice/` (avec un checkmark)

### 3.4 - Ajouter un NOM

1. "Project Name" → change-le en: **`tru-backoffice`**

### 3.5 - IMPORTANT: Ajouter des Variables d'Environnement

**Avant de cliquer Deploy**, tu vois une section:
**"Environment Variables"** (ou "Settings")

1. Clique sur **"Environment Variables"**
2. Ajoute:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://tru-backend-xxxxx.vercel.app`
   
   *(Remplace `xxxxx` par l'URL que tu as copiée à l'étape 2.6)*

3. Clique **"Add"**

### 3.6 - Cliquer DEPLOY

1. Clique sur **"Deploy"** (bleu)
2. **Attends 2-3 minutes**
3. Quand tu vois ✅ **"Congratulations!..."**

### 3.7 - 🎯 NOTE l'URL du Backoffice

Tu vois une URL comme:
```
https://tru-backoffice-xxxxx.vercel.app
```

**COPIE CETTE URL!** 📝

---

## 🟡 ÉTAPE 4: Vérifier le Frontend

Le frontend (site principal) devrait déjà être déployé.

### 4.1 - Aller sur le dashboard Vercel

1. Va sur: **https://vercel.com/dashboard**
2. Tu vois tes 3 projets:
   - ✅ `tru-website` (Frontend)
   - ✅ `tru-backend` (Backend API)
   - ✅ `tru-backoffice` (Admin)

### 4.2 - Note l'URL du Frontend

Clique sur `tru-website` et note l'URL:
```
https://tru-website.vercel.app
```

---

## 🟣 ÉTAPE 5: Mettre à Jour le CODE

Maintenant que tu as les URLs, il faut les ajouter dans le code.

### 5.1 - Ouvrir le fichier `backoffice/src/pages/AdminDashboard.jsx`

1. Cherche cette ligne:
```javascript
const API_BASE = 'http://localhost:5000/api';
```

2. Remplace-la par:
```javascript
const API_BASE = 'https://tru-backend-xxxxx.vercel.app/api';
```

**ATTENTION**: Remplace `xxxxx` par ta vraie URL du backend!

### 5.2 - Vérifier les autres fichiers admin

Cherche la même ligne dans tous les fichiers admin:
- `backoffice/src/pages/AdminServices.jsx`
- `backoffice/src/pages/AdminSolutions.jsx`
- `backoffice/src/pages/AdminTestimonials.jsx`
- `backoffice/src/pages/AdminSettings.jsx`

Remplace partout `localhost:5000` par ton URL Vercel.

### 5.3 - Sauvegarder et Commit

1. Ouvre le terminal (dans VS Code)
2. Tape:
```bash
git add .
git commit -m "Feat: Update API URLs for Vercel production"
git push origin main
```

3. **ATTENDS 2 minutes** → Vercel redéploie automatiquement!

---

## 🧪 ÉTAPE 6: Vérifier que ça marche

### 6.1 - Tester le Backend

Ouvre un terminal et tape:
```bash
curl https://tru-backend-xxxxx.vercel.app/api/health
```

Tu dois voir:
```json
{"status":"Server is running"}
```

### 6.2 - Tester les données Team

```bash
curl https://tru-backend-xxxxx.vercel.app/api/team
```

Tu dois voir la liste de tes 5 membres d'équipe en JSON.

### 6.3 - Ouvrir le Frontend

1. Va sur: `https://tru-website.vercel.app`
2. Vérifie que la page "Team" affiche correctement tes membres

### 6.4 - Ouvrir le Backoffice

1. Va sur: `https://tru-backoffice-xxxxx.vercel.app`
2. Clique sur "Team" dans le menu
3. **Essaie d'ajouter une nouvelle personne**:
   - Clique sur "Add Team Member"
   - Remplis le formulaire
   - Clique "Save"
   - Tu dois voir le message ✅ "Team member added successfully!"

---

## 📋 CHECKLIST FINALE

Coche chaque étape quand c'est fait:

- [ ] Backend déployé sur Vercel (URL copiée)
- [ ] Backoffice déployé sur Vercel (URL copiée)
- [ ] Variables d'environnement du backoffice ajoutées
- [ ] Code mis à jour avec les URLs de production
- [ ] Git push effectué
- [ ] Backend testée (curl health check)
- [ ] Frontend chargée et affiche Team
- [ ] Backoffice chargée et affiche Admin Panel
- [ ] Test CRUD: Ajouter/modifier/supprimer un membre d'équipe
- [ ] 🎉 Tout fonctionne!

---

## 🆘 EN CAS DE PROBLÈME

### ❌ "Cannot GET /"
**Cause**: Vercel ne trouve pas ton app  
**Solution**: Vérifie que le "Root Directory" est correct

### ❌ "API not reachable" ou "Backend not found"
**Cause**: URL du backend incorrecte  
**Solution**: 
- Vérifie l'URL exacte du backend
- Assure-toi qu'il n'y a pas d'espaces
- Réfais le curl test

### ❌ "Build failed"
**Cause**: Erreur de compilation  
**Solution**:
1. Va dans Vercel Dashboard
2. Clique sur le projet qui a échoué
3. Clique sur "Deployments"
4. Clique sur le déploiement échoué en rouge
5. Lis les logs pour voir l'erreur
6. Corrige le code, puis `git push`

### ❌ "Module not found"
**Cause**: Package npm manquant  
**Solution**:
1. Assure-toi que `package.json` a toutes les dépendances
2. Dans Vercel, Settings → Install Command → `npm install`

### ❌ Vercel affiche une page vide
**Cause**: Variable d'environnement mal configurée  
**Solution**:
- Va dans Project Settings → Environment Variables
- Vérifie `VITE_API_URL`
- Assure-toi qu'elle est correcte
- Réfais un déploiement

---

## 💡 ASTUCES

✅ **Chaque `git push` déclenche un redéploiement** - Pas besoin de faire quoi que ce soit, Vercel le fait automatiquement!

✅ **Vérifier les logs de déploiement** - Vercel Dashboard → Deployments → Clique sur un déploiement pour voir les détails

✅ **Les URLs Vercel ne changent pas** - Une fois déployé, l'URL reste la même (sauf si tu supprime le projet)

✅ **Vercel génère des URLs de preview** - Pour chaque branche Git, tu as une URL différente (utile pour tester avant de merger)

---

## 🎉 C'EST TOUT!

Une fois que tu as suivi ces 6 étapes:

- ✅ Frontend accessible: `https://tru-website.vercel.app`
- ✅ Backend accessible: `https://tru-backend-xxxxx.vercel.app`
- ✅ Backoffice accessible: `https://tru-backoffice-xxxxx.vercel.app`
- ✅ Tout fonctionne en production!

**Tes utilisateurs peuvent maintenant visiter ton site et tu peux gérer le contenu depuis l'admin panel!** 🌍

---

## 📞 Besoin d'aide?

Si tu es bloqué:
1. **Lis les logs** sur Vercel Dashboard
2. **Essaie les commandes curl** pour tester
3. **Revérifie les URLs** (c'est souvent ça!)
4. **Demande sur Discord Vercel** ou contacte le support

**Bon courage! 🚀**
