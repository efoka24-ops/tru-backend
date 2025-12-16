# 📊 Système de Logging et Notifications

## Vue d'ensemble

Un système complet de logging et de notifications a été implémenté pour améliorer le suivi des opérations et le débogage des erreurs du backoffice TRU GROUP.

## 🎯 Fonctionnalités

### 1. **Service de Logging Centralisé** (`src/services/logger.js`)

Le service logger offre une interface simple pour enregistrer les événements :

```javascript
import { logger } from '@/services/logger';

// Enregistrer différents niveaux
logger.info('Opération lancée', { data: 'value' });
logger.success('Opération réussie', { duration: '150ms' });
logger.warn('Attention à ceci', { warning: 'data' });
logger.error('Une erreur est survenue', { error: error.message });
logger.debug('Information de débogage', { debug: 'data' });
```

#### Niveaux de Log

| Niveau | Emoji | Utilisation |
|--------|-------|-----------|
| **DEBUG** | 🔍 | Informations de débogage détaillées |
| **INFO** | ℹ️ | Informations générales sur les opérations |
| **WARN** | ⚠️ | Avertissements (fichier rejeté, taille limite, etc.) |
| **ERROR** | ❌ | Erreurs et exceptions |
| **SUCCESS** | ✅ | Opérations réussies |

#### API du Logger

```javascript
// Logging simple
logger.info(message, data)
logger.success(message, data)
logger.warn(message, data)
logger.error(message, data)
logger.debug(message, data)

// Logging d'API
logger.logApiCall(method, endpoint, status, duration, error)

// Logging CRUD
logger.logCrudOperation(operation, entity, id, success, message, error)

// Gestion locale
logger.getLocalLogs()        // Récupérer les logs locaux
logger.clearLocalLogs()      // Effacer les logs locaux
logger.exportLogs(filename)  // Exporter en JSON

// Gestion backend
logger.getBackendLogs({ level, limit, offset })  // Récupérer du backend
```

### 2. **Notifications Améliorées au Backoffice**

Les notifications auto-disparaissent et affichent des messages détaillés :

