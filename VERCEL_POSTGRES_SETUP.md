# 🗄️ Configuration PostgreSQL sur Vercel

## 📋 RÉSUMÉ RAPIDE
Tu as choisi PostgreSQL avec Prisma Data Platform. Voici comment le configurer sur Vercel en 5 minutes.

---

## 🚀 ÉTAPE 1: Créer la Base de Données

### Option A: Vercel Postgres (RECOMMANDÉ - Plus simple)

1. **Va sur:** https://vercel.com/dashboard
2. **Sélectionne ton projet:** `tru-backend-five`
3. **Clique:** "Storage" → "Connect Store" → "Postgres"
4. **Clique:** "Create New" (ou "Connect Existing")
5. **Nomme ta DB:** `tru_group_db` ou `tru`
6. **Clique:** "Create"
7. **Copie les variables d'environnement** (tu vas les utiliser)

**Variables générées automatiquement:**
```
POSTGRES_URL=postgres://user:pass@...
POSTGRES_URL_NON_POOLING=postgres://user:pass@...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_USER=...
POSTGRES_DATABASE=...
```

---

### Option B: Prisma Data Platform (Déjà en place)

Tu as déjà:
```
PRISMA_DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=...
```

**Avantage:** Connection pooling automatique ✅
**Inconvénient:** Coût supplémentaire après limite gratuite

---

## 🔧 ÉTAPE 2: Configurer les Variables d'Environnement sur Vercel

### Pour chaque projet (Backend, Frontend, Backoffice):

1. **Va sur:** https://vercel.com/dashboard/[nom-du-projet]
2. **Clique:** "Settings"
3. **Clique:** "Environment Variables"
4. **Ajoute ces variables:**

#### Si tu utilises Vercel Postgres (Option A):
```
DATABASE_URL=<copie depuis Vercel Postgres>
POSTGRES_URL=<copie depuis Vercel Postgres>
NODE_ENV=production
PORT=5000
```

#### Si tu utilises Prisma Accelerate (Option B - RECOMMANDÉ):
```
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=<ta-clé>
PRISMA_DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=<ta-clé>
NODE_ENV=production
PORT=5000
```

5. **Clique:** "Save"

---

## 🌐 ÉTAPE 3: Frontend et Backoffice (Pas besoin de DB)

### Frontend (tru-website):
```
VITE_API_URL=https://tru-backend-five.vercel.app
```

### Backoffice (tru-backoffice):
```
VITE_BACKEND_URL=https://tru-backend-five.vercel.app
```

**Clique:** "Save" pour chaque projet

---

## 📤 ÉTAPE 4: Déployer le Backend

1. **Va sur Vercel Dashboard** → tru-backend-five
2. **Clique:** "Deployments"
3. **Clique sur le dernier déploiement**
4. **Clique:** "..." → "Redeploy"
5. **Attends:** 2-3 minutes pour la compilation

**Logs:**
```
✅ Building...
✅ Installing dependencies...
✅ Database initialization...
✅ Production deployment ready
```

---

## 🗂️ ÉTAPE 5: Migrer les Données (Une seule fois)

Après que le backend soit déployé:

### Option A: Via Vercel CLI (Local)
```bash
cd "c:\Users\EMMANUEL\Documents\site tru\backend"
npm install -g vercel
vercel env pull
npm run migrate
```

### Option B: Via Script SQL Direct
1. **Va à:** https://vercel.com/dashboard/tru-backend-five/storage
2. **Clique:** "Postgres" → "Data" ou "Query Console"
3. **Exécute les requêtes SQL** depuis `db.js` pour créer les tables

### Option C: Via fonction Vercel (Recommended)
1. **Crée:** `backend/migrate-vercel.js`
2. **Code:**
```javascript
import * as db from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    await db.initializeDatabase();
    const migrated = await migrateData();
    return res.status(200).json({ success: true, migrated });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function migrateData() {
  // Importe et migre data.json vers PostgreSQL
  const data = require('./data.json');
  // ... logique de migration
  return { count: '...' };
}
```

3. **Appelle le script:**
```bash
curl -X POST https://tru-backend-five.vercel.app/api/migrate \
  -H "Authorization: Bearer <token-secret>" \
  -H "Content-Type: application/json"
```

---

## ✅ ÉTAPE 6: Vérifier que ça Marche

### Test 1: API Backend
```bash
curl https://tru-backend-five.vercel.app/api/test
```

