# 🚀 Guide de Déploiement Vercel - TRU GROUP

## 📋 Prérequis

1. **Compte Vercel** : https://vercel.com
2. **Vercel CLI** : `npm install -g vercel`
3. **Git** (déjà configuré)
4. **Node.js 18+**

---

## 🔧 Configuration Initiale

### 1. Connexion à Vercel

```bash
vercel login
```

Cela ouvrira votre navigateur pour vous authentifier.

---

## 📦 Déploiement des 3 Applications

### Option 1 : Déploiement Automatisé (Recommandé)

```bash
# Rendre le script exécutable (sur Linux/Mac)
chmod +x deploy-vercel.sh

# Lancer le déploiement
./deploy-vercel.sh
```

### Option 2 : Déploiement Manuel

#### **A. Backend (Express.js)**

```bash
cd backend

# Premier déploiement
vercel --prod --name tru-backend

# Les déploiements suivants
vercel --prod

cd ..
```

**Résultat attendu** : URL comme `https://tru-backend.vercel.app`

---

#### **B. Frontend (Vite + React)**

```bash
# Installer les dépendances
npm install

# Build pour production
npm run build

# Déployer
vercel --prod --name tru-frontend

# Les déploiements suivants
vercel --prod
```

**Résultat attendu** : URL comme `https://tru-frontend.vercel.app`

---

#### **C. Backoffice (Vite + React)**

```bash
cd backoffice

# Installer les dépendances
npm install

# Mettre à jour l'URL du backend
# Dans src/pages/AdminDashboard.jsx et autres fichiers:
# Remplacer: http://localhost:5000/api
# Par: https://tru-backend.vercel.app/api

# Build pour production
npm run build

# Déployer
vercel --prod --name tru-backoffice

# Les déploiements suivants
vercel --prod

cd ..
```

**Résultat attendu** : URL comme `https://tru-backoffice.vercel.app`

---

## ⚙️ Configuration des Variables d'Environnement

### Pour le Backend

Dans Vercel Dashboard → Settings → Environment Variables :

```
NODE_ENV = production
PORT = 3001
```

### Pour le Frontend

Dans Vercel Dashboard → Settings → Environment Variables :

```
VITE_API_URL = https://tru-backend.vercel.app/api
```

### Pour le Backoffice

Dans Vercel Dashboard → Settings → Environment Variables :

```
VITE_API_URL = https://tru-backend.vercel.app/api
```

---

## 🔗 Mise à Jour des URLs

Après le déploiement du backend, mettez à jour les URLs dans vos fichiers :

### Frontend (`src/pages/Team.jsx`)
```javascript
// Avant
const response = await fetch('http://localhost:5000/api/team');

// Après
const response = await fetch('https://tru-backend.vercel.app/api/team');
```

### Backoffice (`src/pages/AdminDashboard.jsx`)
```javascript
// Avant
const API_BASE = 'http://localhost:5000/api';

// Après
const API_BASE = 'https://tru-backend.vercel.app/api';
```

---

## ✅ Vérification du Déploiement

### 1. Vérifier que Backend fonctionne

```bash
curl https://tru-backend.vercel.app/api/health
# Résultat attendu: {"status":"Server is running"}
```

### 2. Vérifier que l'équipe se charge

```bash
curl https://tru-backend.vercel.app/api/team
# Résultat attendu: [...tableau des membres de l'équipe...]
```

### 3. Accéder aux applications

- **Frontend** : https://tru-frontend.vercel.app
- **Backoffice** : https://tru-backoffice.vercel.app
- **Backend API** : https://tru-backend.vercel.app/api

---

## 🔄 Redéployer après des changements

### Depuis Git (Recommandé)

```bash
# Faire vos changements
git add .
git commit -m "votre message"
git push origin main

# Vercel redéploie automatiquement (si intégration Git activée)
```

### Manuelle

```bash
# Frontend
npm run build && vercel --prod

# Backoffice
cd backoffice && npm run build && vercel --prod && cd ..

# Backend
cd backend && vercel --prod && cd ..
```

---

## 🐛 Dépannage

### Erreur : "Cannot find module"

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Erreur : "CORS"

Assurez-vous que le backend a CORS activé (`cors()` dans server.js)

### Erreur : "API non accessible"

1. Vérifier l'URL du backend dans le code
2. Vérifier que les routes existent: `vercel logs tru-backend`
3. Vérifier les variables d'environnement

### Vérifier les logs

```bash
# Logs du backend
vercel logs tru-backend --tail

# Logs du frontend
vercel logs tru-frontend --tail

# Logs du backoffice
vercel logs tru-backoffice --tail
```

---

## 📊 Domaine Personnalisé (Optionnel)

### Ajouter un domaine custom

1. Aller dans Vercel Dashboard
2. Sélectionner le projet
3. Settings → Domains
4. Ajouter votre domaine
5. Mettre à jour vos DNS records

Exemple :
```
app.trugroup.cm → tru-frontend.vercel.app
admin.trugroup.cm → tru-backoffice.vercel.app
api.trugroup.cm → tru-backend.vercel.app
```

---

## 📝 Checklist Finale

- [ ] Compte Vercel créé
- [ ] Vercel CLI installé
- [ ] Backend déployé
- [ ] Frontend déployé
- [ ] Backoffice déployé
- [ ] URLs mises à jour dans le code
- [ ] CORS activé sur le backend
- [ ] Variables d'environnement configurées
- [ ] Tests des API effectués
- [ ] Domaines personnalisés configurés (optionnel)

---

## 🎉 Bravo !

Votre application TRU GROUP est maintenant déployée sur Vercel ! 

**Accès** :
- 🌐 Frontend: https://tru-frontend.vercel.app
- 🛠️ Backoffice: https://tru-backoffice.vercel.app
- ⚙️ Backend API: https://tru-backend.vercel.app

Vous pouvez maintenant gérer vos contenus depuis le backoffice et les voir en temps réel sur le frontend !
