# 🚀 Migration vers PostgreSQL - Guide de Déploiement

## 📋 Résumé des changements

✅ **Remplacé:** data.json → PostgreSQL
✅ **Créé:** db.js (couche d'abstraction PostgreSQL)
✅ **Créé:** migrate.js (script de migration)
✅ **Refactorisé:** server.js (requêtes PostgreSQL)

---

## 🔧 ÉTAPES DE DÉPLOIEMENT

### **Étape 1: Sur Vercel Dashboard**

1. **Va à:** https://vercel.com/dashboard
2. **Sélectionne:** Projet `tru-backend-five`
3. **Va à:** Settings → Environment Variables
4. **Ajoute une nouvelle variable:**
   - **Nom:** `POSTGRES_PRISMA_URL`
   - **Valeur:** Obtiens cette URL depuis Vercel Postgres
     
   > Si tu n'as pas encore Vercel Postgres:
   > 1. Va à Storage → Create Database → Postgres
   > 2. Nomme-la: `tru-db`
   > 3. Vercel génère automatiquement la connexion string
   > 4. Copie-la dans `POSTGRES_PRISMA_URL`

5. **Ajoute aussi:**
   - **Nom:** `POSTGRES_URL_NON_POOLING`
   - **Valeur:** Même URL que POSTGRES_PRISMA_URL

6. **Clique:** Deploy (auto-redéploiement)

### **Étape 2: Tester l'API**

Après 2-3 minutes, tester:

```bash
# Backend health check
curl https://tru-backend-five.vercel.app/api/test

# Doit retourner:
# {
#   "status": "OK",
#   "message": "Backend is responding correctly",
#   "database": "PostgreSQL"
# }
```

---

## 🔄 MIGRATION DES DONNÉES

### **Option A: Via Terminal (Recommandé)**

```bash
# 1. Cloner le repo localement
git clone https://github.com/efoka24-ops/tru-website.git
cd "site tru/backend"

# 2. Configurer la connexion PostgreSQL
# Ajoute dans .env.local:
POSTGRES_PRISMA_URL=postgresql://...  # (depuis Vercel)

# 3. Installer les dépendances
npm install

# 4. Lancer la migration
npm run migrate

# Résultat attendu:
# ✅ ✅ ✅ MIGRATION COMPLETED SUCCESSFULLY! ✅ ✅ ✅
# 🎉 All data has been migrated to PostgreSQL
```

### **Option B: Via SQL Console (Vercel)**

1. Va à: Vercel Dashboard → Storage → PostgreSQL → `tru-db`
2. Clique: "Query" ou "SQL Console"
3. Exécute les requêtes INSERT manuellement

---

## 📊 VÉRIFICATION DE LA MIGRATION

### **Vérifier que les données sont là:**

```sql
-- Dans Vercel SQL Console

-- Compter les équipes
SELECT COUNT(*) as team_count FROM team;

-- Compter les témoignages
SELECT COUNT(*) as testimonials_count FROM testimonials;

-- Compter les actualités
SELECT COUNT(*) as news_count FROM news;

-- Voir tous les membres
SELECT id, name, title, email FROM team;
```

---

## ✅ CHECKLIST POST-MIGRATION

- [ ] Vercel Postgres créé et connecté
- [ ] `POSTGRES_PRISMA_URL` ajouté à Vercel
- [ ] Backend redéployé avec PostgreSQL
- [ ] API test retourne `"database": "PostgreSQL"`
- [ ] Données migrées depuis data.json
- [ ] Frontend peut récupérer les données
- [ ] Backoffice peut créer/modifier/supprimer
- [ ] Suppressions sont persistantes
- [ ] Images base64 fonctionnent

---

## 🐛 TROUBLESHOOTING

### **Erreur: "Cannot find module '@vercel/postgres'"**
```bash
npm install @vercel/postgres
```

### **Erreur: "POSTGRES_PRISMA_URL is not set"**
- Vérifie que la variable d'env est bien définie sur Vercel
- Redéploie après l'avoir ajoutée

### **Données vides après migration**
```bash
# Relancer la migration
npm run migrate
```

### **Les suppressions ne persistent pas**
- ✅ Maintenant résolues avec PostgreSQL!
- Avant: data.json était réinitialisé
- Après: PostgreSQL persiste les changements

---

## 🎯 AVANTAGES DE POSTGRESQL

| Feature | data.json | PostgreSQL |
|---------|-----------|-----------|
| **Persistance** | ❌ Réinitialise | ✅ Persistant |
| **Suppressions** | ❌ Perdues | ✅ Persistantes |
| **Performances** | ⚠️ Lent | ✅ Rapide |
| **Concurrence** | ❌ Non | ✅ Transactions |
| **Scalabilité** | ❌ Limitée | ✅ Excellente |
| **Coût** | ✅ Gratuit | ✅ Gratuit (1GB) |
| **Sauvegarde** | ⚠️ Manual | ✅ Automatique |

---

## 📝 NOTES TECHNIQUES

- **Tables créées automatiquement** au démarrage (migration.js crée les tables si elles n'existent pas)
- **Timestamps** pour audit trail (created_at, updated_at)
- **Images** stockées en base64 data URLs (même approche qu'avant)
- **Arrays** supportés via JSON dans PostgreSQL (specialties, certifications, etc)
- **NULL safety** dans tous les champs optionnels

---

## 🔐 SÉCURITÉ

- Variables d'env protégées sur Vercel
- Pas de credentials en dur dans le code
- Vercel Postgres avec SSL par défaut
- Isolement des données par instance

---

## 📞 SUPPORT

Si tu as des problèmes:
1. Vérifies les logs Vercel (Dashboard → Deployments → Logs)
2. Teste l'API avec curl/Postman
3. Vérifies la connexion PostgreSQL en SQL Console

---

**Migration réussie! 🎉 Ton système fonctionne maintenant avec PostgreSQL persistant!**