**Réponse attendue:**
```json
{
  "status": "OK",
  "message": "Backend is responding correctly",
  "timestamp": "...",
  "database": "connected"
}
```

### Test 2: Récupérer l'équipe
```bash
curl https://tru-backend-five.vercel.app/api/team
```

**Réponse:** `[]` ou array des membres

### Test 3: Frontend
```
https://tru-website.vercel.app/
```

**Vérifie:**
- F12 → Console
- Cherche: `🔗 API_BASE_URL: https://tru-backend-five.vercel.app/api`
- Membres de l'équipe apparaissent

### Test 4: Backoffice
```
https://tru-backoffice.vercel.app/
```

**Login:** admin@trugroup.cm / TRU2024!

**Teste:**
1. Va à "Team"
2. Essaie d'ajouter/modifier un membre
3. Upload une image
4. Clique "Save"
5. Vérifie qu'il n'y a pas d'erreur "Failed to fetch"

---

## 🔐 VARIABLES D'ENVIRONNEMENT (Récapitulatif)

### Backend (tru-backend-five):
```env
DATABASE_URL=<copie depuis Vercel Postgres OU Prisma>
POSTGRES_URL=<même que DATABASE_URL>
NODE_ENV=production
PORT=5000
SENDGRID_API_KEY=<optionnel>
TWILIO_ACCOUNT_SID=<optionnel>
TWILIO_AUTH_TOKEN=<optionnel>
```

### Frontend (tru-website):
```env
VITE_API_URL=https://tru-backend-five.vercel.app
```

### Backoffice (tru-backoffice):
```env
VITE_BACKEND_URL=https://tru-backend-five.vercel.app
```

---

## 🚨 DÉPANNAGE

### "Database connection failed"
**Solution:**
1. Vérifie que `DATABASE_URL` est dans les env vars
2. Redéploie le backend
3. Attends 30 secondes
4. Teste: `curl https://tru-backend-five.vercel.app/api/test`

### "invalid_connection_string"
**Solution:**
- Utilise `PRISMA_DATABASE_URL` (pooled) au lieu de `DATABASE_URL` (direct)
- Ou utilise Vercel Postgres qui fournit la bonne URL

### "No tables found"
**Solution:**
1. Migration n'a pas été exécutée
2. Lance: `npm run migrate` localement avec les bonnes env vars
3. Ou crée les tables manuellement via SQL Console de Vercel

### "Failed to fetch" en Frontend/Backoffice
**Solution:**
1. Vérifie: `VITE_API_URL` est configurée
2. Redéploie Frontend/Backoffice
3. Clears browser cache (Ctrl+Shift+Delete)

---

## 📊 ARCHITECTURE FINALE

```
┌─────────────────────────────────────────────────────┐
│                   VERCEL PLATFORM                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frontend (tru-website)                            │
│  ├─ VITE_API_URL = backend URL                     │
│  └─ Points to: Backend API                         │
│                                                     │
│  Backoffice (tru-backoffice)                       │
│  ├─ VITE_BACKEND_URL = backend URL                 │
│  └─ Points to: Backend API                         │
│                                                     │
│  Backend (tru-backend-five)                        │
│  ├─ DATABASE_URL = PostgreSQL                      │
│  ├─ POSTGRES_URL = PostgreSQL                      │
│  └─ Points to: Vercel Postgres OR Prisma           │
│                                                     │
│  PostgreSQL Database                               │
│  ├─ Via: Vercel Postgres (Native) OR              │
│  └─ Via: Prisma Data Platform (Pooled)            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ⏱️ TIMELINE

- **Étape 1:** 2 minutes (créer DB)
- **Étape 2:** 3 minutes (ajouter env vars)
- **Étape 3:** 1 minute (frontend/backoffice env vars)
- **Étape 4:** 3 minutes (redéployer backend)
- **Étape 5:** 2 minutes (migrer données)
- **Étape 6:** 2 minutes (tester)

**Total: ~13 minutes ⚡**

---

## 🎯 PROCHAINES ÉTAPES

1. **Crée la database** (Étape 1)
2. **Ajoute les env vars** (Étape 2-3)
3. **Redéploie** (Étape 4)
4. **Migre les données** (Étape 5)
5. **Teste tout** (Étape 6)
6. **Push les changements:**
```bash
cd "c:\Users\EMMANUEL\Documents\site tru"
git add .
git commit -m "feat: PostgreSQL configuration for Vercel"
git push origin main
```

---

**✅ Tu es prêt!** Commence par l'Étape 1 maintenant.
