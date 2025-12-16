# 🎯 Portail Membre Professionnel - Guide Complet

## 📋 Vue d'ensemble

Vous venez de créer un système complet de gestion des profils professionnels pour les membres de l'équipe TRU GROUP. Ce système permet:

✅ **Pour les Membres:**
- Se connecter avec un email professionnel
- Gérer leur profil personnel (photo, bio, compétences)
- Modifier leurs données (téléphone, LinkedIn, etc.)
- Ajouter des expertises et certifications

✅ **Pour les Administrateurs:**
- Créer des comptes pour les membres
- Générer des codes de connexion uniques
- Modifier les rôles et permissions
- Gérer les statuts des comptes (actif, en attente, inactif)

---

## 🚀 Démarrage Rapide

### 1. **Première Connexion - Comme Admin**

L'admin initial a déjà un compte:
- **Email:** `emmanuel@trugroup.cm`
- **Mot de passe:** À définir dans `backend/data.json`

Pour tester, update le hash du mot de passe dans `memberAccounts`:
```json
{
  "id": 4,
  "memberId": 4,
  "email": "emmanuel@trugroup.cm",
  "role": "admin",
  "passwordHash": "demo"
}
```

### 2. **Créer un Compte pour un Membre**

1. Allez sur `/admin` (Backoffice)
2. Cliquez sur l'onglet "Accès Membres"
3. Trouvez le membre dans la liste
4. Cliquez sur "Create"
5. Remplissez:
   - ✏️ Email: `bob@sitetru.com`
   - 🔐 Mot de passe initial (optionnel)
   - 👤 Rôle: `member` ou `admin`
6. Cliquez "Create Account"
7. ✅ Un **Code de Connexion** sera généré (ex: `ABC123DEF456`)

### 3. **Première Connexion - Comme Membre**

1. Allez sur `/member/login`
2. Sélectionnez l'onglet "Login Code"
3. Entrez:
   - Code: `ABC123DEF456`
   - Nouveau mot de passe: `MyPassword123`
   - Confirmez le mot de passe
4. Cliquez "Sign In"
5. ✅ Vous êtes connecté et redirigé vers `/member/dashboard`

### 4. **Gérer Son Profil - Comme Membre**

1. Cliquez sur "Edit"
2. Modifiez:
   - 📸 Photo de profil (cliquez sur la caméra)
   - 📝 Nom, Titre, Bio
   - 📞 Téléphone
   - 🔗 LinkedIn
   - 🎯 Expertises (ajouter avec Enter ou bouton +)
   - 🏆 Certifications & Awards
3. Cliquez "Save"
4. ✅ Les changements sont sauvegardés

---

## 🔐 Sécurité & Authentification

### JWT (JSON Web Token)
- Les tokens JWT expirent après **24 heures**
- Le token est stocké dans `localStorage` avec la clé `authToken`
- Le token contient: `memberId`, `email`, `role`

### Codes de Connexion
- Format: 12 caractères alphanumériques (ex: `ABC123DEF456`)
- Expiration: **24 heures** (configurable)
- Usage: **Une seule fois** (se transforme en mot de passe)
- Sécurité: Jamais stocké en clair

### Mots de Passe
- Hash: PBKDF2 avec 1000 itérations
- Jamais retournés par l'API
- Changement possible via `/api/auth/change-password`

---

## 🛣️ Endpoints API

### 🔑 Authentification

```bash
# Connexion avec email + mot de passe
POST /api/auth/login
Content-Type: application/json
{
  "email": "bob@sitetru.com",
  "password": "mypassword"
}

# Réponse
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "member": {...},
  "account": {...}
}
```

```bash
# Connexion avec code de connexion (première fois)
POST /api/auth/login-code
Content-Type: application/json
{
  "loginCode": "ABC123DEF456",
  "newPassword": "mypassword",
  "confirmPassword": "mypassword"
}
```

```bash
# Vérifier token valide
POST /api/auth/verify-token
Authorization: Bearer <token>

# Réponse
{
  "success": true,
  "user": { "memberId": 2, "email": "...", "role": "member" }
}
```

```bash
# Changer le mot de passe
POST /api/auth/change-password
Authorization: Bearer <token>
{
  "currentPassword": "old",
  "newPassword": "new",
  "confirmPassword": "new"
}
```

### 👤 Profil Membre

```bash
# Récupérer profil public
GET /api/members/:id

# Récupérer profil complet (authentifié)
GET /api/members/:id/profile
Authorization: Bearer <token>

# Modifier son profil
PUT /api/members/:id/profile
Authorization: Bearer <token>
Content-Type: application/json
{
  "name": "John Doe",
  "title": "Developer",
  "bio": "...",
  "phone": "+237...",
  "linkedin": "https://...",
  "specialties": ["React", "Node.js"],
  "certifications": ["AWS", "GCP"]
}

# Télécharger une photo
PUT /api/members/:id/photo
Authorization: Bearer <token>
Content-Type: multipart/form-data
[binary file data]
```

