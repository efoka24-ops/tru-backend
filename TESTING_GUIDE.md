# 📋 Guide de Test Complet du Site TRU GROUP

## 🚀 Démarrage des serveurs

### Backend (Node.js - Port 5000)
```bash
cd backend
npm start
```

### Frontend (Vite - Port 5173)
```bash
npm run dev
```

### Backoffice (Vite - Port 3001)
```bash
cd backoffice
npm run dev
```

---

## ✅ Modules à tester

### 1. **ACTUALITÉS (News)**

#### Frontend: `/news`
- [ ] Afficher la grille des actualités
- [ ] Cliquer sur "Lire plus"
- [ ] Modale s'ouvre avec article complet
- [ ] Naviguer avec flèches → ←
- [ ] Voir le compteur "1 / 5"
- [ ] Clique sur Suivant/Précédent fonctionne
- [ ] Fermer avec X ou Échap

#### Backoffice: `/applications` → Menu "Actualités"
- [ ] Aller à `/news`
- [ ] Voir la liste des actualités
- [ ] Créer une nouvelle actualité (+ Nouvelle actualité)
- [ ] Remplir: Titre, Description, Image, Catégorie
- [ ] Modifier une actualité existante
- [ ] Supprimer avec confirmation
- [ ] Rechercher par titre

---

### 2. **OFFRES D'EMPLOI (Careers)**

#### Frontend: `/careers`
- [ ] Afficher la liste des offres
- [ ] Cliquer sur une offre (expandable)
- [ ] Voir tous les détails (Salaire, Département, Profil)
- [ ] Cliquer sur "Postuler maintenant"
- [ ] Modale de candidature s'ouvre
- [ ] Remplir: Nom, Email, Téléphone, LinkedIn, Lettre
- [ ] Upload de CV (optionnel)
- [ ] Soumettre la candidature
- [ ] Message de succès s'affiche

#### Backoffice: Gestion des offres
- [ ] Aller à `/jobs`
- [ ] Voir la liste des offres
- [ ] Créer une nouvelle offre (+ Nouvelle offre)
- [ ] Remplir: Titre, Localisation, Type, Description
- [ ] Ajouter Département, Salaire, Profil recherché
- [ ] Modifier une offre existante
- [ ] Supprimer avec confirmation
- [ ] Rechercher par titre/localisation

#### Backoffice: Gestion des candidatures
- [ ] Aller à `/applications`
- [ ] Voir le tableau de bord avec stats
- [ ] Filtrer par statut (Nouveau, En cours, Accepté, Rejeté)
- [ ] Cliquer sur une candidature (icône oeil)
- [ ] Voir tous les détails:
  - Email, Téléphone, LinkedIn
  - Lettre de motivation complète
  - CV téléchargeable
- [ ] Changer le statut de la candidature
- [ ] Supprimer une candidature

---

### 3. **SERVICES**

#### Frontend: `/services`
- [ ] Afficher la grille des services (3 colonnes)
- [ ] Voir le prix, catégorie, description (aperçu)
- [ ] Cliquer sur "En savoir plus"
- [ ] Modale s'ouvre avec:
  - [ ] Image haute résolution
  - [ ] Toutes les caractéristiques
  - [ ] Description complète
  - [ ] Infos: Durée, Support, Garantie
  - [ ] Bouton "Commander maintenant" → Contact

#### Backoffice: Gestion des services
- [ ] Aller à `/services` (depuis Admin)
- [ ] Créer nouveau service
- [ ] Modifier service existant
- [ ] Supprimer service
- [ ] Upload image
- [ ] Ajouter caractéristiques

---

### 4. **SOLUTIONS (Mokine, MokineVeto, etc.)**

#### Frontend: `/solutions`
- [ ] Afficher la grille des solutions
- [ ] Cliquer sur "Découvrir"
- [ ] Modale s'ouvre avec:
  - [ ] Image
  - [ ] Catégorie
  - [ ] Nom et description
  - [ ] Tous les avantages
  - [ ] Toutes les caractéristiques
  - [ ] Infos: Public cible, Innovation, Support
  - [ ] **Sections additionnelles** (si disponibles):
    - [ ] Tarification
    - [ ] Modules
    - [ ] Utilisateurs
  - [ ] Bouton "Découvrir plus" → Contact

