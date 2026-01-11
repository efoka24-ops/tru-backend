import useStore from '../store/useStore';

/**
 * Hook that wraps store actions
 * Used by backoffice to interact with data without backend
 */
export const useData = () => {
  const store = useStore();

  return {
    // Read data
    team: store.team,
    services: store.services,
    solutions: store.solutions,
    testimonials: store.testimonials,
    contacts: store.contacts,
    news: store.news,
    jobs: store.jobs,
    applications: store.applications,
    projects: store.projects,
    settings: store.settings,

    // Team CRUD
    addTeamMember: store.addTeamMember,
    updateTeamMember: store.updateTeamMember,
    deleteTeamMember: store.deleteTeamMember,

    // Services CRUD
    addService: store.addService,
    updateService: store.updateService,
    deleteService: store.deleteService,

    // Solutions CRUD
    addSolution: store.addSolution,
    updateSolution: store.updateSolution,
    deleteSolution: store.deleteSolution,

    // Testimonials CRUD
    addTestimonial: store.addTestimonial,
    updateTestimonial: store.updateTestimonial,
    deleteTestimonial: store.deleteTestimonial,

    // Contacts CRUD
    addContact: store.addContact,
    deleteContact: store.deleteContact,

    // News CRUD
    addNews: store.addNews,
    updateNews: store.updateNews,
    deleteNews: store.deleteNews,

    // Jobs CRUD
    addJob: store.addJob,
    updateJob: store.updateJob,
    deleteJob: store.deleteJob,

    // Applications CRUD
    addApplication: store.addApplication,
    deleteApplication: store.deleteApplication,

    // Projects CRUD
    addProject: store.addProject,
    updateProject: store.updateProject,
    deleteProject: store.deleteProject,

    // Settings
    updateSettings: store.updateSettings,

    // Utils
    resetToDefault: store.resetToDefault,
    exportData: store.exportData,
    importData: store.importData,
  };
};

export default useData;
