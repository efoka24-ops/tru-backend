# 📋 GUIDE DES PARAMÈTRES - TRU GROUP

## Vue d'ensemble
La page **Paramètres** vous permet de configurer tous les aspects de votre site TRU GROUP sans modifier le code. Tous les changements sont enregistrés dans la base de données et appliqués automatiquement.

---

## 🎯 ONGLETS DISPONIBLES

### 1. 📱 GÉNÉRAL
Configure les informations de base de votre site.

**Champs:**
- **Titre du site*** - Nom principal affiché partout (ex: "TRU GROUP")
- **Slogan** - Tagline court (ex: "Transforming Reality Universally")
- **Tagline** - Description d'une ligne (ex: "Cabinet de conseil en digitalisation")
- **Description générale** - Texte long pour présenter l'entreprise (utilisé dans meta tags)

**Utilisation:**
- Le titre s'affiche dans le header, footer, et onglet navigateur
- Le slogan apparaît sur la page d'accueil
- La description est utilisée pour le SEO

---

### 2. 📞 COORDONNÉES
Gère les informations de contact affichées partout sur le site.

**Champs:**
- **Email*** - Adresse email principale (ex: "contact@trugroup.cm")
  - Utilisée pour les formulaires de contact
  - Affichée dans le footer
- **Téléphone** - Numéro à contacter (ex: "+237 6 XX XX XX XX")
  - Affichée dans le footer et page de contact
- **Adresse** - Localisation physique (ex: "Douala, Cameroun")
  - Affichée dans le footer et page de contact

**Où s'affichent-ils:**
- ✅ Header (header en haut)
- ✅ Footer (en bas de page)
- ✅ Page Contact
- ✅ Formulaires

---

### 3. 🌐 RÉSEAUX SOCIAUX
Configurez vos profils sur les réseaux sociaux.

**Champs supportés:**
- 👍 **Facebook** - URL de votre page Facebook
- 𝕏 **X (Twitter)** - URL de votre profil Twitter/X
- 💼 **LinkedIn** - URL de votre page LinkedIn
- 📸 **Instagram** - URL de votre profil Instagram
- 💬 **WhatsApp** - URL WhatsApp pour contact direct

**Comment ça marche:**
- Laissez vide pour désactiver un réseau
- Les icônes s'affichent dans le footer
- Clic sur l'icône redirige vers votre profil

**Format des URLs:**
```
Facebook:  https://facebook.com/trugroup
Twitter:   https://twitter.com/trugroup
LinkedIn:  https://linkedin.com/company/trugroup
Instagram: https://instagram.com/trugroup
WhatsApp:  https://wa.me/237XXXXXXXXX (numéro sans +)
```

---

### 4. 🎨 DESIGN
Personnalisez les couleurs du site.

