# 🔴 FIX: Données disparaissent après 16 minutes sur Render

## Problème Identifié

Les données créées dans le backoffice s'affichaient correctement au frontend, mais après ~5 minutes (sauvegarde périodique Git), elles disparaissaient et étaient remplacées par les données par défaut de `data.example.json`.

### Causes Racines

1. **Volume persistant non configuré** 
   - `DATA_DIR` n'était pas défini dans les variables d'environnement Render
   - `data.json` était créé dans `/app` (système de fichiers volatile) au lieu de `/opt/render/project/src/backend` (volume persistant)
   - À chaque redémarrage ou sauvegarde, le système rechargeait `data.example.json`

2. **Chemin Git incorrect**
   - Le service de sauvegarde utilisait `backend/data.json` au lieu de `data.json`
   - Erreur Git: "backend/backend/: No such file or directory"
   - Les commits ne réussissaient jamais (données jamais sauvegardées sur GitHub)

3. **Téléchargement GitHub échoue**
   - L'endpoint `https://raw.githubusercontent.com/efoka24-ops/tru-website/main/backend/data.json` retournait 404
   - Fallback automatique vers `data.example.json` à chaque démarrage

## Solutions Appliquées

### 1. Corriger `backend/services/gitAutoBackupService.js`

✅ Ajouté la configuration `DATA_DIR`:
```javascript
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..');
```

✅ Changé `backend/data.json` → `data.json`:
```javascript
const DATA_FILE = 'data.json'; // était: 'backend/data.json'
```

✅ Modifié `execGit()` pour utiliser le bon répertoire:
```javascript
const fullCommand = `cd "${DATA_DIR}" && git ${command}`;
```

✅ Corrigé toutes les commandes git:
- `git status --porcelain data.json` (était: `backend/data.json`)
- `git add data.json` (était: `backend/data.json`)

### 2. Configurer `DATA_DIR` sur Render

✅ Modifié `package.json` script start:
```json
"start": "cd backend && npm install && DATA_DIR=/opt/render/project/src/backend node server.js"
```

Cela garantit que:
- Les données sont écrites dans `/opt/render/project/src/backend/data.json` (volume persistant)
- Les commits Git ciblent le bon fichier
- Les données subsistent entre les redémarrages

### 3. Créé `.env.render` pour documentation:
```bash
DATA_DIR=/opt/render/project/src/backend
```

## Comment Tester

1. **Créer une équipe dans le backoffice**
2. **Vérifier l'affichage au frontend** ✅
3. **Attendre 5 minutes** (sauvegarde périodique)
4. **Vérifier que les données PERSISTENT** ✅ (avant, elles disparaissaient)
5. **Redémarrer le serveur** → Les données doivent rester ✅

## Flux Correct Maintenant

```
Backoffice (POST /api/team)
    ↓
Backend: writeDataAndBackup()
    ↓
Fichier local: /opt/render/project/src/backend/data.json (volume persistant)
    ↓
GitHub backup (auto chaque 5 min): git add/commit/push
    ↓
Frontend: fetch /api/team → affiche les données
```

## Variables d'Environnement Render

Assurez-vous que Render a:
```bash
DATA_DIR=/opt/render/project/src/backend
GITHUB_TOKEN=<votre_token>
```

## Note sur la Persistance

Le volume persistant Render `/opt/render/project/src/backend` survit aux redémarrages du service.
Les données ne disparaîtront plus, sauf si:
- Le volume est supprimé manuellement
- Le service est redéployé sans préserver le volume
