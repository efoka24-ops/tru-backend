# 🚀 ACTION IMMÉDIATE - Déployer Backend & Backoffice

**Tu as déjà déployé le site? Excellent! 🎉**

Maintenant, il faut déployer le backend et le backoffice **en 3 minutes chrono**.

---

## 📌 Ce que tu as dans ton repo

```
tru-website/                    ← Déployé ✅
├── frontend (src/, package.json) → Site principal live
├── backend/                     ← À déployer
│   ├── server.js
│   ├── data.json
│   ├── package.json
│   └── vercel.json ✅
└── backoffice/                  ← À déployer
    ├── src/
    ├── package.json
    └── vercel.json ✅
```

---

## 🎯 PLAN: 3 projets Vercel

| Projet | Root Dir | Status |
|--------|----------|--------|
| Frontend (tru-website) | `.` | ✅ FAIT |
| Backend (tru-backend) | `./backend` | 🔴 À FAIRE |
| Backoffice (tru-backoffice) | `./backoffice` | 🔴 À FAIRE |

---

## ⚡ ACTION 1: Déployer le BACKEND (5 min)

### 1️⃣ Ouvre ce lien:
```
https://vercel.com/new
```

### 2️⃣ Importe ton repo GitHub
- Clique **"Import Git Repository"**
- Cherche: **`efoka24-ops/tru-website`**
- Clique dessus

### 3️⃣ Configure le déploiement
**IMPORTANT**: Dans le formulaire, tu dois voir:
```
Project Name: tru-website (change-le)
Root Directory: .  (change-le)
```

**À faire**:
1. **Project Name** → Remplace par: `tru-backend`
2. **Root Directory** → Clique dessus et tape: `backend`

### 4️⃣ Clique DEPLOY
- Attends 2-3 minutes
- Tu vois: ✅ "Congratulations! Your project has been successfully deployed"

### 5️⃣ COPIE L'URL
Tu vois quelque chose comme:
```
https://tru-backend-abc123.vercel.app
```

**GARDE CETTE URL! 📝 Tu en auras besoin pour le backoffice.**

---

## ⚡ ACTION 2: Déployer le BACKOFFICE (5 min)

### 1️⃣ Ouvre à nouveau:
```
https://vercel.com/new
```

### 2️⃣ Importe le même repo
- **"Import Git Repository"**
- **`efoka24-ops/tru-website`**

### 3️⃣ Configure
1. **Project Name** → `tru-backoffice`
2. **Root Directory** → `backoffice`

### 4️⃣ IMPORTANT: Ajoute la variable d'environnement
Tu vois une section **"Environment Variables"** (ou scroll down).

Clique **"Add"** et remplis:
- **Name**: `VITE_API_URL`
- **Value**: `https://tru-backend-abc123.vercel.app`

*(Remplace `abc123` par l'URL que tu as copiée à l'action 1)*

### 5️⃣ Clique DEPLOY
- Attends 2-3 minutes

### 6️⃣ COPIE L'URL du Backoffice
```
https://tru-backoffice-def456.vercel.app
```

---

## 🔧 ACTION 3: Mettre à jour le code (2 min)

Le backoffice doit connaître l'URL du backend pour fonctionner.

### 1️⃣ Ouvre le fichier:
```
backoffice/src/pages/AdminDashboard.jsx
```

### 2️⃣ Cherche cette ligne:
```javascript
const API_BASE = 'http://localhost:5000/api';
```

### 3️⃣ Remplace-la par:
```javascript
const API_BASE = 'https://tru-backend-abc123.vercel.app/api';
```

*(Remplace `abc123` par ta vraie URL du backend)*

### 4️⃣ Fais la même chose dans:
- `backoffice/src/pages/AdminServices.jsx`
- `backoffice/src/pages/AdminSolutions.jsx`
- `backoffice/src/pages/AdminTestimonials.jsx`
- `backoffice/src/pages/AdminSettings.jsx`

**Cherche et remplace**: `http://localhost:5000/api` → `https://tru-backend-abc123.vercel.app/api`

### 5️⃣ Commit et push:
```bash
git add .
git commit -m "Chore: Update API URLs for Vercel production"
git push origin main
```

**Vercel redéploie automatiquement!** ✅

---

## ✅ APRÈS LES DÉPLOIEMENTS

Tu dois avoir 3 URLs actives:

```
🌐 Frontend:    https://tru-website.vercel.app
🔧 Backend:     https://tru-backend-abc123.vercel.app
🎛️  Backoffice: https://tru-backoffice-def456.vercel.app
```

---

## 🧪 VÉRIFICATION RAPIDE

Ouvre un terminal et tape:

```bash
# Test 1: Vérifie que le backend répond
curl https://tru-backend-abc123.vercel.app/api/health

# Résultat attendu:
# {"status":"Server is running"}
```

Si tu vois ce message, le backend est ✅ en direct!

---

## 🎉 C'EST TOUT!

| Étape | Status | URL |
|-------|--------|-----|
| 1. Frontend | ✅ Fait | https://tru-website.vercel.app |
| 2. Backend | À faire | https://tru-backend-xxx.vercel.app |
| 3. Backoffice | À faire | https://tru-backoffice-xxx.vercel.app |

---

## 💡 RECAP EN 30 SECONDES

1. **https://vercel.com/new** → `efoka24-ops/tru-website` → Root = `backend` → Deploy ✅
2. **https://vercel.com/new** → `efoka24-ops/tru-website` → Root = `backoffice` → Ajoute `VITE_API_URL` → Deploy ✅
3. Mets à jour le code avec l'URL du backend → `git push` ✅

**Voilà! 🚀**
