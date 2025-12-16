# 🔄 Système de Synchronisation Intelligent

## Vue d'ensemble

Le système de synchronisation détecte et résout automatiquement les incohérences entre le frontoffice (frontend) et le backend. Cela garantit que toutes les données de l'équipe sont parfaitement cohérentes entre les deux systèmes.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              ADMIN: Synchronisation View                │
│  ┌──────────────────────────────────────────────────┐   │
│  │  1. Bouton "Analyser"                            │   │
│  │  2. Affiche les différences avec résolutions     │   │
│  │  3. Boutons "Auto-résoudre" & "Synchroniser"    │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         ↓↑
                 SyncService.js
    ┌──────────────────────────────────┬────────────────┐
    ↓                                  ↓                ↓
Comparaison                     Résolution          Rapport
compareData()              applyResolution()   generateReport()
findDifferences()          syncBatch()      suggestAutoResolution()
```

## Services

### SyncService (`backoffice/src/services/syncService.js`)

Classe principale pour la synchronisation des données.

#### Méthodes principales

##### `compareData(frontendData, backendData)`
Compare les données du frontoffice avec le backend et détecte les différences.

**Paramètres:**
- `frontendData`: Array - Données du frontoffice
- `backendData`: Array - Données du backend

**Retour:** Array de différences
```javascript
[{
  type: 'MISSING_IN_BACKEND' | 'MISSING_IN_FRONTEND' | 'MISMATCH',
  id: String,
  name: String,
  frontendData: Object,
  backendData: Object,
  differences: Array, // Seulement pour MISMATCH
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
}]
```

**Types de différences:**
- `MISSING_IN_BACKEND`: Élément existe en frontoffice mais pas en backend
- `MISSING_IN_FRONTEND`: Élément existe en backend mais pas en frontoffice
- `MISMATCH`: Élément existe des deux côtés mais avec des données différentes

**Exemple:**
```javascript
const frontendTeam = [...];  // Données du frontoffice
const backendTeam = await syncService.fetchBackendTeam();
const differences = syncService.compareData(frontendTeam, backendTeam);

console.log(differences);
// [
//   {
//     type: 'MISSING_IN_BACKEND',
//     id: '123',
//     name: 'John Doe',
//     frontendData: {...},
//     backendData: null,
//     severity: 'HIGH'
//   },
//   ...
// ]
```

---

##### `fetchBackendTeam()`
Récupère les données de l'équipe depuis le backend.

**Retour:** Promise<Array> - Données de l'équipe

**Exemple:**
```javascript
const backendTeam = await syncService.fetchBackendTeam();
```

---

##### `generateReport(differences)`
Crée un rapport structuré des différences détectées.

**Paramètres:**
- `differences`: Array - Résultat de compareData()

**Retour:** Object
```javascript
{
  totalDifferences: Number,
  byType: {
    MISSING_IN_BACKEND: Number,
    MISSING_IN_FRONTEND: Number,
    MISMATCH: Number
  },
  bySeverity: {
    HIGH: Number,
    MEDIUM: Number,
    LOW: Number
  },
  differences: Array
}
```

---

##### `suggestAutoResolution(difference)`
Suggère intelligemment une résolution pour une différence.

**Paramètres:**
- `difference`: Object - Une différence du rapport

**Retour:** String - 'USE_FRONTEND' | 'USE_BACKEND' | 'CREATE_IN_BACKEND' | 'DELETE_IN_FRONTEND'

**Logique:**
- `MISSING_IN_BACKEND`: Suggère 'CREATE_IN_BACKEND' (ajouter au backend)
- `MISSING_IN_FRONTEND`: Suggère 'USE_BACKEND' (garder backend)
- `MISMATCH`: Suggère 'USE_FRONTEND' (utiliser version frontoffice)

**Exemple:**
```javascript
const difference = differences[0];
const suggestion = syncService.suggestAutoResolution(difference);
console.log(suggestion); // 'CREATE_IN_BACKEND'
```

---

##### `applyResolution(difference, resolution)`
Applique une résolution à une différence unique.

**Paramètres:**
- `difference`: Object - Une différence du rapport
- `resolution`: String - 'USE_FRONTEND' | 'USE_BACKEND' | 'CREATE_IN_BACKEND' | 'DELETE_IN_FRONTEND'

**Retour:** Promise<Object>
```javascript
{
  success: Boolean,
  name: String,
  message: String,
  action: String
}
```

**Actions par résolution:**
- `USE_FRONTEND`: Envoie les données frontoffice au backend (PUT `/api/team/:id`)
- `USE_BACKEND`: Aucune action (backend reste source de vérité)
- `CREATE_IN_BACKEND`: Crée l'élément au backend (POST `/api/team`)
- `DELETE_IN_FRONTEND`: Marque pour suppression (pas d'action automatique)

**Exemple:**
```javascript
const result = await syncService.applyResolution(difference, 'USE_FRONTEND');
console.log(result);
// { success: true, name: 'John Doe', message: 'Synchronisé', action: 'UPDATE' }
```

---

##### `syncBatch(resolutions)`
Applique plusieurs résolutions en une seule opération.

**Paramètres:**
- `resolutions`: Array de {difference, resolution}

**Retour:** Promise<Object>
```javascript
{
  success: Boolean,
  message: String,
  results: Array<{name, success, message}>,
  duration: String
}
```

**Comportement:**
- Délai de 300ms entre chaque synchronisation (évite les surcharges)
- Continue même en cas d'erreur sur un élément
- Retourne un résumé complet des opérations

**Exemple:**
```javascript
const resolutions = [
  { difference: diff1, resolution: 'USE_FRONTEND' },
  { difference: diff2, resolution: 'CREATE_IN_BACKEND' }
];

