# 📧 Guide Complet - Gestion des Contacts

## Vue d'ensemble
Le système de gestion des contacts permet au backoffice de recevoir, consulter et répondre aux messages envoyés via le formulaire de contact du site frontend, **sans quitter l'interface d'administration**.

## Fonctionnalités principales

### 1. **Réception automatique des messages**
- Tous les messages du formulaire de contact du frontend sont automatiquement enregistrés
- Stockés dans la base de données avec timestamp
- Accessible via `GET /api/contacts`

### 2. **Filtrage par statut**
L'interface propose 4 filtres:
- **📋 Tous**: Affiche tous les messages
- **⏳ En attente**: Messages non encore répondus
- **✅ Répondus**: Messages ayant reçu une réponse
- **🔒 Fermés**: Messages archivés

### 3. **Répondre par Email ou SMS**
Chaque contact peut recevoir une réponse via:

#### 📧 Email
- Envoyé via EmailJS (service_a59rkt1)
- Inclut la réponse du template personalizado
- Une copie est envoyée à l'admin (efoka24@gmail.com)
- Sauvegardé dans la base de données

#### 💬 SMS
- Statut enregistré dans la base de données
- Pour l'implémentation réelle, utiliser Twilio/Infobip
- Message enregistré pour trace

### 4. **Actions disponibles**

| Action | Description | Condition |
|--------|-------------|-----------|
| **Voir + Répondre** | Ouvre le modal de réponse | Tous les contacts |
| **✅ Répondu** | Marque comme répondu sans message | Seulement les contacts "En attente" |
| **Supprimer** | Supprime le contact de la liste | Tous les contacts |

## Architecture technique

### Backend (Express)

```javascript
// GET /api/contacts
// Récupère tous les contacts

// POST /api/contacts
// Crée un nouveau contact (appelé par le formulaire frontend)
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "subject": "string",
  "message": "string"
}

// PUT /api/contacts/:id
// Met à jour le statut d'un contact
{
  "status": "replied|closed"
}

// POST /api/contacts/reply
// Envoie une réponse et marque comme répondu
{
  "id": "number",
  "method": "email|sms",
  "message": "string"
}

// DELETE /api/contacts/:id
// Supprime un contact
```

### Frontend Backoffice

**Composant**: [backoffice/src/pages/ContactsPage.jsx](../backoffice/src/pages/ContactsPage.jsx)

**Features**:
- Interfacing avec backendClient pour les appels API
- React Query pour la gestion du cache
- EmailJS pour l'envoi d'emails
- Framer Motion pour les animations
- Lucide React pour les icones

**Hooks utilisés**:
- `useQuery` - Récupération des contacts
- `useMutation` - Mise à jour, réponse, suppression

### API Client

**Fichier**: [backoffice/src/api/backendClient.js](../backoffice/src/api/backendClient.js)

```javascript
backendClient.getContacts()           // GET /api/contacts
backendClient.updateContact(id, data) // PUT /api/contacts/:id
backendClient.replyToContact(id, data) // POST /api/contacts/reply
backendClient.deleteContact(id)       // DELETE /api/contacts/:id
```

## Structure des données

### Contact en base de données

```javascript
{
  "id": 2,
  "fullName": "Emmanuel Foka",
  "email": "emmanuel@trugroup.cm",
  "phone": "+237678758976",
  "subject": "Demande de consultation",
  "message": "test",
  "status": "replied",                    // pending | replied | closed
  "createdAt": "2025-12-09T16:51:57.411Z",
  "replyDate": "2025-12-09T16:57:07.359Z",
  "replyMethod": "sms",                   // email | sms
  "replyMessage": "bien recu"
}
```

## Flux de traitement d'un message

```
1. Client remplit le formulaire de contact sur le frontend
                    ↓
2. Message envoyé à POST /api/contacts
                    ↓
3. Sauvegardé en base (data.json)
                    ↓
4. Notification dans le backoffice (onglet "En attente")
                    ↓
5. Admin clique sur "Voir + Répondre"
                    ↓
6. Admin choisit Email ou SMS
                    ↓
7. Admin tape sa réponse
                    ↓
8. Admin clique "Envoyer"
                    ↓
9. Réponse envoyée (Email via EmailJS, SMS à enregistrer)
                    ↓
10. Status = "replied" en base
                    ↓
11. Message apparaît dans l'onglet "Répondus"
```

## Configuration nécessaire

### EmailJS Setup
- Service ID: `service_a59rkt1`
- Template ID: `template_contact_reply`
- Public Key: `qkNcx5-8mPFa4DtMh`

Vérifier que les templates sont configurés dans EmailJS pour:
1. Email client
2. Notification admin

### Environnement

**Frontend (.env.production)**:
```
VITE_API_URL=https://tru-backend-o1zc.onrender.com
VITE_BACKEND_URL=https://tru-backend-o1zc.onrender.com
```

## Améliorations futures

### 1. Intégration SMS réelle
Ajouter Twilio ou Infobip:
```javascript
// Dans backendClient.js
async replyToContact(id, data) {
  const contact = await fetch(`${BACKEND_URL}/api/contacts/${id}`);
  
  if (data.method === 'sms') {
    // Appeler Twilio API
    await twilio.messages.create({
      to: contact.phone,
      from: '+1234567890',
      body: data.message
    });
  }
}
```

### 2. Templates de réponses prédéfinies
Ajouter des templates pour répondre rapidement:
- "Merci pour votre message. Nous vous répondrons sous 24h."
- "Nous avons bien reçu votre demande de devis."
- etc.

### 3. Assignation des contacts
Permettre d'assigner un contact à une personne spécifique:
```javascript
{
  "assignedTo": "email@trugroup.cm",
  "priority": "high|normal|low"
}
```

### 4. Historique complet
Enregistrer toutes les interactions (messages, réponses, statuts) dans un historique

### 5. Notifications en temps réel
Utiliser WebSockets pour notifier l'admin d'un nouveau message

### 6. Export des contacts
Permettre d'exporter les contacts en CSV/PDF

## Troubleshooting

### Les contacts ne s'affichent pas
1. Vérifier que `GET /api/contacts` répond
2. Vérifier que data.json contient `"contacts": [...]`
3. Vérifier la console du backoffice pour les erreurs

### Les emails ne s'envoient pas
1. Vérifier la clé EmailJS
2. Vérifier les templates EmailJS
3. Voir la console pour les logs d'erreur

### Les changements ne sont pas sauvegardés
1. Vérifier les droits d'écriture sur data.json
2. Vérifier que le backend redémarre après les changements
3. Vérifier les logs du serveur Render

## Test manuel

1. **Depuis le frontend**:
   - Aller sur la page de contact
   - Remplir le formulaire
   - Cliquer "Envoyer"
   - Vérifier que le message apparaît dans le backoffice

2. **Depuis le backoffice**:
   - Aller dans "Gestion des Contacts"
   - Cliquer sur "Voir + Répondre"
   - Choisir Email ou SMS
   - Écrire une réponse
   - Cliquer "Envoyer"
   - Vérifier le statut passe à "✅ Répondu"
   - Vérifier l'email reçu par le client

## Liens utiles

- [Backend Server](https://tru-backend-o1zc.onrender.com)
- [Backoffice](https://bo.trugroup.cm)
- [Frontend](https://fo.trugroup.cm)
- EmailJS: https://www.emailjs.com
