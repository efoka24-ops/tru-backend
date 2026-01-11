# 🎯 Nouvelle Architecture: Backoffice avec localStorage

## Vue d'ensemble

Le backoffice **n'appelle plus le backend**, il utilise plutôt un **état global (Zustand)** persisté dans **localStorage**:

```
Backoffice → Zustand Store → localStorage
                    ↓
              Frontend (lire les données)
```

## Avantages

✅ **Pas de connexion réseau** requis pour le backoffice  
✅ **Données persistent** au refresh du navigateur  
✅ **Frontend & Backoffice synchronisés** automatiquement  
✅ **Simple et léger** (~5-10MB de données)  
✅ **Pas de backend à maintenir** pour le backoffice  

## Comment utiliser dans le Backoffice

### Exemple 1: Afficher la liste des équipes

```jsx
import useData from '@/hooks/useData';

function TeamList() {
  const { team } = useData();
  
  return (
    <div>
      {team.map(member => (
        <div key={member.id}>{member.name}</div>
      ))}
    </div>
  );
}
```

### Exemple 2: Ajouter un membre équipe

```jsx
import useData from '@/hooks/useData';

function AddTeamForm() {
  const { addTeamMember } = useData();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ajouter au store (=localStorage)
    addTeamMember({
      name: "John Doe",
      title: "Developer",
      email: "john@example.com",
      // ...autres champs
    });
    
    // ✅ Données sauvegardées automatiquement
    // ✅ Frontend mis à jour automatiquement
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Exemple 3: Modifier un membre

```jsx
const { updateTeamMember } = useData();

updateTeamMember(1, {
  name: "Jane Doe",
  title: "Senior Developer"
});
```

### Exemple 4: Supprimer un membre

```jsx
const { deleteTeamMember } = useData();

deleteTeamMember(1);
```

## API Complète

### Team
- `team` - Array de tous les membres
- `addTeamMember(member)` - Ajouter un membre
- `updateTeamMember(id, updatedMember)` - Modifier un membre
- `deleteTeamMember(id)` - Supprimer un membre

### Services
- `services` - Array de tous les services
- `addService(service)` - Ajouter
- `updateService(id, updatedService)` - Modifier
- `deleteService(id)` - Supprimer

### Solutions
- `solutions` - Array
- `addSolution(solution)` - Ajouter
- `updateSolution(id, updatedSolution)` - Modifier
- `deleteSolution(id)` - Supprimer

### Testimonials
- `testimonials` - Array
- `addTestimonial(testimonial)` - Ajouter
- `updateTestimonial(id, updatedTestimonial)` - Modifier
- `deleteTestimonial(id)` - Supprimer

### Contacts
- `contacts` - Array
- `addContact(contact)` - Ajouter
- `deleteContact(id)` - Supprimer

### News
- `news` - Array
- `addNews(news)` - Ajouter
- `updateNews(id, updatedNews)` - Modifier
- `deleteNews(id)` - Supprimer

### Jobs
- `jobs` - Array
- `addJob(job)` - Ajouter
- `updateJob(id, updatedJob)` - Modifier
- `deleteJob(id)` - Supprimer

### Applications
- `applications` - Array
- `addApplication(application)` - Ajouter
- `deleteApplication(id)` - Supprimer

### Projects
- `projects` - Array
- `addProject(project)` - Ajouter
- `updateProject(id, updatedProject)` - Modifier
- `deleteProject(id)` - Supprimer

### Settings
- `settings` - Object
- `updateSettings(newSettings)` - Mettre à jour les paramètres

### Utilitaires
- `resetToDefault()` - Réinitialiser à data.example.json
- `exportData()` - Exporter les données (backup)
- `importData(data)` - Importer les données (restore)

## Où sont les données stockées?

Côté client (navigateur):
```
localStorage['tru-app-store']
```

## Limitations

⚠️ **localStorage a une limite** de ~5-10MB par domaine  
⚠️ **Données ne sont que dans CE navigateur** (pas synchronisé entre utilisateurs)  
⚠️ **Au clear cache** = données perdues (mais utiliser export/import pour backup)  

## Workflow complet

### Première visite
1. App charge `data.example.json`
2. Zustand initialise le store
3. localStorage sauvegarde automatiquement

### Modification dans le Backoffice
1. Utilisateur clique "Ajouter équipe"
2. `addTeamMember()` met à jour Zustand
3. localStorage synchronise AUTOMATIQUEMENT
4. Frontend recharge les données du store
5. Changement visible partout ✅

### Refresh du navigateur
1. Page recharge
2. Zustand relit depuis localStorage
3. Même données qu'avant le refresh ✅

### Reset complet
```jsx
const { resetToDefault } = useData();
resetToDefault(); // ↺ Revenir à data.example.json
```

### Backup/Restore
```jsx
const { exportData, importData } = useData();

// Exporter
const backup = exportData();
localStorage.setItem('my-backup', JSON.stringify(backup));

// Restaurer
const savedBackup = JSON.parse(localStorage.getItem('my-backup'));
importData(savedBackup);
```

## Prochaines étapes

1. **Installer Zustand**: `npm install`
2. **Mettre à jour le Backoffice** pour utiliser `useData()` au lieu des API
3. **Tester** avec les 3 modifications:
   - Ajouter → refresh → vérifier les données persisten
   - Modifier → frontend se met à jour automatiquement
   - Supprimer → pas d'appel API

---

**Besoin d'aide?** Les changements du backoffice sont simples: remplace `fetch()` par `useData()` !