**Couleurs:**
1. **Couleur primaire** (#10b981)
   - Couleur dominante du site
   - Utilisée pour boutons, headers, accents
   - Défaut: Vert émeraude

2. **Couleur secondaire** (#0d9488)
   - Couleur complémentaire
   - Utilisée pour hover, secondaires
   - Défaut: Teal

3. **Couleur d'accent** (#64748b)
   - Couleur pour détails
   - Utilisée pour textes, bordures
   - Défaut: Gris ardoise

**Comment modifier:**
1. Cliquez sur la palette de couleur
2. Choisissez une couleur
3. Ou entrez le code HEX directement (ex: #FF5733)
4. Les couleurs changent en temps réel sur tout le site

**Codes HEX utiles:**
```
Vert:      #10b981, #22c55e, #16a34a
Teal:      #0d9488, #14b8a6, #06b6d4
Bleu:      #2563eb, #0284c7, #3b82f6
Rose:      #ec4899, #db2777, #f43f5e
Gris:      #64748b, #475569, #1f2937
```

---

### 5. ⏰ HORAIRES
Définissez les horaires de fonctionnement.

**Format:**
- Normal: `HH:MM - HH:MM` (ex: "09:00 - 18:00")
- Fermé: Écrivez simplement "Fermé"
- Plusieurs tranches: Vous pouvez ajouter des pauses

**Exemple:**
```
Lundi:    09:00 - 18:00
Mardi:    09:00 - 18:00
Mercredi: 09:00 - 13:00 / 14:00 - 18:00  (avec pause)
Jeudi:    09:00 - 18:00
Vendredi: 09:00 - 17:00
Samedi:   10:00 - 16:00
Dimanche: Fermé
```

**Où s'affichent les horaires:**
- ✅ Page Contact
- ✅ Footer (section infos)
- ✅ Popups disponibilité

---

### 6. 🔧 MAINTENANCE
Contrôlez le mode maintenance du site.

**Mode Maintenance:**
- **Activé** - Le site affiche un message aux visiteurs
- **Désactivé** - Le site fonctionne normalement (défaut)

**Configuration:**
1. Cochez "Mode maintenance"
2. Entrez votre message personnalisé
3. Enregistrez

**Message par défaut:**
```
Site en maintenance. Nous revenons bientôt!
```

**Quand utiliser:**
- 🔄 Mises à jour importantes
- 🚀 Lancement de nouvelles features
- 🛠️ Migrations de données
- 🔒 Problèmes de sécurité

**Ce qui se passe en mode maintenance:**
- ✅ Visitors voient un écran statique
- ✅ Votre message s'affiche
- ✅ Formulaires sont désactivés
- ✅ L'admin peut toujours accéder au backoffice

---

## 💾 COMMENT ENREGISTRER

1. **Modifiez** les champs que vous voulez
2. **Cliquez** sur "Enregistrer les modifications"
3. **Attendez** la confirmation (message vert)
4. Les changements s'appliquent **instantanément** partout

### Boutons d'action:
- 🔄 **Réinitialiser** - Annule vos changements non enregistrés
- 💾 **Enregistrer** - Sauve tout et applique les changements

---

## ✅ CHAMPS OBLIGATOIRES

Les champs marqués avec * sont obligatoires:
- ✅ **Titre du site** - Doit être rempli
- ✅ **Email** - Doit être une adresse valide

Si vous essayez d'enregistrer sans ces champs, vous verrez une erreur.

---

## 🔍 CONSEILS ET BONNES PRATIQUES

### Email
- ✅ Utilisez un email valide (pour les formulaires de contact)
- ❌ Évitez les typos
- 💡 Utilisez un alias (contact@, info@, etc.)

### Téléphone
- ✅ Incluez l'indicatif pays (+237 pour le Cameroun)
- ✅ Format standard: +237 6 XX XX XX XX
- 💡 Testez le lien WhatsApp après sauvegarde

### Horaires
- ✅ Utilisez format 24h (09:00, 18:00)
- ✅ Séparez par " - " (tiret entouré d'espaces)
- ✅ "Fermé" pour jours non-travaillés

### Réseaux Sociaux
- ✅ Copiez les URL complètes depuis chaque plateforme
- ✅ Laissez vide pour masquer une plateforme
- ✅ Testez les liens après sauvegarde

### Couleurs
- ✅ Utilisez des codes HEX valides (#RRGGBB)
- ✅ Testez le contraste (texte lisible)
- ✅ Maintenez une cohérence visuelle
- ✅ Respectez la charte graphique TRU GROUP

---

## 📊 STRUCTURE DES DONNÉES

Les paramètres sont stockés comme ceci:

```json
{
  "id": 1,
  "siteTitle": "TRU GROUP",
  "slogan": "Transforming Reality Universally",
  "tagline": "Cabinet de conseil en digitalisation",
  "description": "...",
  "email": "contact@trugroup.cm",
  "phone": "+237 6 XX XX XX XX",
  "address": "Douala, Cameroun",
  "socialMedia": {
    "facebook": "https://...",
    "twitter": "https://...",
    "linkedin": "https://...",
    "instagram": "https://...",
    "whatsapp": ""
  },
  "businessHours": {
    "monday": "09:00 - 18:00",
    "tuesday": "09:00 - 18:00",
    "wednesday": "09:00 - 18:00",
    "thursday": "09:00 - 18:00",
    "friday": "09:00 - 18:00",
    "saturday": "Fermé",
    "sunday": "Fermé"
  },
  "primaryColor": "#10b981",
  "secondaryColor": "#0d9488",
  "accentColor": "#64748b",
  "maintenanceMode": false,
  "maintenanceMessage": "Site en maintenance...",
  "updatedAt": "2025-12-09T10:30:00.000Z"
}
```

---

## 🚀 IMPACT DES CHANGEMENTS

### Immédiat (sans rechargement)
- Couleurs appliquées
- Notif de succès

### Après rechargement page
- Titre, slogan, tagline
- Email, téléphone, adresse
- Réseaux sociaux
- Horaires
- Mode maintenance

### Pour les pages déjà ouvertes
- 💡 Les visiteurs doivent rafraîchir pour voir les changements
- 💡 Le backoffice met à jour automatiquement

---

## ⚠️ DÉPANNAGE

### "Erreur: Titre et Email sont obligatoires"
✅ **Solution:** Remplissez les deux champs avec des données valides

### Changements non enregistrés
✅ **Solution:** 
1. Vérifiez la connexion internet
2. Regardez la console (F12) pour les erreurs
3. Recharchez la page et réessayez

### Couleurs ne changent pas
✅ **Solution:**
1. Entrez un code HEX valide (#RRGGBB)
2. Cliquez sur "Enregistrer"
3. Recharchez le site public (Ctrl+Shift+R)

### Réseaux sociaux ne s'affichent pas
✅ **Solution:**
1. Vérifiez les URLs (commencent par https://)
2. Assurez-vous qu'elles sont complètes
3. Testez en cliquant sur l'icône

---

## 📚 RESSOURCES

- **API Endpoint:** `POST/GET /api/settings`
- **Fichier données:** `backend/data.json`
- **Page frontoffice:** `src/pages/` (utilise les settings)
- **Backoffice:** `backoffice/src/pages/SettingsPage.jsx`

---

## 🎓 EXEMPLE COMPLET

Voici comment configurer complètement votre site:

### 1. Informations de base
```
Titre: TRU GROUP
Slogan: Transforming Reality Universally
Tagline: Cabinet de conseil en digitalisation
Description: Nous aidons les entreprises africaines à 
            transformer numériquement leurs processus
```

### 2. Contact
```
Email: contact@trugroup.cm
Téléphone: +237 6 XX XX XX XX
Adresse: Douala, Cameroun
```

### 3. Réseaux
```
Facebook: https://facebook.com/trugroup
LinkedIn: https://linkedin.com/company/trugroup-cameroon
Instagram: https://instagram.com/trugroup_cm
```

### 4. Design
```
Primaire:   #10b981 (vert émeraude)
Secondaire: #0d9488 (teal)
Accent:     #64748b (gris)
```

### 5. Horaires
```
Lundi-Vendredi: 09:00 - 18:00
Samedi: 10:00 - 16:00
Dimanche: Fermé
```

Enregistrez et c'est fait! 🎉

---

**Version:** 1.0.0
**Dernière mise à jour:** 9 Décembre 2025
**Support:** contact@trugroup.cm