### 🔧 Admin - Gestion des Comptes

```bash
# Lister tous les membres + statut compte
GET /api/admin/members
Authorization: Bearer <admin-token>

# Créer un compte pour un membre
POST /api/admin/members/:id/account
Authorization: Bearer <admin-token>
{
  "email": "bob@sitetru.com",
  "initialPassword": "demo123",  // optionnel
  "role": "member"
}

# Réponse
{
  "success": true,
  "account": {
    "email": "bob@sitetru.com",
    "role": "member",
    "loginCode": "ABC123DEF456",
    "loginCodeExpiry": "2025-02-01T00:00:00Z"
  }
}
```

```bash
# Générer un nouveau code de connexion
POST /api/admin/members/:id/login-code
Authorization: Bearer <admin-token>

# Réponse
{
  "success": true,
  "loginCode": "XYZ789ABC123",
  "expiresAt": "2025-02-01T00:00:00Z"
}
```

```bash
# Modifier un compte
PUT /api/admin/members/:id/account
Authorization: Bearer <admin-token>
{
  "email": "newemail@sitetru.com",
  "status": "active",  // active, pending, inactive
  "role": "admin"
}
```

```bash
# Supprimer un compte
DELETE /api/admin/members/:id/account
Authorization: Bearer <admin-token>
```

---

## 📁 Structure des Fichiers

### Backend

```
backend/
├── server.js                      # Routes principales
├── data.json                      # Données + memberAccounts
├── utils/
│   ├── passwordUtils.js          # Hash, compare, JWT
│   └── codeGenerator.js          # Générer codes
└── middleware/
    └── auth.js                   # Vérification JWT
```

### Frontend (Site)

```
src/
├── pages/
│   ├── MemberLogin.jsx           # Page connexion
│   └── MemberProfile.jsx         # Profil personnel
├── hooks/
│   ├── useAuth.js               # Hook authentification
│   └── useMemberProfile.js      # Hook profil
└── components/
    └── ProtectedRoute.jsx        # Routes protégées
```

### Backoffice (Admin)

```
backoffice/src/pages/
├── Admin.jsx                      # Panel admin principal
└── MemberAccountsPage.jsx         # Gestion des comptes
```

---

## 🧪 Tester le Système

### Test 1: Créer un Compte Admin de Test

```bash
# Mettre à jour data.json
{
  "memberAccounts": [
    {
      "id": 1,
      "memberId": 4,
      "email": "test@trugroup.cm",
      "passwordHash": "demo",
      "role": "admin",
      "status": "active",
      "createdAt": "2025-01-16T00:00:00Z"
    }
  ]
}
```

### Test 2: Se Connecter en Admin

1. Allez sur `/admin`
2. Email: `test@trugroup.cm`, Mot de passe: `demo`
3. ✅ Vous devez voir le tableau de bord

### Test 3: Créer un Compte pour Halimatou

1. Dans `/admin`, onglet "Accès Membres"
2. Cherchez "Halimatou Sadia Ahmadou"
3. Cliquez "Create"
4. Email: `halimatou@sitetru.com`, Rôle: `member`
5. ✅ Code généré: ex. `ABC123DEF456`

### Test 4: Se Connecter en tant qu'Halimatou

1. Ouvrez une session incognito
2. Allez sur `/member/login?code=ABC123DEF456`
3. Le code devrait être pré-rempli ✅
4. Créez un mot de passe
5. ✅ Vous êtes connecté sur `/member/dashboard`

### Test 5: Modifier le Profil

1. Cliquez "Edit"
2. Changez le téléphone, bio, ajoutez des expertises
3. Cliquez "Save"
4. ✅ Les modifications sont sauvegardées

### Test 6: Générer Nouveau Code

1. Retour à `/admin`
2. Onglet "Accès Membres"
3. Cherchez le membre
4. Cliquez bouton "rotation" ↻
5. ✅ Nouveau code généré

---

## 🔄 Flux Complet d'Utilisation

