# Architecture - Portail Membre Professionnel

## 🎯 Objectif
Créer un système où chaque membre de l'équipe peut:
1. Se connecter avec son email professionnel
2. Gérer son profil personnel
3. Modifier ses données (photo, bio, description, etc.)
4. Voir ses permissions/rôles

Et l'administrateur peut:
1. Créer des comptes pour les membres
2. Générer des codes de connexion/réinitialisation
3. Gérer les rôles et permissions

---

## 📊 Structure Données

### 1. Extension du modèle `team` (data.json)
```json
{
  "id": 2,
  "name": "Halimatou Sadia Ahmadou",
  "title": "Chef de Projet Junior",
  "bio": "...",
  "email": "bob@sitetru.com",
  "phone": "+237 696317216",
  "linkedin": "",
  "image": "...",
  "specialties": [],
  "certifications": [],
  "is_founder": false,
  
  // ✨ NEW: Profil d'accès
  "profile": {
    "hasAccount": true,           // A un compte professionnel
    "createdAt": "2025-01-16T...",
    "lastLogin": "2025-01-16T...",
    "role": "member",             // admin, member, viewer
    "permissions": [
      "edit_own_profile",
      "view_team",
      "view_own_data"
    ]
  }
}
```

### 2. Nouvelle collection `memberAccounts` (data.json)
```json
{
  "memberAccounts": [
    {
      "id": 2,
      "memberId": 2,           // Lien vers team[id]
      "email": "bob@sitetru.com",
      "passwordHash": "bcrypt_hash",
      "role": "member",
      "status": "active",      // active, pending, inactive
      "loginCode": "ABC123DEF456",  // Code de première connexion
      "loginCodeExpiry": "2025-02-01T00:00:00Z",
      "twoFactorEnabled": false,
      "createdAt": "2025-01-16T...",
      "updatedAt": "2025-01-16T...",
      "lastLogin": null
    }
  ]
}
```

---

## 🛣️ Routes API à Créer

### Authentication
```
POST   /api/auth/login              - Connexion (email + password)
POST   /api/auth/login-code         - Connexion avec code temporaire
POST   /api/auth/reset-password     - Réinitialisation mot de passe
POST   /api/auth/verify-token       - Vérifier JWT
GET    /api/auth/logout             - Déconnexion
```

### Member Profile
```
GET    /api/members/:id             - Récupérer profil (publique)
GET    /api/members/:id/profile     - Récupérer profil complet (privé)
PUT    /api/members/:id/profile     - Modifier son profil
PUT    /api/members/:id/photo       - Télécharger photo (multipart)
PUT    /api/members/:id/password    - Changer mot de passe
```

### Admin - Gestion Comptes
```
GET    /api/admin/members           - Lister tous les membres + statut compte
POST   /api/admin/members/:id/account    - Créer un compte pour un membre
PUT    /api/admin/members/:id/account    - Modifier le compte
DELETE /api/admin/members/:id/account    - Supprimer le compte
POST   /api/admin/members/:id/login-code - Générer nouveau code connexion
PUT    /api/admin/members/:id/role       - Modifier le rôle
PUT    /api/admin/members/:id/permissions - Modifier les permissions
```

---

## 🔐 Système de Rôles & Permissions

### Rôles
- **admin**: Accès complet au backoffice + gestion des comptes
- **member**: Peut modifier son profil, voir l'équipe
- **viewer**: Lecture seule de son profil

### Permissions
```javascript
{
  "admin": [
    "manage_all_profiles",
    "manage_accounts",
    "generate_login_codes",
    "view_logs",
    "manage_permissions"
  ],
  
  "member": [
    "edit_own_profile",
    "view_own_profile",
    "view_team",
    "change_own_password"
  ],
  
  "viewer": [
    "view_own_profile"
  ]
}
```

---

## 🔑 Flux de Connexion Membres

### 1️⃣ Première Connexion (Code Temporaire)
```
Admin crée compte
  ↓
Génère code: ABC123DEF456 (expire 24h)
  ↓
Envoie code au membre (email/SMS)
  ↓
Membre accède /member/login
  ↓
Tape code
  ↓
Crée son mot de passe
  ↓
Accès au profil
```

### 2️⃣ Connexion Régulière
```
Membre visite /member/login
  ↓
Email + Mot de passe
  ↓
JWT généré (24h d'expiration)
  ↓
Accès au /member/profile
```

---

## 📁 Structure Dossiers