const result = await syncService.syncBatch(resolutions);
console.log(result);
// {
//   success: true,
//   message: '2 éléments synchronisés',
//   results: [
//     { name: 'John', success: true, message: 'Synchronisé' },
//     { name: 'Jane', success: true, message: 'Créé' }
//   ],
//   duration: '1.2s'
// }
```

---

### Page UI (`backoffice/src/pages/SyncViewPage.jsx`)

Interface administrative pour gérer la synchronisation.

#### Fonctionnalités

1. **Analyse automatique**
   - Bouton "Analyser" pour détecter les différences
   - Affichage des statistiques (total, par type, par sévérité)

2. **Visualisation des différences**
   - Code couleur par type:
     - 🔵 Bleu (MISSING_IN_BACKEND) - À créer en backend
     - 🟣 Violet (MISSING_IN_FRONTEND) - À créer en frontoffice
     - 🟡 Jaune (MISMATCH) - Données conflictuelles

3. **Comparaison détaillée**
   - Vue côte à côte (Frontoffice vs Backend)
   - Expansion des détails pour chaque différence
   - Affichage des champs différents avec valeurs

4. **Sélection de résolutions**
   - Boutons radio pour choisir la résolution
   - Suggestions intelligentes affichées
   - Descriptions claires des actions

5. **Synchronisation**
   - Bouton "Auto-résoudre" pour appliquer les suggestions
   - Bouton "Synchroniser" pour exécuter les résolutions sélectionnées
   - Affichage du statut et des résultats

#### Props

Aucune prop - composant auto-suffisant.

#### State

```javascript
{
  report: Object | null,              // Rapport d'analyse
  selectedResolutions: Object,        // {key: resolution}
  isSyncing: Boolean,                 // Statut de synchronisation
  syncResults: Object | null,         // Résultats de la dernière sync
  expandedDiff: String | null,        // ID de la différence expansée
  autoResolve: Boolean,               // Flag pour auto-résolution
  isLoading: Boolean                  // Chargement en cours
}
```

#### Flux d'utilisation

1. **Chargement initial**
   - Page charge automatiquement l'analyse
   - Affiche les statistiques et les différences

2. **Sélection manuelle**
   - Cliquer sur une différence pour l'expanser
   - Choisir la résolution souhaitée via radio buttons
   - Répéter pour chaque différence

3. **Auto-résolution**
   - Cliquer "Auto-résoudre"
   - Le système suggère les résolutions intelligentes
   - Cliquer "Synchroniser" pour appliquer

4. **Résultats**
   - Affichage du rapport de synchronisation
   - Réanalyse automatique après 1 seconde
   - Revalidation des différences restantes

## API Endpoints

### Backend Requirements

Le système de synchronisation nécessite les endpoints suivants:

#### `GET /api/team`
Récupère la liste complète de l'équipe.

**Retour:** Array<Object>
```javascript
[
  {
    id: String,
    name: String,
    role: String,
    photo: String,
    description: String,
    display_order: Number,
    created_at: String,
    updated_at: String
  }
]
```

#### `PUT /api/team/:id`
Met à jour un membre de l'équipe.

**Paramètres:**
- `id`: String - ID du membre
- Body: Object - Données à mettre à jour

**Retour:** Object - Membre mis à jour

#### `POST /api/team`
Crée un nouveau membre de l'équipe.

**Paramètres:**
- Body: Object - Données du nouveau membre

**Retour:** Object - Membre créé avec ID

## Configuration

### Variables d'environnement

```javascript
// Automatiquement utilisées par SyncService
VITE_BACKEND_URL = 'https://tru-backend-o1zc.onrender.com'
```

### Délais et Timeouts

- **Délai entre synchronisations batch**: 300ms (configurable)
- **Timeout API**: 30s (standard fetch)
- **Réanalyse post-sync**: 1000ms

## Logging et Debugging

Le système utilise le service `logger` pour tracer les opérations:

```javascript
logger.info('Début analyse synchronisation');
logger.success('Analyse synchronisation complète', {
  differences: report.totalDifferences,
  byType: report.byType
});
logger.error('Erreur analyse synchronisation', { error: errorMessage });
```

### Logs disponibles

- Analyse initiale et résultats
- Chaque opération de synchronisation
- Erreurs réseau et serveur
- Statut de chaque élément synchronisé

## Cas d'usage courants

### Cas 1: Récupérer les données backend oubliées en frontoffice

```javascript
// Détecté comme: MISSING_IN_FRONTEND
// Résolution: USE_BACKEND
// Résultat: Frontend récupère les données du backend
```

### Cas 2: Ajouter une nouvelle personne en frontoffice

```javascript
// Détecté comme: MISSING_IN_BACKEND
// Résolution: CREATE_IN_BACKEND
// Résultat: Nouvelle personne créée au backend
```

### Cas 3: Frontoffice a une version plus récente

```javascript
// Détecté comme: MISMATCH
// Résolution: USE_FRONTEND
// Résultat: Backend mis à jour avec les données frontoffice
```

### Cas 4: Backend a une version plus récente

```javascript
// Détecté comme: MISMATCH
// Résolution: USE_BACKEND
// Résultat: Aucune action, frontend rafraîchira au prochain chargement
```

## Performance

### Optimisations

1. **Batch processing**: Traite plusieurs éléments avec délais
2. **Lazy loading**: Ne charge que les données nécessaires
3. **Memoization**: Réutilise les comparaisons d'objets
4. **Incremental sync**: Sync uniquement ce qui a changé

### Limitations

- Max 100 membres recommandés par opération batch
- Délai minimum 30s pour de grandes équipes (>50 membres)
- Prévoir 2-3 secondes par 10 élément à synchroniser

## Troubleshooting

### "Analyse en cours" reste bloquée

**Cause:** Connexion au backend lente ou offline
**Solution:**
1. Vérifier la connexion Internet
2. Vérifier que le backend est en ligne
3. Rafraîchir la page et réessayer

### Résolutions ne s'appliquent pas

**Cause:** Erreur d'API ou données invalides
**Solution:**
1. Vérifier les logs (page Journaux)
2. Vérifier la structure des données
3. Contacter le support backend

### Données toujours différentes après sync

**Cause:** Race condition ou cache
**Solution:**
1. Attendre 5 secondes et réanalyser
2. Rafraîchir la page
3. Vider le cache du navigateur

## API Code Example

### Utilisation complète en React

```jsx
import { syncService } from '@/services/syncService';
import { useState, useEffect } from 'react';

