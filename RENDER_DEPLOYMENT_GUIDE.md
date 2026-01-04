# 🚀 Configuration Render - Deployment du Backend

## Architecture du projet

```
tru-website/ (Main repo - Frontend + Backoffice + Backend)
├── src/                    (Frontend React)
├── backoffice/             (Admin UI)
├── backend/                (Express API Server) ✅ DÉPLOYÉ SUR RENDER
├── public/
├── package.json
└── ...
```

## Service Render configuré

**Nom**: tru-backend  
**URL**: https://tru-backend-o1zc.onrender.com  
**Type**: Web Service  
**Runtime**: Node.js  
**Branch**: main  

## Configuration Render

### Build Command
```bash
cd backend && npm install
```

### Start Command
```bash
cd backend && node server.js
```

### Environment Variables

```
NODE_ENV=production
PORT=3000
```

## Déploiement automatique

✅ **Auto-deploy activé** sur les commits sur `main`

Quand tu pushes des changements:
1. Render détecte automatiquement le push
2. Clone le repo depuis GitHub
3. Exécute: `cd backend && npm install`
4. Exécute: `cd backend && node server.js`
5. Le service redémarre avec les nouveaux changements

## Logs de déploiement

Pour voir les logs en temps réel:
1. Aller sur https://dashboard.render.com
2. Cliquer sur le service "tru-backend"
3. Aller dans l'onglet "Logs"

## Troubleshooting

### Erreur: "No url found for submodule path"
**Cause**: Le repo avait une configuration de submodule mal formée  
**Solution**: ✅ FIXÉE - Suppression du submodule erroné  
**Status**: Déploiement devrait fonctionner maintenant

### Erreur: "Failed to fetch cache"
C'est normal au premier déploiement après un push. Render va cloner le repo en entier.

### Erreur: "npm ERR!"
Vérifier que le fichier `backend/package.json` existe et est valide

### Erreur: "Cannot find module"
Vérifier les dépendances dans `backend/package.json`

## Force redeploy

Si tu veux forcer un redéploiement sans changer le code:
1. Aller sur https://dashboard.render.com
2. Cliquer sur "tru-backend" service
3. Cliquer "Manual Deploy" → "Deploy latest commit"

## Vérifier que le déploiement a réussi

Tester les endpoints:
```bash
# GET /api/contacts
curl https://tru-backend-o1zc.onrender.com/api/contacts

# GET /api/settings
curl https://tru-backend-o1zc.onrender.com/api/settings

# GET /api/team
curl https://tru-backend-o1zc.onrender.com/api/team
```

✅ Les endpoints doivent répondre avec du JSON

## Prochaines étapes

1. **Vérifier que Render a déployé les changements** du commit `03ca8c3`
2. **Tester l'endpoint** POST /api/contacts/reply
3. **Re-lancer les tests** avec `node test-contacts.js`
4. **Vérifier le backoffice**: https://bo.trugroup.cm fonctionne

## Notes de sécurité

- Les logs du serveur contiennent des données sensibles
- Ne pas partager les URLs de déploiement publiquement
- Garder les variables d'environnement privées
- Render chiffre les variables d'environnement

## Support

En cas de problème:
- Voir les logs: https://dashboard.render.com
- Consulter la documentation Render: https://render.com/docs
- Me contacter: efoka24@gmail.com