### Backend
```
backend/
├── server.js                 (endpoints authentification + admin)
├── data.json                 (memberAccounts collection)
├── middleware/
│  ├── auth.js               (vérifier JWT)
│  └── permissions.js        (vérifier permissions)
└── utils/
   ├── passwordUtils.js      (hash, compare)
   └── codeGenerator.js      (générer codes)
```

### Frontend (Site)
```
src/pages/
├── team/
│  ├── MemberDetail.jsx      (Profil public d'un membre)
│  └── MemberProfile.jsx     (Profil personnel connecté)

src/components/
├── auth/
│  ├── MemberLogin.jsx       (Page connexion)
│  └── ProtectedRoute.jsx    (Route protégée)
├── profile/
│  ├── ProfileEditor.jsx     (Éditer profil)
│  ├── PhotoUpload.jsx       (Télécharger photo)
│  └── PasswordChanger.jsx   (Changer mot de passe)
└── dashboard/
   └── MemberDashboard.jsx   (Dashboard personnel)

src/hooks/
├── useAuth.js              (Hook d'authentification)
└── useMemberProfile.js     (Hook profil)
```

### Backoffice (Admin)
```
backoffice/src/pages/
├── MemberAccountsPage.jsx   (Gestion des comptes)

backoffice/src/components/
├── CreateMemberAccount.jsx  (Créer un compte)
├── MemberAccountsList.jsx   (Lister les comptes)
├── GenerateLoginCode.jsx    (Générer code connexion)
└── MemberPermissions.jsx    (Gérer permissions)
```

---

## 🔐 Sécurité

### Authentification
- JWT (JSON Web Token) avec signature HS256
- Token JWT expire 24h (optionnel refresh token)
- Code connexion expire après 24h
- Code utilisable une seule fois

### Autorisation
- Middleware `requireAuth()` pour routes protégées
- Middleware `checkPermission()` pour actions spécifiques
- Vérifier `req.user.memberId` pour limiter à son propre profil

### Données Sensibles
- Hachage bcrypt pour mots de passe
- Ne JAMAIS retourner les hash de mot de passe
- Logs des modifications de profil
- Codes de connexion uniques par membre

---

## 📋 Étapes Implémentation

### Phase 1: Backend (Jours 1-2)
1. ✅ Étendre data.json avec memberAccounts
2. ⏳ Créer endpoints /api/auth/login
3. ⏳ Créer endpoints /api/auth/login-code
4. ⏳ Créer endpoints /api/members/:id/profile (GET/PUT)
5. ⏳ Créer endpoints /api/admin/members/* (tous)
6. ⏳ Ajouter middleware d'authentification

### Phase 2: Frontend Site (Jours 3-4)
1. ⏳ Page MemberLogin.jsx
2. ⏳ Page MemberDashboard.jsx
3. ⏳ Page ProfileEditor.jsx
4. ⏳ Hook useAuth.js
5. ⏳ Routes protégées

### Phase 3: Backoffice Admin (Jours 4-5)
1. ⏳ Page MemberAccountsPage.jsx
2. ⏳ Composant CreateMemberAccount.jsx
3. ⏳ Composant GenerateLoginCode.jsx
4. ⏳ Gestion des rôles/permissions

### Phase 4: Tests & Déploiement (Jour 6)
1. ⏳ Tester flux complet
2. ⏳ Tester sécurité
3. ⏳ Push et déploiement

---

## 💾 Données d'Exemple

### Membre avec compte
```json
{
  "id": 2,
  "name": "Halimatou Sadia Ahmadou",
  "email": "bob@sitetru.com",
  "title": "Chef de Projet Junior",
  "bio": "...",
  "phone": "+237 696317216",
  "specialties": ["Project Management", "Agile"],
  "profile": {
    "hasAccount": true,
    "role": "member",
    "createdAt": "2025-01-16T10:00:00Z",
    "lastLogin": "2025-01-16T14:30:00Z"
  }
}
```

### Compte d'accès
```json
{
  "id": 2,
  "memberId": 2,
  "email": "bob@sitetru.com",
  "passwordHash": "$2b$10$...",
  "role": "member",
  "status": "active",
  "loginCode": null,
  "twoFactorEnabled": false,
  "createdAt": "2025-01-16T10:00:00Z",
  "lastLogin": "2025-01-16T14:30:00Z"
}
```

---

## ✅ Checklist

- [ ] data.json étendu avec memberAccounts
- [ ] Endpoints auth créés
- [ ] Endpoints profil créés
- [ ] Endpoints admin créés
- [ ] Middleware d'authentification
- [ ] Page login créée
- [ ] Page profil créée
- [ ] Page admin créée
- [ ] Tests d'authentification
- [ ] Déploiement

