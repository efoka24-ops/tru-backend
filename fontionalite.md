Je vais te donner une liste **exhaustive** des fonctionnalités du backend en me basant sur le code réel (surtout [server.js](cci:7://file:///home/fantome/TrueGroup/tru-backend/server.js:0:0-0:0) + dossiers [controllers/](cci:9://file:///home/fantome/TrueGroup/tru-backend/controllers:0:0-0:0), [middleware/](cci:9://file:///home/fantome/TrueGroup/tru-backend/middleware:0:0-0:0), [services/](cci:9://file:///home/fantome/TrueGroup/tru-backend/services:0:0-0:0), [utils/](cci:9://file:///home/fantome/TrueGroup/tru-backend/utils:0:0-0:0), [lib/](cci:9://file:///home/fantome/TrueGroup/tru-backend/lib:0:0-0:0), `database*.js`). Je commence par extraire toutes les routes exposées et les services utilisés, puis je te synthétise ça par modules (auth, team, services, news, jobs, uploads, admin, etc.).





Je vais extraire **toutes les routes HTTP** déclarées dans [server.js](cci:7://file:///home/fantome/TrueGroup/tru-backend/server.js:0:0-0:0) (il est long, donc je fais une recherche structurée sur les patterns `/api/…`) et je complète avec les modules ([controllers](cci:9://file:///home/fantome/TrueGroup/tru-backend/controllers:0:0-0:0), [middleware](cci:9://file:///home/fantome/TrueGroup/tru-backend/middleware:0:0-0:0), [services](cci:9://file:///home/fantome/TrueGroup/tru-backend/services:0:0-0:0), [utils](cci:9://file:///home/fantome/TrueGroup/tru-backend/utils:0:0-0:0)). Ensuite je te donne la liste des fonctionnalités, groupées par domaines (auth, admin, team, news, etc.) + les variables d’environnement utilisées.




# Fonctionnalités du backend [tru-backend](cci:9://file:///home/fantome/TrueGroup/tru-backend:0:0-0:0) (d’après le code)

Le backend est une API **Node.js / Express** (ESM) qui expose des endpoints REST pour gérer les données du site (équipe, actualités, témoignages, etc.), avec upload d’images, auth JWT et une partie admin. Il mélange **plusieurs “modes” de stockage** (Supabase, JSON local, et scripts/migration PostgreSQL).

> Important : [server.js](cci:7://file:///home/fantome/TrueGroup/tru-backend/server.js:0:0-0:0) référence `./lib/supabase.js` et `./routes/auth.js` mais ces fichiers **n’existent pas** dans le repo actuellement, donc certaines fonctionnalités sont *dans le code* mais ne peuvent pas tourner tant que ces modules ne sont pas restaurés.

---

## 1) Stack & comportement global

- **Serveur**: Express.
- **Port**: `PORT` env ou `5000`.
- **CORS**: autorise une liste d’origines (localhost + domaines Vercel/Render + `bo.trugroup.cm`, `fo.trugroup.cm`). Actuellement le callback laisse passer tout “for now”.
- **Body parsing**:
  - JSON jusqu’à `50mb`
  - urlencoded jusqu’à `50mb`
- **Fichiers/données locales**:
  - `DATA_DIR` env ou dossier du projet
  - `DATA_FILE = <DATA_DIR>/data.json`
  - création du dossier si absent
- **Upload**: `multer` en **memoryStorage**, limite 5MB, types autorisés:
  - `jpeg/png/gif/webp/pdf`
- **404 handler**: renvoie `{ error: 'Route not found' }`.

---

## 2) Health & endpoints de diagnostic

- **GET `/`**
  - renvoie un JSON “Backend is running” + liste d’endpoints.
- **GET `/api/health`**
  - renvoie `{ status: 'Server is running' }`
- **GET `/api/test`**
  - renvoie un JSON avec timestamp + info “database” + si autoBackup est activé (via `GITHUB_TOKEN`)

---

## 3) Upload / images

- **POST `/api/upload`** (multipart `image`)
  - renvoie un **data URL base64** (pas un fichier stocké sur disque)
- **POST `/api/image`** (JSON)
  - accepte une image en dataURL
  - limite ~1MB (sur la longueur de la string)
  - renvoie l’URL telle quelle si OK
- **POST `/api/uploads/team-photo`** (multipart `image`)
  - upload l’image via `supabase.storage.from(bucket).upload(...)`
  - puis récupère `getPublicUrl`
  - bucket configuré par `SUPABASE_TEAM_PHOTO_BUCKET` (défaut `team-photos`)

---

## 4) Auth / sécurité (JWT) + rôles

### Middleware JWT (utilisé dans [server.js](cci:7://file:///home/fantome/TrueGroup/tru-backend/server.js:0:0-0:0))
Fichier: [middleware/auth.js](cci:7://file:///home/fantome/TrueGroup/tru-backend/middleware/auth.js:0:0-0:0)
- **[verifyToken](cci:1://file:///home/fantome/TrueGroup/tru-backend/middleware/auth.js:5:0-36:1)**
  - lit `Authorization: Bearer <token>`
  - vérifie le token (HS256 “maison”) via [utils/passwordUtils.js](cci:7://file:///home/fantome/TrueGroup/tru-backend/utils/passwordUtils.js:0:0-0:0)
  - met `req.user`
- **[requireAdmin](cci:1://file:///home/fantome/TrueGroup/tru-backend/lib/auth.js:83:0-102:1)**, **[requireMember](cci:1://file:///home/fantome/TrueGroup/tru-backend/middleware/auth.js:38:0-51:1)**
  - contrôle le champ `role`
- **[requireOwnProfile](cci:1://file:///home/fantome/TrueGroup/tru-backend/middleware/auth.js:68:0-84:1)**
  - autorise accès si `req.params.id === req.user.memberId` ou admin

### Génération/validation JWT (implémentation maison)
Fichier: [utils/passwordUtils.js](cci:7://file:///home/fantome/TrueGroup/tru-backend/utils/passwordUtils.js:0:0-0:0)
- hash password via `crypto.pbkdf2Sync` avec salt fixe (`tru_salt_key_2025`)
- **JWT HS256 “fait maison”**:
  - secret: `JWT_SECRET` env sinon fallback `tru_jwt_secret_key_2025`
  - expiration configurable via `expiresIn` (par défaut 24h)

### Auth “nouveau système”
- [server.js](cci:7://file:///home/fantome/TrueGroup/tru-backend/server.js:0:0-0:0) fait: `app.use('/api/auth', authRoutes);`
- Mais `routes/auth.js` est **manquant**, donc les routes `/api/auth/*` “Supabase auth” ne sont pas visibles ici.

### Ancien système auth (commenté)
Dans [server.js](cci:7://file:///home/fantome/TrueGroup/tru-backend/server.js:0:0-0:0), il existe des routes auth “old” (login/email+password, login-code, verify-token, change-password), mais elles sont **dans un gros bloc commenté** `/* ... */`.

---

## 5) Gestion profil membre (mode JSON / data.json)

Ces routes lisent/écrivent via [readData()](cci:1://file:///home/fantome/TrueGroup/tru-backend/server.js:142:0-167:1) / [writeData()](cci:1://file:///home/fantome/TrueGroup/tru-backend/server.js:169:0-177:1) sur `data.json`:

- **GET `/api/members/:id`**
  - profil public d’un membre (dans `data.team`)
- **GET `/api/members/:id/profile`** (auth + own-profile)
  - profil complet + infos du compte dans `data.memberAccounts`
- **PUT `/api/members/:id/profile`** (auth + own-profile)
  - mise à jour des champs (name, title, bio, phone, linkedin, specialties, certifications)
- **PUT `/api/members/:id/photo`** (auth + own-profile + upload)
  - met à jour `member.image` en base64 data URL

---

## 6) Admin: gestion des comptes “memberAccounts” (mode JSON)

Routes protégées [verifyToken](cci:1://file:///home/fantome/TrueGroup/tru-backend/middleware/auth.js:5:0-36:1) + [requireAdmin](cci:1://file:///home/fantome/TrueGroup/tru-backend/lib/auth.js:83:0-102:1):

- **GET `/api/admin/members`**
  - liste la team + ajoute un sous-objet `account` (status/role/createdAt/lastLogin…) si présent
- **POST `/api/admin/members/:id/account`**
  - crée un compte (email, initialPassword optionnel, role)
  - génère un `loginCode` (via [utils/codeGenerator.js](cci:7://file:///home/fantome/TrueGroup/tru-backend/utils/codeGenerator.js:0:0-0:0))
  - met à jour l’email du membre
- **POST `/api/admin/members/:id/login-code`**
  - régénère un login code + expiry
- **PUT `/api/admin/members/:id/account`**
  - met à jour email/status/role
- **DELETE `/api/admin/members/:id/account`**
  - supprime le compte

Route de test:
- **GET `/api/test/team`**: debug sur le contenu team + memberAccounts.

---

## 7) Données “site” en mode Supabase (CRUD côté API)

Ces endpoints utilisent **`supabase.*`** (module manquant actuellement), mais les routes sont clairement présentes :

### Team
- **GET `/api/team`**
- **GET `/api/team/:id`**
- **POST `/api/team`** (multipart `image`)
- **PUT `/api/team/:id`** (multipart `image`)
- **DELETE `/api/team/:id`**

### Témoignages
- **GET `/api/testimonials`**
- **POST `/api/testimonials`** (multipart `image`)
- **PUT `/api/testimonials/:id`** (multipart `image`)
- **DELETE `/api/testimonials/:id`**

### Actualités
- **GET `/api/news`**
- **GET `/api/actualite`** (alias)
- **POST `/api/news`** (multipart `image`)
- **PUT `/api/news/:id`** (multipart `image`)
- **DELETE `/api/news/:id`**

### Solutions
- **GET `/api/solutions`** (supabase)
- Il existe aussi un **POST `/api/solutions`** qui passe par `data.json` (mix des deux approches)

> Dans [server.js](cci:7://file:///home/fantome/TrueGroup/tru-backend/server.js:0:0-0:0), il y a aussi des blocs plus loin (tronqués dans la sortie) qui montrent d’autres domaines Supabase: candidatures (`/api/applications`), projets réalisés (`/api/projets-realises`), etc.

---

## 8) Migration / PostgreSQL (scripts & contrôleurs)

Tu as un fichier [database.js](cci:7://file:///home/fantome/TrueGroup/tru-backend/database.js:0:0-0:0) (que tu regardais) qui:
- se connecte à Postgres via `DATABASE_URL` (SSL `rejectUnauthorized: false`)
- expose [initializeDatabase()](cci:1://file:///home/fantome/TrueGroup/tru-backend/database.js:28:0-180:1) pour créer des tables (`settings`, `team`, etc.)

Et un contrôleur [controllers/migrationController.js](cci:7://file:///home/fantome/TrueGroup/tru-backend/controllers/migrationController.js:0:0-0:0):
- **[migrateDataHandler](cci:1://file:///home/fantome/TrueGroup/tru-backend/controllers/migrationController.js:24:0-262:1)** (annoncé pour `POST /api/admin/migrate-data`)
- lit un `data.json`, puis insère dans Postgres:
  - `team`, `testimonials`, [services](cci:9://file:///home/fantome/TrueGroup/tru-backend/services:0:0-0:0), `settings`, `contacts`, `jobs`, etc.

---

## 9) Services “sync GitHub” (optionnel)

[services/githubSyncService.js](cci:7://file:///home/fantome/TrueGroup/tru-backend/services/githubSyncService.js:0:0-0:0) :
- si `ENABLE_GIT_SYNC=true`, à chaque CRUD:
  - écrit des JSON dans un dossier `data/`
  - `git add .`
  - `git commit -m "[AUTO] ..."`
  - `git push origin <branch>` (`GIT_BRANCH` env sinon `main`)

---

## 10) Variables d’environnement observées (directement dans le code)

- **`PORT`**: port HTTP
- **`DATA_DIR`**: emplacement de `data.json`
- **`JWT_SECRET`**: secret JWT (implémentation maison)
- **`GITHUB_TOKEN`**: mentionné pour “auto backup” (mais des imports sont commentés)
- **`DATABASE_URL`**: Postgres
- **`ENABLE_GIT_SYNC`**, **`REPO_PATH`**, **`GIT_BRANCH`**: sync GitHub
- **`WEBHOOK_URL`**: notifications realtime (middleware [realtimeSync.js](cci:7://file:///home/fantome/TrueGroup/tru-backend/middleware/realtimeSync.js:0:0-0:0), plutôt “exemple”)
- **`SUPABASE_TEAM_PHOTO_BUCKET`**: bucket storage supabase

---

# Conclusion (résumé “tout ce que fait le backend”)

- **API health/diagnostic**
- **Uploads** (base64 + supabase storage pour team-photo)
- **Auth JWT + rôles admin/member** (middleware)
- **Gestion profils membres** (JSON `data.json`)
- **Admin: création/gestion comptes membres** (JSON `data.json`)
- **CRUD métier** (team, news, testimonials, solutions, applications, projets…) **majoritairement via Supabase** (mais module Supabase manquant dans ce repo)
- **Scripts/migration PostgreSQL** ([database.js](cci:7://file:///home/fantome/TrueGroup/tru-backend/database.js:0:0-0:0), migration controller)
- **Sync GitHub automatique optionnel**

Si tu veux, je peux te générer une table “endpoint -> description -> auth required -> stockage utilisé” (ça rend super clair), mais pour être 100% complet sur les endpoints après la partie tronquée de [server.js](cci:7://file:///home/fantome/TrueGroup/tru-backend/server.js:0:0-0:0), il faudra que je scanne la fin du fichier (à partir d’environ la ligne 1360+).

---

# Checklist de tests sécurité (backend Rust)

Objectif: valider que l’API Rust est durcie (CORS, rate limit, headers, limites), que les entrées sont correctement validées, que les erreurs sont uniformes (pas de leak SQL/stack), et que l’auth/RBAC ne se contourne pas.

## A) Invariants à vérifier sur toutes les routes

- **Format d’erreur uniforme**
  - Attendu: réponses d’erreur JSON du type `{"error":"<code>"}`.
  - À vérifier:
    - Pas de message SQLx, pas de détails internes, pas de stack trace.
    - Le body d’erreur reste stable entre routes (mêmes clés JSON).

- **Headers de sécurité**
  - Attendu (présents si absents):
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `Referrer-Policy: no-referrer`

- **Timeout global**
  - Attendu: requêtes longues coupées en ~10s avec `408`.

- **Limite de taille du body**
  - Attendu: limite globale ~`5MB` (et certaines routes ont des caps additionnels au niveau validation).

- **Rate limiting**
  - Attendu: limitation ~`5 req/s` avec burst ~`20` (Tower Governor).

## B) CORS (liste blanche)

- **Origin non autorisée**
  - Faire une requête avec un `Origin` non listé.
  - Attendu: pas de header `Access-Control-Allow-Origin` correspondant (le navigateur doit bloquer).

- **Preflight OPTIONS**
  - Attendu: les méthodes `GET/POST/PUT/DELETE/OPTIONS` et headers standards (`Authorization`, `Content-Type`, `Accept`, `Origin`) passent uniquement sur origin autorisée.

## C) Auth JWT + RBAC

- **Endpoints admin sans token**
  - Attendu: `401` (ou `403` selon choix), toujours avec JSON uniforme.

- **Token invalide / expiré**
  - Attendu: refus + JSON uniforme.

- **Role admin requis**
  - Attendu: un `member` ne peut pas:
    - créer/modifier/supprimer `team`, `services`, `solutions`, `news`, `testimonials`, `jobs`, `projects`
    - accéder aux routes `/api/admin/*`

- **Own-profile**
  - Attendu: un `member` ne peut modifier que son propre profil (`/api/members/:id/profile` et `/api/members/:id/photo`) sauf admin.
  - Test: appeler ces routes avec un token d’un autre `member_id`.

## D) Validation des inputs (anti-abus)

- **Champs requis**
  - Attendu: les champs `title/name` requis selon entité, email valide sur routes qui le demandent, etc.

- **Max length / size caps**
  - Attendu: les champs texte trop longs doivent être rejetés (400) sans traitement DB.
  - Attendu: JSON `details/social_links/technologies` trop gros rejeté.

- **URL validation**
  - Attendu: champs URL acceptent uniquement `http`/`https` valides.

- **Payloads "bizarres"**
  - Envoi de types inattendus (ex: number au lieu de string) => `400`.

## E) Upload / images (si applicable)

- **Payload trop grand**
  - Attendu: rejet sur dépassement des limites (global 5MB, et caps spécifiques ex: photo member cap string).

- **Type / contenu**
  - Attendu: pas d’exécution côté serveur (le backend ne doit pas interpréter du contenu comme code).

## F) CRUD: comportements attendus

- **404**
  - Ressource inexistante => `404` + JSON uniforme.

- **Conflits**
  - Contraintes uniques (si présentes) => `409` + JSON uniforme.

## G) Tests rapides (exemples curl)

> Remplacer `http://localhost:5000` par l’URL réelle, et `TOKEN_ADMIN`/`TOKEN_MEMBER` par des JWT.

```bash
# Health
curl -i http://localhost:5000/api/health

# Vérifier headers de sécurité (doit inclure X-Frame-Options etc.)
curl -I http://localhost:5000/api/health

# Admin sans token => refus
curl -i http://localhost:5000/api/admin/members

# Admin avec token member => refus
curl -i -H "Authorization: Bearer $TOKEN_MEMBER" http://localhost:5000/api/admin/members

# Admin avec token admin => OK
curl -i -H "Authorization: Bearer $TOKEN_ADMIN" http://localhost:5000/api/admin/members

# CORS: simuler un Origin
curl -i -H "Origin: https://evil.example" http://localhost:5000/api/health

# Body limit (génère un body > 5MB)
python - <<'PY'
import json
print(json.dumps({"x":"a"*(6*1024*1024)}))
PY | curl -i -H 'Content-Type: application/json' --data-binary @- http://localhost:5000/api/contacts
```

## H) Critères d’acceptation

- **Aucun leak d’erreur interne** (SQLx, détails DB, stack trace).
- **Toutes les erreurs client** (`400/401/403/404/409/413/408/500`) ont un JSON uniforme.
- **Rate limit / timeout / body limit / CORS** effectifs et testés.
- **RBAC** non contournable (admin-only + own-profile).