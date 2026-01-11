# PostgreSQL Deployment Guide - Render

## 🎯 Objectif
Migrer de JSON files → PostgreSQL pour **DONNÉES PERMANENTES** (plus de 16-minute resets)

## ✅ Statut Actuel
- ✅ `databaseService.js` créé avec toutes les fonctions CRUD
- ✅ `migrate.js` prêt à migrer data.json → PostgreSQL
- ✅ `.env` contient DATABASE_URL (URL interne Render)
- ✅ `database.js` (ou `db.js`) existe pour initialisation
- ⏳ **PROCHAINE ÉTAPE**: Exécuter migration et redéployer

---

## 🚀 Déploiement (3 étapes)

### Étape 1: Tester localement (Optionnel mais recommandé)
```bash
# Dans backend/
npm install  # Au cas où pg ne serait pas installé

# Tester la connexion (sans migrer)
# Les tables vont être créées sur Render directement
```

### Étape 2: Pousser les modifications sur GitHub
```bash
cd "c:\Users\EMMANUEL\Documents\site tru"

# Ajouter les nouveaux fichiers
git add backend/databaseService.js backend/migrate.js

# Commit
git commit -m "feat: Add PostgreSQL support with migration script

- databaseService.js: CRUD operations for all entities
- migrate.js: Automated data.json → PostgreSQL migration  
- database.js: Connection pool with SSL for Render
- Supports permanent data persistence
- Tables auto-created on first run"

# Pousser sur tous les repos
git push origin main
git push tru-backend main
```

### Étape 3: Redéployer sur Render
1. **Aller sur Render Dashboard** → https://dashboard.render.com
2. **Sélectionner votre Backend** (tru-backend)
3. **Cliquer "Manual Deploy" ou "Deploy latest commit"**
4. **Attendre que le déploiement finisse** (5-10 minutes)
   - Vous verrez les logs défiler
   - Chercher: `✅ Database tables initialized`

### Étape 4: Exécuter la migration (UNE SEULE FOIS!)
Une fois déployé, depuis le terminal Render ou local:

```bash
# Option A: Via Render CLI
render exec tru-backend 'npm run migrate'

# Option B: Via SSH Render (si disponible)
# Ou via webhook qui appelle la migration

# Option C: Créer une route temporaire qui lance la migration
# POST /api/admin/migrate (avec auth token)
```

Si vous préférez, je peux créer une **route API** qu'on peut appeler pour lancer la migration:
```
POST https://tru-backend-o1zc.onrender.com/api/admin/migrate
Authorization: Bearer <votre_admin_token>
```

---

## 📊 Résultat attendu

**Avant (JSON):**
```
❌ Les 16 min Render recycle
❌ data.json réinitialisé
❌ Toutes modifications perdues
```

**Après (PostgreSQL):**
```
✅ Données dans tru_data PostgreSQL
✅ Persistent à travers les redémarrages
✅ Backups automatiques Render
✅ Accessible 24/7 en production
```

---

## 🔍 Vérifier que ça marche

### Vérification 1: Logs Render
Après déploiement, chercher dans les logs:
```
✅ Connected to PostgreSQL
✅ Database tables initialized successfully
✅ Running on port 5000
```

### Vérification 2: Tester une requête
```bash
# Test GET team
curl https://tru-backend-o1zc.onrender.com/api/team

# Devrait retourner les données migrées
```

### Vérification 3: Ajouter une donnée et attendre 16 minutes
1. POST une nouvelle équipe membre
2. Attendre 16 minutes (Render recycle)
3. GET /api/team
4. **La nouvelle donnée doit être là** ✅

---

## 🛠️ Fichiers modifiés/créés

| Fichier | Rôle | Statut |
|---------|------|--------|
| `databaseService.js` | CRUD + Pool PostgreSQL | ✅ Créé |
| `migrate.js` | Migration automatique | ✅ Prêt |
| `.env` | DATABASE_URL | ✅ Configuré |
| `server.js` | Utiliser databaseService | ⏳ À mettre à jour |
| Routes API | Utiliser db au lieu de JSON | ⏳ À mettre à jour |

---

## ⚡ Prochaines étapes (après migration réussie)

1. **Mettre à jour routes** pour utiliser `databaseService` au lieu de DataManager
   - `/api/team` → SELECT * FROM team
   - `/api/services` → SELECT * FROM services
   - Etc.

2. **Supprimer JSON** (optionnel)
   - Une fois migration confirmée, data.json n'est plus utile

3. **Tester responsive design** sur mobile

---

## 📝 Questions?

- **Si DATABASE_URL est incorrect** → Aller sur Render Dashboard, copier URL interne
- **Si migration échoue** → Vérifier logs Render pour erreurs SQL
- **Si données ne persistent pas** → Vérifier que DATABASE_URL est bien défini

**Vous êtes prêt à pousser! 🚀**