```
ADMINISTRATEUR:
1. Allez à /admin
2. Connectez-vous
3. Onglet "Accès Membres"
4. Cliquez "Create" pour un membre
5. Remplissez email et rôle
6. Code de connexion auto-généré
7. Envoyez le code au membre (email/SMS)

MEMBRE (Première Fois):
1. Reçoit code: ABC123DEF456
2. Visite /member/login?code=ABC123DEF456
3. Voit le formulaire "Login Code"
4. Crée son mot de passe
5. Connecté! Redirigé à /member/dashboard
6. Peut modifier son profil

MEMBRE (Connexions Suivantes):
1. Visite /member/login
2. Email + Mot de passe
3. Connecté à /member/dashboard
4. Peut modifier profil, ajouter photo, etc.

ADMINISTRATEUR (Gestion):
1. Peut modifier email/rôle du compte
2. Peut générer nouveau code
3. Peut désactiver/supprimer compte
4. Voit dernier accès
```

---

## ⚙️ Configuration

### Variables d'Environnement

Backend (`backend/.env` ou `process.env`):
```
PORT=5000
NODE_ENV=production
```

Frontend (`vite.config.js`):
```javascript
VITE_API_URL="https://tru-backend-o1zc.onrender.com"
VITE_BACKEND_URL="https://tru-backend-o1zc.onrender.com"
```

### Durée de Token/Code

Dans `backend/utils/passwordUtils.js`:
```javascript
// Changer la durée d'expiration du JWT
generateJWT(payload, secret, '48h')  // 48 heures au lieu de 24h

// Dans backend/utils/codeGenerator.js
getExpiryDate(48)  // 48 heures au lieu de 24h
```

### Hasher Personnalisé

Actuellement utilise PBKDF2. Pour utiliser bcrypt:
```bash
npm install bcryptjs
```

Puis dans `passwordUtils.js`:
```javascript
import bcrypt from 'bcryptjs';

export function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}
```

---

## 🐛 Dépannage

### "Token invalide ou expiré"
- Le JWT a expiré (24h max)
- Reconnectez-vous
- Ou générez un nouveau code de connexion

### "Account not found"
- Le compte n'existe pas encore
- Admin doit d'abord créer le compte
- Vérifiez l'email

### "Email already in use"
- L'email est déjà associé à un autre compte
- Utilisez un email différent

### "Login code expired"
- Le code a expiré (24h)
- Demandez un nouveau code à l'admin
- Cliquez bouton ↻ "regenerate login code"

### "Photo too large"
- Maximum 5MB
- Compressez l'image
- Ou convertissez en PNG/JPG

---

## 📊 Données Importantes

Les données sont stockées dans `backend/data.json`:

```json
{
  "team": [...],              // Infos publiques des membres
  "memberAccounts": [...]     // Comptes de connexion
}
```

### Migration Future

Pour passer à une vraie base de données:

1. **PostgreSQL**
   - Table: `members` (profils)
   - Table: `member_accounts` (comptes)
   - Foreign key: `accounts.memberId -> members.id`

2. **Exemple Prisma Schema**
   ```prisma
   model Member {
     id Int @id @default(autoincrement())
     name String
     email String
     account MemberAccount?
   }
   
   model MemberAccount {
     id Int @id @default(autoincrement())
     memberId Int @unique
     email String @unique
     passwordHash String
     role String
     member Member @relation(fields: [memberId], references: [id])
   }
   ```

---

## 📞 Support

### Questions Fréquentes

**Q: Où stocker les uploads de photo?**
A: Actuellement, images converties en base64. Pour la production:
   - Utilisez Cloudinary, AWS S3, ou Vercel Blob Storage
   - Stockez l'URL au lieu de base64

**Q: Comment réinitialiser un mot de passe perdu?**
A: Admin génère un nouveau code de connexion avec le bouton ↻

**Q: Puis-je avoir plusieurs rôles?**
A: Non, un seul rôle par compte. Ajuster si nécessaire en utilisant array de rôles.

**Q: Comment envoyer les codes par email?**
A: Intégrez SendGrid ou Nodemailer:
   ```javascript
   // Dans createAccountMutation
   await sendEmail({
     to: email,
     subject: 'Votre code de connexion TRU',
     html: `Votre code: ${loginCode}`
   });
   ```

---

## ✅ Checklist de Déploiement

- [ ] Backend API fonctionne
- [ ] Routes authentification testées
- [ ] Créer compte pour un membre
- [ ] Se connecter avec code
- [ ] Modifier profil
- [ ] Page admin accessible
- [ ] Générer nouveau code fonctionne
- [ ] JWT valide après 24h?
- [ ] Supprimer compte fonctionne
- [ ] Messages d'erreur clairs
- [ ] Git committé et pushé
- [ ] Variables d'environnement set
- [ ] Logs vérifiés
- [ ] Tester en incognito

---

**Version**: 1.0 - Portail Membre Professionnel  
**Date**: 16 Janvier 2025  
**Status**: ✅ READY FOR TESTING  
**Support**: Tech Team
