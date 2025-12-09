# Système de Contact - Documentation Complète

## Vue d'ensemble

Le système de contact TRU GROUP permet aux visiteurs d'envoyer des messages via un formulaire, et à l'administrateur de les gérer et de répondre par email ou SMS depuis le backoffice.

## Architecture

```
┌─────────────────────┐
│   Visiteur (Site)   │
│   Contact.jsx       │
└──────────┬──────────┘
           │ POST /api/contacts
           ▼
┌─────────────────────┐
│   Backend Server    │
│   server.js         │
│   (Port 5000)       │
└──────────┬──────────┘
           │ Sauvegarde en data.json
           │ Notification au backoffice
           ▼
┌─────────────────────┐
│   Backoffice Admin  │
│ ContactsPage.jsx    │
│   (Port 3001)       │
└──────────┬──────────┘
           │ POST /api/contacts/reply
           ▼
┌─────────────────────┐
│  Email (Nodemailer) │
│  SMS (Twilio - futur)│
└─────────────────────┘
```

## Flux Complet

### 1. Visiteur Envoie un Message

**Frontend (Contact.jsx)**
```javascript
// Formulaire avec champs:
- Nom complet *
- Email *
- Téléphone
- Sujet * (dropdown)
- Message *

// POST http://localhost:5000/api/contacts
{
  "fullName": "Jean Dupont",
  "email": "jean@example.com",
  "phone": "+237 6XX XX XX XX",
  "subject": "Demande de devis",
  "message": "Je voudrais un devis pour..."
}
```

**Backend Response:**
```json
{
  "id": 1,
  "fullName": "Jean Dupont",
  "email": "jean@example.com",
  "phone": "+237 6XX XX XX XX",
  "subject": "Demande de devis",
  "message": "Je voudrais un devis pour...",
  "status": "pending",
  "createdAt": "2025-12-09T10:30:00Z"
}
```

### 2. Admin Voit le Message dans Backoffice

**ContactsPage.jsx (Backoffice)**
- Liste des contacts avec filtres (En attente, Répondus, Fermés)
- Bouton "Voir + Répondre"
- Affiche les détails du message
- Propose 2 options: Email ou SMS

### 3. Admin Répond

**Modal de réponse:**
```javascript
{
  "contactId": 1,
  "method": "email", // ou "sms"
  "message": "Merci de votre intérêt. Nous vous préparerons un devis dans 2 jours..."
}
```

**Backend:**
- Sauvegarde la réponse
- Change le statut à "replied"
- Envoie par email (Nodemailer) ou SMS (Twilio)

## Routes API

### Contacts

```
GET  /api/contacts         - Récupère tous les contacts
POST /api/contacts         - Crée un nouveau contact
PUT  /api/contacts/:id     - Modifie un contact
DELETE /api/contacts/:id   - Supprime un contact
POST /api/contacts/reply   - Envoie une réponse
```

### Détails des Routes

#### 1. POST /api/contacts (Créer un contact)

**Request:**
```json
{
  "fullName": "string *",
  "email": "string *",
  "phone": "string",
  "subject": "string *",
  "message": "string *"
}
```

**Response:**
```json
{
  "id": 1,
  "fullName": "...",
  "email": "...",
  "phone": "...",
  "subject": "...",
  "message": "...",
  "status": "pending",
  "createdAt": "2025-12-09T..."
}
```

#### 2. POST /api/contacts/reply (Répondre)

**Request:**
```json
{
  "contactId": 1,
  "method": "email",
  "message": "Votre réponse..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email envoyé à jean@example.com",
  "method": "email"
}
```

## Statuts des Contacts

| Statut | Signification | Color |
|--------|---------------|-------|
| pending | En attente de réponse | 🟡 Jaune |
| replied | Réponse envoyée | 🟢 Vert |
| closed | Fermé/Archivé | ⚫ Gris |

## Configuration Email (Nodemailer)

### Avec Gmail:

1. Créer un compte Google Apps:
   - Aller sur: https://myaccount.google.com/apppasswords
   - Générer un mot de passe d'application

2. Configurer .env:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=votre_email@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_app
EMAIL_FROM_NAME=TRU GROUP
```

### Exemple de code (à venir):
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const mailOptions = {
  from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
  to: contact.email,
  subject: `Réponse à votre demande: ${contact.subject}`,
  html: `
    <h2>Bonjour ${contact.fullName},</h2>
    <p>${replyMessage}</p>
    <br>
    <p>Cordialement,<br>L'équipe TRU GROUP</p>
  `
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Erreur email:', error);
  } else {
    console.log('Email envoyé:', info.response);
  }
});
```

## Configuration SMS (Twilio - À faire)

### Installation:
```bash
npm install twilio
```

### Configuration .env:
```env
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Exemple de code (à venir):
```javascript
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

client.messages.create({
  body: replyMessage,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: contact.phone
}).then(message => console.log('SMS envoyé:', message.sid));
```

## Sujets Disponibles

1. Demande de consultation
2. Demande de devis
3. Partenariat
4. Support technique
5. Autre

## Data Schema (data.json)

```json
{
  "contacts": [
    {
      "id": 1,
      "fullName": "Jean Dupont",
      "email": "jean@example.com",
      "phone": "+237 6XX XX XX XX",
      "subject": "Demande de devis",
      "message": "Je voudrais un devis pour...",
      "status": "pending",
      "createdAt": "2025-12-09T10:30:00Z",
      "replyDate": null,
      "replyMethod": null,
      "replyMessage": null
    }
  ]
}
```

## Fonctionnalités Actuelles ✅

- ✅ Formulaire de contact frontend
- ✅ Affichage des contacts en backoffice
- ✅ Filtrage par statut
- ✅ Modal de visualisation et réponse
- ✅ Choix email/SMS
- ✅ Sauvegarde des réponses
- ✅ Logging des actions

## Fonctionnalités À Faire 🔄

- 🔄 Intégration Nodemailer pour les vrais emails
- 🔄 Intégration Twilio pour les vrais SMS
- 🔄 Notification par webhook au frontend
- 🔄 Template d'emails HTML
- 🔄 Historique des conversations
- 🔄 Export des contacts en CSV

## Tester le Système

### 1. Remplir le formulaire Contact (Frontend)
```
Nom: Jean Dupont
Email: jean@gmail.com
Téléphone: +237 6 XX XX XX XX
Sujet: Demande de devis
Message: Je voudrais un devis pour...
```

### 2. Vérifier en Backoffice
- Aller à http://localhost:3001
- Cliquer sur "Gestion des Contacts"
- Voir le message dans la liste (Statut: En attente)

### 3. Répondre au Message
- Cliquer "Voir + Répondre"
- Choisir "Email" ou "SMS"
- Écrire la réponse
- Cliquer "Envoyer"

### 4. Vérifier la Sauvegarde
- Vérifier dans data.json que:
  - replyDate est rempli
  - replyMethod = "email" ou "sms"
  - replyMessage contient la réponse
  - status = "replied"

## FAQ

**Q: Quand on envoie un email, qui le reçoit?**
A: Actuellement, c'est simplement loggé. Après intégration Nodemailer, ce sera envoyé au contact.email.

**Q: Comment activer les vrais emails?**
A: Configurer .env avec les identifiants Gmail, puis décommenter le code Nodemailer dans la route /api/contacts/reply.

**Q: Les messages sont-ils persistent?**
A: Oui, ils sont sauvegardés en data.json et persisteront même après redémarrage du serveur.

**Q: Peut-on supprimer des contacts?**
A: Oui, via le bouton Trash dans la backoffice. Mais attention, c'est permanent.
