/**
 * Middleware Backend pour Synchronisation en Temps Réel
 * À intégrer dans server.js ou express config
 * 
 * Cet exemple montre comment mettre à jour le backend
 * pour supporter la synchronisation intelligente
 */

// ============================================================
// INSTALLATION: Ajoutez ceci à votre server.js (Node.js/Express)
// ============================================================

/**
 * Middleware de fusion intelligente des données
 * Préserve les champs sensibles lors des mises à jour
 */
export const smartMergeMiddleware = (req, res, next) => {
  const originalBody = req.body;

  /**
   * Fusionner les données existantes avec les nouvelles
   * en préservant les champs spécifiés
   */
  req.smartMerge = async (existingData, updateData, preserveFields = []) => {
    if (Array.isArray(existingData) && Array.isArray(updateData)) {
      // Cas de tableau
      const merged = [...existingData];
      
      updateData.forEach(updateItem => {
        const existingIndex = merged.findIndex(item => 
          item.id === updateItem.id || 
          (item.email && updateItem.email && item.email === updateItem.email)
        );

        if (existingIndex !== -1) {
          // Fusionner en préservant les champs
          merged[existingIndex] = {
            ...merged[existingIndex],
            ...updateItem,
            ...preserveFields.reduce((acc, field) => {
              acc[field] = merged[existingIndex][field];
              return acc;
            }, {}),
            updatedAt: new Date().toISOString(),
          };
        } else {
          // Ajouter le nouvel élément
          merged.push({
            ...updateItem,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      });

      return merged;
    } else if (typeof existingData === 'object' && typeof updateData === 'object') {
      // Cas d'objet
      return {
        ...existingData,
        ...updateData,
        ...preserveFields.reduce((acc, field) => {
          acc[field] = existingData[field];
          return acc;
        }, {}),
        updatedAt: new Date().toISOString(),
      };
    }

    return updateData;
  };

  next();
};

/**
 * Middleware de notification du frontend
 * Envoie une notification lorsque les données changent
 */
export const notifyFrontendMiddleware = (req, res, next) => {
  const originalSend = res.send;

  res.notifyFrontend = async (endpoint, data) => {
    try {
      const webhookUrl = process.env.WEBHOOK_URL;
      
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'data-updated',
            endpoint: endpoint,
            data: data,
            timestamp: new Date().toISOString(),
            source: 'backoffice',
          }),
        }).catch(err => console.error('Webhook notification failed:', err));
      }
    } catch (error) {
      console.error('Error notifying frontend:', error);
    }
  };

  next();
};

/**
 * Middleware de validation des changements
 */
export const validateChangesMiddleware = (req, res, next) => {
  req.hasChanged = (existingData, newData) => {
    return JSON.stringify(existingData) !== JSON.stringify(newData);
  };

  next();
};

// ============================================================
// EXEMPLE D'INTÉGRATION DANS LE ENDPOINT /api/settings
// ============================================================

/**
 * Exemple: Route PUT pour les paramètres
 * app.put('/api/settings', async (req, res) => {
 * 
 *   try {
 *     // Récupérer les paramètres existants
 *     const existingSettings = await getSettings();
 * 
 *     // Fusionner intelligemment
 *     const mergedSettings = await req.smartMerge(
 *       existingSettings,
 *       req.body,
 *       ['createdAt', 'updatedBy'] // Champs à préserver
 *     );
 * 
 *     // Vérifier s'il y a vraiment des changements
 *     if (!req.hasChanged(existingSettings, mergedSettings)) {
 *       return res.json({
 *         status: 'no-changes',
 *         data: existingSettings
 *       });
 *     }
 * 
 *     // Sauvegarder les données fusionnées
 *     const saved = await saveSettings(mergedSettings);
 * 
 *     // Notifier le frontend
 *     await res.notifyFrontend('/api/settings', saved);
 * 
 *     res.json({
 *       status: 'success',
 *       data: saved
 *     });
 * 
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 */

// ============================================================
// EXEMPLE D'INTÉGRATION DANS LE ENDPOINT /api/team
// ============================================================

/**
 * Exemple: Route PUT pour l'équipe
 * app.put('/api/team', async (req, res) => {
 * 
 *   try {
 *     const existingTeam = await getTeamMembers();
 * 
 *     // Fusionner en préservant les dates d'embauche
 *     const mergedTeam = await req.smartMerge(
 *       existingTeam,
 *       req.body,
 *       ['createdAt', 'joinDate', 'employeeId']
 *     );
 * 
 *     if (!req.hasChanged(existingTeam, mergedTeam)) {
 *       return res.json({
 *         status: 'no-changes',
 *         data: existingTeam
 *       });
 *     }
 * 
 *     const saved = await saveTeamMembers(mergedTeam);
 *     await res.notifyFrontend('/api/team', saved);
 * 
 *     res.json({
 *       status: 'success',
 *       data: saved
 *     });
 * 
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 */

// ============================================================
// CONFIGURATION COMPLÈTE DU SERVER
// ============================================================

/**
 * Exemple complet d'intégration dans server.js:
 * 
 * import express from 'express';
 * import {
 *   smartMergeMiddleware,
 *   notifyFrontendMiddleware,
 *   validateChangesMiddleware
 * } from './middleware/realtimeSync.js';
 * 
 * const app = express();
 * 
 * // Appliquer les middlewares
 * app.use(express.json());
 * app.use(smartMergeMiddleware);
 * app.use(notifyFrontendMiddleware);
 * app.use(validateChangesMiddleware);
 * 
 * // Vos routes existantes...
 * app.put('/api/settings', settingsController.update);
 * app.put('/api/team', teamController.update);
 * // etc...
 */

// ============================================================
// ENVIRONNEMENT À CONFIGURER
// ============================================================

/**
 * Ajoutez à votre .env du backend:
 * 
 * # Synchronisation en temps réel
 * WEBHOOK_URL=https://votre-webhook-endpoint
 * ENABLE_REALTIME_SYNC=true
 * PRESERVE_FIELDS_SETTINGS=createdAt,updatedBy
 * PRESERVE_FIELDS_TEAM=createdAt,joinDate,employeeId
 */

export default {
  smartMergeMiddleware,
  notifyFrontendMiddleware,
  validateChangesMiddleware,
};
