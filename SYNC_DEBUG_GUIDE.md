# 🔍 Guide de Débogage - Synchronisation

## Problème Identifié ✅

**Cause Root**: Les données du frontoffice et du backend utilisaient **des IDs différents** :

- **Frontend** : IDs 1-5 (données locales dans `src/data/content.js`)
- **Backend** : IDs 2+ (données dans `backend/data.json`)

Par exemple:
- Frontend: `Aissatou Diallo` avec ID=2
- Backend: `Halimatou Sadia Ahmadou` avec ID=2 (DIFFÉRENT!)

## Solutions Implémentées ✅

### 1. ✅ Smart Matching (Par nom + email)
La synchronisation cherche maintenant à matcher les éléments de 3 façons:
1. **Par ID** (si les IDs correspondent)
2. **Par nom + email** (match parfait)
3. **Par nom seul** (fallback)

```javascript
// Dans syncService.js - findMatch()
findMatch(frontendItem, backendData) {
  // Chercher par ID d'abord
  let match = backendData.find(b => b.id === frontendItem.id);
  if (match) return match;

  // Chercher par nom et email 
  match = backendData.find(b => 
    b.name?.toLowerCase() === frontendItem.name?.toLowerCase() &&
    b.email === frontendItem.email
  );
  if (match) return match;

  // Chercher par nom seul
  match = backendData.find(b =>
    b.name?.toLowerCase() === frontendItem.name?.toLowerCase()
  );
  return match;
}
```

### 2. ✅ Correction de l'API
Changé de `base44` (API locale inexistante) à `teamAPI` (backend réel):

```javascript
// AVANT (❌ base44 → localhost:5000)
const { data: frontendTeam = [] } = useQuery({
  queryFn: async () => {
    const data = await base44.entities.TeamMember.list('display_order');
    return data || [];
  }
});

// APRÈS (✅ teamAPI → backend réel)
const { data: frontendTeam = [] } = useQuery({
  queryFn: async () => {
    const response = await teamAPI.getAll();
    return response.data || [];
  }
});
```

### 3. ✅ Gestion des IDs Correcte
Utilise l'ID du backend pour les updates:

```javascript
// Si MISMATCH → update avec ID backend
return await this.syncToBackend({
  ...difference.frontendData,
  id: difference.id  // ID du backend
});

// Si MISSING_IN_BACKEND → create avec ID frontend
return await this.createInBackend({
  ...difference.frontendData,
  id: difference.id  // ID du frontend
});
```

## Tests à Effectuer ✅

### Test 1: Vérifier la Détection
```
1. Ouvrir: https://tru-website.vercel.app/admin/sync
2. Cliquer: "Analyser"
3. Vérifier: La page détecte les différences
4. Regarder Console (F12): Les logs montrent les données
```

**Attendu dans Console:**
```
🔍 Fetching frontend team data...
✅ Frontend team loaded: [...]
Fetching backend team from: https://tru-backend-o1zc.onrender.com/api/team
Backend team data received: [...]
Differences found: [...]
Report generated: {...}
```

### Test 2: Exemple Concret - "Halimatou Sadia Ahmadou"
```
Backend:
- ID: 2
- Name: "Halimatou Sadia Ahmadou"
- Email: "bob@sitetru.com"

Frontend:
- ID: 2 (MAIS un nom DIFFÉRENT!)
- Name: "Aissatou Diallo"
- Email: "aissatou@trugroup.cm" (DIFFÉRENT!)

Résultat:
✅ Ne matchera PAS par ID (noms différents)
✅ Detectera comme MISMATCH ou items séparés
✅ Affichera: Halimatou existe en backend, pas en frontend
```

### Test 3: Auto-Résoudre
```
1. Cliquer: "Auto-résoudre"
2. Vérifier: Les résolutions sont suggérées correctement:
   - ⬆️ MISSING_IN_BACKEND → CREATE_IN_BACKEND
   - ⬇️ MISSING_IN_FRONTEND → ignorer
   - ⚠️ MISMATCH → USE_BACKEND
3. Cliquer: "Synchroniser"
4. Voir: Les résultats de la synchronisation
```