function SyncManager() {
  const [report, setReport] = useState(null);
  const [resolutions, setResolutions] = useState({});

  const analyzeSync = async () => {
    const backend = await syncService.fetchBackendTeam();
    const frontend = [...]; // Récupérer données frontend
    const differences = syncService.compareData(frontend, backend);
    const report = syncService.generateReport(differences);
    setReport(report);
  };

  const handleSync = async () => {
    const syncResolutions = Object.entries(resolutions).map(
      ([key, resolution]) => ({
        difference: report.differences.find(d => `${d.type}-${d.id}` === key),
        resolution
      })
    );
    
    const result = await syncService.syncBatch(syncResolutions);
    console.log(result);
  };

  return (
    <div>
      <button onClick={analyzeSync}>Analyser</button>
      {report && <div>Différences: {report.totalDifferences}</div>}
      <button onClick={handleSync}>Synchroniser</button>
    </div>
  );
}
```

## Checklist de déploiement

- ✅ SyncService créé et testé
- ✅ SyncViewPage déployée
- ✅ Navigation ajoutée à AdminLayout
- ✅ Routes configurées dans App.jsx
- ✅ Backend endpoints disponibles
- ✅ Logging intégré
- ⏳ Tests en production avec vraies données
- ⏳ Documentation utilisateur complète
- ⏳ Monitoring des erreurs de sync

## Support et Maintenance

Pour toute question ou problème:
1. Consulter les logs en page "Journaux"
2. Vérifier la connectivité backend
3. Vérifier l'intégrité des données
4. Contacter le support technique

## Version

- **Version:** 1.0.0
- **Date:** 2024
- **Statut:** ✅ Production Ready
