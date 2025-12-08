# 📝 ÉTAPE 5 - EXPLICATION DÉTAILLÉE

## 🎯 Qu'est-ce que tu dois faire?

**Problème**: Ton backoffice (admin) cherche le backend sur `http://localhost:5000`
- ✅ Ça marche en local (sur ton ordinateur)
- ❌ Ça ne marche PAS en production (Vercel)

**Solution**: Remplacer `localhost:5000` par l'URL Vercel du backend

---

## 📍 Où sont les endroits à modifier?

Tu as **2 fichiers** à modifier dans le dossier `backoffice/src/pages/`:

### Fichier 1: `EquipePage.jsx` (ligne 26)
```javascript
// AVANT:
const BACKEND_API_URL = 'http://localhost:5000/api';

// APRÈS:
const BACKEND_API_URL = 'https://tru-backend-abc123.vercel.app/api';
```

### Fichier 2: `SyncViewPage.jsx` (ligne 67)
```javascript
// AVANT:
const response = await fetch('http://localhost:5000/api/team');

// APRÈS:
const response = await fetch('https://tru-backend-abc123.vercel.app/api/team');
```

---

## ❓ Qu'est-ce que `abc123`?

C'est **l'URL du backend que tu as copiée à l'Action 1**.

**Exemple réel**:
```
https://tru-backend-a1b2c3d4e5.vercel.app
```

Si tu ne l'as pas, va sur:
- **https://vercel.com/dashboard**
- Cherche le projet `tru-backend`
- L'URL est en haut (exemple: `https://tru-backend-a1b2c3d4e5.vercel.app`)

---

## 📋 ÉTAPES POUR FAIRE LES MODIFICATIONS

### Étape 1: Copie ton URL Vercel du backend

1. Va sur **https://vercel.com/dashboard**
2. Clique sur le projet **`tru-backend`**
3. Tu vois en haut une URL comme:
   ```
   https://tru-backend-xyz123.vercel.app
   ```
4. **Copie cette URL** (Ctrl+C)

**Garde-la à côté** pendant que tu fais les modifications!

---

### Étape 2: Modifier le fichier `EquipePage.jsx`

#### Méthode 1: Avec VS Code (recommandé)

1. Ouvre VS Code
2. Ouvre le fichier: `backoffice/src/pages/EquipePage.jsx`
3. Appuie sur **Ctrl+F** (recherche)
4. Tape: `localhost:5000`
5. Tu vois une ligne comme:
   ```javascript
   const BACKEND_API_URL = 'http://localhost:5000/api';
   ```
6. Clique dessus pour le sélectionner
7. Tape la nouvelle URL (en remplaçant `xyz123` par ta vraie URL):
   ```javascript
   const BACKEND_API_URL = 'https://tru-backend-xyz123.vercel.app/api';
   ```
8. **Appuie sur Entrée** pour confirmer

**Résultat**: Cette ligne change!

---

### Étape 3: Modifier le fichier `SyncViewPage.jsx`

1. Ouvre le fichier: `backoffice/src/pages/SyncViewPage.jsx`
2. Appuie sur **Ctrl+F** (recherche)
3. Tape: `localhost:5000`
4. Tu vois une ligne vers la ligne 67:
   ```javascript
   const response = await fetch('http://localhost:5000/api/team');
   ```
5. Change-la en:
   ```javascript
   const response = await fetch('https://tru-backend-xyz123.vercel.app/api/team');
   ```

---

## 🔄 Étape 4: Sauvegarder et Synchroniser

Une fois que tu as modifié les 2 fichiers:

### 1️⃣ Ouvre un terminal (dans VS Code)