### Test 4: Synchronisation Manuelle
```
1. Analyser
2. Pour chaque différence, choisir manuellement:
   - "USE_FRONTEND" → envoyer données frontend au backend
   - "USE_BACKEND" → garder données backend
   - "CREATE_IN_BACKEND" → créer dans backend
3. Cliquer: "Synchroniser"
4. Vérifier: Succès/Erreurs dans les résultats
```

## Logs à Vérifier 🔍

### Console du Navigateur (F12)
```javascript
// Frontend team load
🔍 Fetching frontend team data...
✅ Frontend team loaded: Array(5) [
  { id: 1, name: 'Emmanuel Foka Ziegoube', ... },
  { id: 2, name: 'Aissatou Diallo', ... },
  ...
]

// Backend team load
Fetching backend team from: https://tru-backend-o1zc.onrender.com/api/team
Backend team data received: Array(3) [
  { id: 2, name: 'Halimatou Sadia Ahmadou', ... },
  { id: 3, name: 'Hervé Tatinou', ... },
  { id: 4, name: 'Emmanuel Foka', ... }
]

// Differences
Differences found: Array(8) [
  {
    type: 'MISSING_IN_BACKEND',
    id: 1,
    name: 'Emmanuel Foka Ziegoube',
    ...
  },
  {
    type: 'MISMATCH',
    id: 2,
    name: 'Aissatou Diallo vs Halimatou Sadia Ahmadou',
    ...
  },
  ...
]
```

### Page Journaux (Logs)
Allez sur https://tru-website.vercel.app/admin/logs pour voir:
- ✅ "Équipe backend récupérée (3 éléments)"
- ✅ "Début analyse synchronisation"
- ✅ "Analyse synchronisation complète"
- ✅ "Synchronisation batch complète"

## Dépannage 🛠️

### Symptôme: "Aucune différence détectée"
```
Causes possibles:
1. Les données ne chargent pas
   → Vérifier Console pour les erreurs
   → Vérifier que l'API est accessible

2. Smart matching fonctionne TROP bien
   → Les items sont considérés comme identiques
   → Vérifier les différences de champs
```

### Symptôme: "Erreur lors de la synchronisation"
```
Causes possibles:
1. Image trop volumineuse
   → Message: "Image trop volumineuse (XXXkB, max 5120kB)"
   → Solution: Compresser l'image avant sync

2. ID déjà existant
   → Message: "ID 2 déjà existant"
   → Solution: Utiliser un ID nouveau

3. Réseau / Backend down
   → Message: "Failed to fetch" ou timeout
   → Solution: Vérifier que le backend tourne sur Render
```

### Symptôme: "Frontend team loaded: Array(0)"
```
Causes:
1. API introuvable (locale au lieu de backend)
   → Fix: Changé de base44 à teamAPI ✅

2. Mauvaise variable d'environnement
   → Vérifier: VITE_BACKEND_URL

3. L'API retourne une erreur
   → Vérifier: Response headers et Status code
```

## Prochaines Étapes 🚀

### Court Terme
1. ✅ Tester la synchronisation en production
2. ✅ Vérifier les messages de succès/erreur
3. ✅ Vérifier que les données se synchronisent

### Moyen Terme
1. Unifier les données (synchroniser les IDs)
2. Créer une migration des données frontend → backend
3. Supprimer les données locales du frontend

### Long Terme
1. Frontend = miroir du backend (pas de données locales)
2. Tous les chemins passent par l'API
3. Cache côté client pour les perfs

## Contacts & Support 📞

**Issues lors de la synchronisation?**
1. Ouvrir F12 → Console
2. Copier les logs d'erreur
3. Vérifier le status du backend sur Render
4. Vérifier `/api/health` du backend
5. Relancer une synchronisation avec "Analyser"

---

**Version**: 2.0 (avec Smart Matching)
**Dernier Update**: 2025-01-16
**Status**: ✅ Ready for Testing
