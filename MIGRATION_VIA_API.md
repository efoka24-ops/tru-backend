# 🚀 Migration via API Endpoint

Puisque la migration locale ne fonctionne pas (firewall), on utilise un endpoint API sur le backend.

## Comment ça fonctionne:

1. **Backend Render** a accès à PostgreSQL ✅
2. **Backend Render** lit `data.json` (fichier local)
3. **Backend Render** insère les données dans PostgreSQL
4. **Vous** appelez l'endpoint via l'API

## Étapes:

### 1️⃣ Tester l'endpoint (via curl)

```bash
# Récupérez un token admin valide d'abord
# Puis lancez:

curl -X POST https://tru-backend-o1zc.onrender.com/api/admin/migrate-data \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### 2️⃣ Via le backoffice (plus facile)

Créez un bouton dans le backoffice:

**Endpoint**: `POST /api/admin/migrate-data`
**Headers**: 
```
Authorization: Bearer [token]
Content-Type: application/json
```

**Réponse attendue**:
```json
{
  "status": "SUCCESS",
  "message": "Migration completed successfully!",
  "imported": {
    "team": 5,
    "testimonials": 4,
    "services": 5,
    "contacts": 3,
    "news": 1,
    "jobs": 0
  },
  "timestamp": "2026-01-10T15:30:45.123Z"
}
```

## Alternative: Script simple

Créez `test-migration.js`:

```javascript
import axios from 'axios';

const adminToken = 'YOUR_TOKEN_HERE'; // Get from login

axios.post('https://tru-backend-o1zc.onrender.com/api/admin/migrate-data', {}, {
  headers: {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  }
}).then(res => {
  console.log('✅ Migration successful:', res.data);
}).catch(err => {
  console.error('❌ Migration failed:', err.response?.data || err.message);
});
```

Puis lancez: `node test-migration.js`

---

**Status**: Prêt à migrer via API endpoint! 🎯
