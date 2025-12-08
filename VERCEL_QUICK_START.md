# 🚀 DEPLOYMENT GUIDE - TRU GROUP on Vercel

## Déploiement Rapide (5 minutes)

### Step 1️⃣ : Backend (API)

1. Aller sur **https://vercel.com/new**
2. Clicker "Import Git Repository"
3. Connecter votre GitHub (efoka24-ops/tru-website)
4. Dans "Root Directory", sélectionner **`./backend`**
5. Clicker "Deploy"
6. ✅ Note l'URL du backend (ex: `https://tru-backend.vercel.app`)

---

### Step 2️⃣ : Frontend (Site Principal)

1. Aller sur **https://vercel.com/new**
2. Clicker "Import Git Repository" → tru-website
3. Dans "Root Directory", garder `.` (racine)
4. Clicker "Deploy"
5. ✅ Note l'URL du frontend (ex: `https://tru-frontend.vercel.app`)

---

### Step 3️⃣ : Backoffice (Administration)

1. Aller sur **https://vercel.com/new**
2. Clicker "Import Git Repository" → tru-website
3. Dans "Root Directory", sélectionner **`./backoffice`**
4. Avant Deploy, ajouter **Environment Variables** :

```
VITE_API_URL = https://tru-backend.vercel.app
```

5. Clicker "Deploy"
6. ✅ Backoffice déployé !

---

## ✅ Vérification

### Test Backend

```bash
curl https://tru-backend.vercel.app/api/health

# Résultat:
# {"status":"Server is running"}
```

### Test Team Data

```bash
curl https://tru-backend.vercel.app/api/team

# Résultat: Liste des membres de l'équipe
```

---

## 🔗 Accès Final

| Application | URL |
|------------|-----|
| **Frontend** | https://tru-frontend.vercel.app |
| **Backoffice** | https://tru-backoffice.vercel.app |
| **Backend API** | https://tru-backend.vercel.app |

---

## 📝 Après le Déploiement

### Mettre à jour le code pour Vercel

Si vous modifiez le code plus tard :

```bash
# Faire les changements
git add .
git commit -m "Update: description du changement"
git push origin main

# Vercel redéploie automatiquement !
```

---

## 🎯 Troubleshooting

### ❌ "Cannot find module"
**Solution** : Aller dans Settings → Install Command → `npm install`

### ❌ "CORS Error"
**Solution** : Backend a déjà CORS activé, vérifier l'URL

### ❌ "API not reachable"
**Solution** : Vérifier l'URL du backend dans le code du backoffice

---

## 💡 Tips

✅ Chaque push sur `main` déclenche un redéploiement automatique  
✅ Vercel génère des URLs de preview pour chaque Pull Request  
✅ Vérifier les logs : Vercel Dashboard → Deployments → Logs  
✅ Vous pouvez ajouter un domaine personnalisé plus tard

---

## 🎉 C'est Fait !

Votre application est maintenant en ligne et accessible au monde entier ! 🌍

Les utilisateurs peuvent visiter votre site et vous pouvez gérer le contenu depuis le backoffice.

**Besoin d'aide ?** Consultez `DEPLOY_VERCEL.md` pour plus de détails.