Appuie sur **Ctrl + `** (backtick)

Tu vois un terminal en bas.

### 2️⃣ Tape ces commandes (une après l'autre):

```bash
git add .
```

Puis:

```bash
git commit -m "Chore: Update backend API URLs for Vercel production"
```

Puis:

```bash
git push origin main
```

Tu vois:
```
Enumerating objects: ...
```

**Attends quelques secondes...**

Quand tu vois:
```
✓ Done
```

C'est fini! ✅

### 3️⃣ Vercel redéploie automatiquement

Tu n'as rien à faire!
- Vercel reçoit le push
- Recompile ton backoffice
- Remet à jour en live
- **En 2-3 minutes, ton backoffice utilise la nouvelle URL!**

---

## ✅ COMMENT VÉRIFIER QUE C'EST BON?

### Après le push:

1. Va sur **https://vercel.com/dashboard**
2. Clique sur **`tru-backoffice`**
3. Tu vois un déploiement en cours (spinner bleu)
4. **Attends qu'il devienne vert** ✅
5. Ouvre l'URL du backoffice: `https://tru-backoffice-xyz.vercel.app`
6. Clique sur **"Team"** ou **"Équipe"**
7. Tu dois voir tes membres d'équipe chargés du backend
8. **Essaie d'ajouter une nouvelle personne**:
   - Remplis le formulaire
   - Clique "Save"
   - Tu dois voir: ✅ "Success!"

Si ça marche, **l'étape 5 est complète!** 🎉

---

## 🆘 SI ÇA NE MARCHE PAS

### Problème: "Cannot reach backend" ou "API Error"

**Causes possibles**:

1. ❌ L'URL du backend est incorrecte
   - **Solution**: Vérifie que tu as copié la bonne URL de Vercel

2. ❌ Tu as oublié `/api` à la fin
   - **Solution**: L'URL doit être: `https://tru-backend-xyz.vercel.app/api`

3. ❌ Le backend n'est pas encore déployé
   - **Solution**: Assure-toi que le projet `tru-backend` est ✅ en vert sur Vercel

4. ❌ Vercel n'a pas encore redéployé le backoffice
   - **Solution**: Attends 3 minutes, puis actualise la page (F5)

### Problème: VS Code ne reconnait pas les changements

- **Solution**: Sauvegarde les fichiers:
  - Clique sur le fichier
  - Appuie sur **Ctrl+S**
  - Tu dois voir un petit point blanc disparaitre du titre

---

## 📝 RÉSUMÉ RAPIDE

**Tu dois**:
1. ✅ Copier l'URL du backend depuis Vercel
2. ✅ Modifier 2 fichiers dans `backoffice/src/pages/`:
   - `EquipePage.jsx` (ligne 26)
   - `SyncViewPage.jsx` (ligne 67)
3. ✅ Remplacer `http://localhost:5000` par ton URL Vercel
4. ✅ `git add .` + `git commit` + `git push`
5. ✅ Attendre que Vercel redéploie (2-3 min)
6. ✅ Tester que ça marche

**C'est tout!** 🚀

---

## 💡 EXEMPLE COMPLET

**Disons que ton URL Vercel du backend est**:
```
https://tru-backend-abc123def456.vercel.app
```

**Fichier 1 - EquipePage.jsx**:
```javascript
// AVANT:
const BACKEND_API_URL = 'http://localhost:5000/api';

// APRÈS:
const BACKEND_API_URL = 'https://tru-backend-abc123def456.vercel.app/api';
```

**Fichier 2 - SyncViewPage.jsx**:
```javascript
// AVANT:
const response = await fetch('http://localhost:5000/api/team');

// APRÈS:
const response = await fetch('https://tru-backend-abc123def456.vercel.app/api/team');
```

**Terminal**:
```bash
git add .
git commit -m "Update: Backend URLs for Vercel production"
git push origin main
```

**Résultat**: ✅ Tout fonctionne en production!

---

## 🎉 TU ES PRÊT!

Si tu suis ces étapes à la lettre, ça va marcher 100%.

**Besoin d'aide?** Poste-moi une capture d'écran ou décris exactement où tu es bloqué!