#### Backoffice: Gestion des solutions
- [ ] Créer nouvelle solution
- [ ] Ajouter: Nom, Description, Avantages, Features
- [ ] Optionnel: Pricing, Modules, Users info
- [ ] Modifier solution existante
- [ ] Supprimer solution

---

### 5. **FOOTER**

#### Frontend: Tous les pages
- [ ] Voir le footer avec 5 colonnes:
  1. Brand (Logo, Slogan, Description)
  2. Services (4 liens)
  3. Solutions (3 liens)
  4. **Entreprise** ✅ (Actualités, Offres d'emploi, À propos, Équipe)
  5. Contact (Téléphone, Email, Adresse)
- [ ] Tous les liens fonctionnent
- [ ] Lien "Actualités" → `/news`
- [ ] Lien "Offres d'emploi" → `/careers`

---

### 6. **AUTHENTIFICATION BACKOFFICE**

#### Login: `/login`
- [ ] Page login visible
- [ ] Email: `admin@trugroup.cm`
- [ ] Mot de passe: `TRU2024!`
- [ ] Se connecter
- [ ] Redirection vers Dashboard
- [ ] Voir le nom utilisateur en haut
- [ ] Cliquer sur Logout
- [ ] Redirection vers Login

---

### 7. **EMAIL / SMS (À DÉBOGUER)**

#### Contact Frontend: `/contact`
- [ ] Formulaire visible
- [ ] Envoyer un message
- [ ] Voir le message dans backoffice `/contacts`
- [ ] **PROBLÈME**: Emails ne sont pas envoyés
  - [ ] Vérifier EmailJS template (template_contact_reply)
  - [ ] Vérifier service ID dans EmailJS dashboard
  - [ ] Test dans console F12

---

## 🔍 Vérifications de données

### Vérifier les données de test

#### Créer des actualités:
```
Titre: "Lancement de Mokine V2"
Description: "Nouvelle version avec interface améliorée"
Contenu: "Description détaillée..."
Catégorie: "Produit"
Image: [Télécharger]
```

#### Créer des offres d'emploi:
```
Titre: "Développeur React Senior"
Localisation: "Douala, Cameroun"
Type: "CDI"
Salaire: "800k - 1.2M XAF"
Département: "Développement"
Profil: "3+ ans React, TypeScript..."
```

#### Candidatures de test:
Postulerez à une offre:
```
Nom: "Test User"
Email: "test@example.com"
Téléphone: "+237 6XX XXX XXX"
Lettre: "Je suis intéressé par ce poste..."
```

---

## 🐛 Problèmes connus

### 1. Email/SMS ne sont pas reçus
- **Status**: 🔴 NON RÉSOLU
- **Cause**: EmailJS configuration ou template missing
- **Solution**: 
  1. Vérifier dans EmailJS dashboard
  2. Vérifier template_contact_reply
  3. Check browser console (F12) pour erreurs

### 2. Images ne s'affichent pas
- **Solution**: Vérifier URL de l'image dans browser console

---

## ✨ Fonctionnalités terminées

- ✅ Authentification backoffice
- ✅ Gestion complète des actualités
- ✅ Gestion complète des offres d'emploi
- ✅ Gestion complète des candidatures
- ✅ Modales détaillées pour Services
- ✅ Modales détaillées pour Solutions
- ✅ Footer avec liens News/Careers
- ✅ Navigation au clavier (flèches, Échap)
- ✅ Animations fluides avec Framer Motion
- ✅ Design responsif

---

## 📊 Checklist finale

- [ ] Tous les modules testés
- [ ] Aucune erreur console (F12)
- [ ] Tous les formulaires fonctionnent
- [ ] Navigation fluide
- [ ] Responsive sur mobile/tablet/desktop
- [ ] Animations fluides
- [ ] Images chargent correctement
- [ ] Email/SMS débuggé et résolu

---

**Dernière mise à jour**: 9 Décembre 2025