- **Succès** : Vert (#00cc00), 3000ms
- **Erreur** : Rouge (#cc0000), 5000ms
- **Info** : Bleu (#0066cc), 3000ms

**Exemples dans EquipePage.jsx :**

```javascript
// Succès avec nom du membre
showNotification(`✅ ${result.name} a été ajouté avec succès!`, 'success', 3000);

// Erreur avec détails
showNotification(`❌ Erreur lors de l'ajout du membre: ${errorMessage}`, 'error', 5000);

// Validation de photo
showNotification(`Photo trop volumineuse (331KB). Maximum: 250KB.`, 'error', 5000);
```

### 3. **Page de Visualisation des Logs** (`src/pages/LogsPage.jsx`)

Accédez à la page des logs via le menu "Journaux" du backoffice.

#### Fonctionnalités

- **Filtrage par niveau** : DEBUG, INFO, WARN, ERROR, SUCCESS, TOUS
- **Recherche** : Cherchez dans les messages et données
- **Détails complets** : Cliquez pour voir les données complètes de chaque log
- **Actions** :
  - 🔄 Actualiser : Recharger les logs du backend
  - ⬇️ Exporter : Télécharger en JSON pour l'analyse
  - 🗑️ Effacer : Supprimer tous les logs locaux
- **Pagination** : Affiche 50 logs par défaut
- **Statistiques** : Nombre total et filtré de logs

### 4. **Endpoints Backend des Logs**

#### POST `/api/logs` - Enregistrer un log
```bash
curl -X POST https://tru-backend-o1zc.onrender.com/api/logs \
  -H "Content-Type: application/json" \
  -d {
    "timestamp": "2025-12-16T10:30:00Z",
    "level": "SUCCESS",
    "message": "Opération réussie",
    "data": { "memberId": 5 }
  }
```

#### GET `/api/logs` - Récupérer les logs
```bash
# Tous les logs
curl https://tru-backend-o1zc.onrender.com/api/logs

# Filtrer par niveau et limiter
curl "https://tru-backend-o1zc.onrender.com/api/logs?level=ERROR&limit=10&offset=0"
```

**Réponse :**
```json
{
  "logs": [
    {
      "timestamp": "2025-12-16T10:30:00.123Z",
      "level": "ERROR",
      "message": "Impossible de créer le membre",
      "data": {
        "error": "Image trop volumineuse",
        "memberName": "John Doe"
      },
      "receivedAt": "2025-12-16T10:30:00.456Z"
    }
  ],
  "total": 42,
  "limit": 50,
  "offset": 0,
  "currentPage": 1
}
```

#### GET `/api/logs/stats` - Statistiques des logs
```bash
curl https://tru-backend-o1zc.onrender.com/api/logs/stats
```

**Réponse :**
```json
{
  "total": 127,
  "byLevel": {
    "DEBUG": 12,
    "INFO": 45,
    "WARN": 18,
    "ERROR": 32,
    "SUCCESS": 20
  },
  "oldestLog": "2025-12-16T08:00:00Z",
  "newestLog": "2025-12-16T14:30:00Z"
}
```

#### DELETE `/api/logs` - Effacer les logs
```bash
curl -X DELETE https://tru-backend-o1zc.onrender.com/api/logs
```

## 🔍 Exemples d'Utilisation

### Exemple 1 : Logging d'opération CRUD

**Dans EquipePage.jsx :**

```javascript
const createMutation = useMutation({
  mutationFn: async (data) => {
    // Log le début
    logger.info(`Création d'un nouveau membre: ${data.name}`, {
      memberName: data.name,
      action: 'CREATE'
    });
    
    try {
      const result = await base44.entities.TeamMember.create(data);
      
      // Log le succès
      logger.success(`Membre créé avec l'ID: ${result.id}`, {
        memberId: result.id,
        memberName: result.name
      });
      
      await syncTeamToFrontend('create', result);
      return result;
    } catch (error) {
      // Log l'erreur
      logger.error(`Impossible de créer le membre: ${data.name}`, {
        error: error.message,
        memberName: data.name
      });
      throw error;
    }
  },
  onSuccess: (result) => {
    // Notification utilisateur
    showNotification(`✅ ${result.name} a été ajouté avec succès!`, 'success');
  },
  onError: (error) => {
    // Notification d'erreur
    showNotification(`❌ Erreur: ${error.message}`, 'error', 5000);
    // Log automatiquement capturé en onError
  }
});
```

### Exemple 2 : Validation de photo avec logging

```javascript
const handlePhotoUpload = async (e) => {
  const file = e.target.files[0];
  const MAX_SIZE = 250 * 1024; // 250KB

  logger.info(`Chargement de photo`, {
    fileName: file.name,
    fileSize: `${(file.size / 1024).toFixed(2)}KB`
  });

  if (file.size > MAX_SIZE) {
    logger.warn(`Fichier image rejeté - trop volumineux`, {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)}KB`,
      maxSize: '250KB'
    });
    showNotification('Fichier trop volumineux', 'error', 5000);
    return;
  }

  // ... continuer le traitement
  logger.success(`Photo prête pour l'envoi`, { fileSize: `${(file.size / 1024).toFixed(2)}KB` });
};
```

### Exemple 3 : Logging d'opération backend

**Dans server.js :**

```javascript
// Les logs sont automatiquement enregistrés quand reçus du backoffice
// Et aussi loggés côté serveur
console.log(`${emoji[level]} [${level}] ${message}`, data);
```

## 📈 Architecture

```
┌─────────────────────────────────────────────────────┐
│              BACKOFFICE (React)                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  EquipePage.jsx      LogsPage.jsx                  │
│       │                   │                         │
│       └───────┬───────────┘                         │
│              │                                     │
│         logger.js (Service)                        │
│              │                                     │
│    • Enregistrement local                          │
│    • Envoi au backend                             │
│    • Export JSON                                   │
│              │                                     │
└──────────────┼──────────────────────────────────────┘
               │ POST /api/logs
               │ GET /api/logs
               │ GET /api/logs/stats
               │ DELETE /api/logs
               ↓
┌─────────────────────────────────────────────────────┐
│          BACKEND (Express.js - Render)              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  logsStore (Array - Max 1000 logs)                 │
│                                                     │
│  • POST /api/logs   - Enregistrer                  │
│  • GET /api/logs    - Récupérer filtré             │
│  • GET /api/logs/stats - Statistiques              │
│  • DELETE /api/logs - Effacer                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 💡 Bonnes Pratiques

### 1. Logging des Opérations Critiques

```javascript
// ✅ BON - Logging détaillé
logger.info(`Modification équipe #${id}`, { memberId: id, action: 'UPDATE' });

// ❌ MAUVAIS - Pas assez d'informations
console.log('Updating...');
```

### 2. Associer Logs et Notifications

```javascript
// ✅ BON - Log + notification pour chaque scénario
try {
  logger.info('Tentative de création...');
  const result = await create(data);
  logger.success('Créé!', { id: result.id });
  showNotification('✅ Créé avec succès!', 'success');
} catch (error) {
  logger.error('Erreur de création', { error: error.message });
  showNotification('❌ Erreur: ' + error.message, 'error');
}
```

### 3. Inclure des Données Utiles

```javascript
// ✅ BON
logger.logApiCall('PUT', '/api/team/5', 400, 234, { message: 'Image too large' });

// ❌ MAUVAIS
logger.error('API error');
```

### 4. Durée d'Exécution

```javascript
// ✅ BON - Mesurer les performances
const start = performance.now();
const result = await someOperation();
const duration = performance.now() - start;
logger.success('Opération complète', { duration: `${duration.toFixed(2)}ms` });
```

## 🔧 Configuration

### Stockage Backend

- **Type** : Array en mémoire (logsStore)
- **Limite** : 1000 logs maximum
- **Stockage** : Les logs sont perdus au redémarrage du serveur
  - *(Pour une persistance, ajouter une sauvegarde JSON périodique)*

### Stockage Local (Backoffice)

- **Limite** : 100 logs en mémoire
- **Persistance** : LocalStorage (pour un upgrade futur)

## 🚀 Prochaines Améliorations

1. **Persistance Backend** : Sauvegarder les logs en JSON avec rotation quotidienne
2. **Alertes** : Notifications en temps réel pour les erreurs critiques
3. **Recherche Avancée** : Filtres par date, utilisateur, etc.
4. **Export CSV** : Exporter les logs en CSV pour analyse Excel
5. **Webhooks** : Envoyer les erreurs à des services externes (Sentry, etc.)
6. **Audit Trail** : Enregistrer qui a modifié quoi et quand

## 📝 Checklist de Déploiement

- [x] Service logger implémenté
- [x] Notifications améliorées dans EquipePage
- [x] Page LogsPage créée
- [x] Endpoints backend implémentés
- [x] Navigation mise à jour
- [ ] Tester en production
- [ ] Monitorer les premiers logs
- [ ] Ajuster les filtres si nécessaire

---

**Dernière mise à jour** : 16 Décembre 2025
