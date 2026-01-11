import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import initialData from '../../../backend/data.example.json';

/**
 * Global state store with localStorage persistence
 * Backoffice & Frontend share the same state
 */
const useStore = create(
  persist(
    (set, get) => ({
      // Initial state from data.example.json
      team: initialData.team || [],
      services: initialData.services || [],
      solutions: initialData.solutions || [],
      testimonials: initialData.testimonials || [],
      contacts: initialData.contacts || [],
      news: initialData.news || [],
      jobs: initialData.jobs || [],
      applications: initialData.applications || [],
      projects: initialData.projects || [],
      settings: initialData.settings || {},

      // ===== TEAM ACTIONS =====
      addTeamMember: (member) => {
        set((state) => ({
          team: [...state.team, { ...member, id: Math.max(...state.team.map(m => m.id), 0) + 1 }],
        }));
      },

      updateTeamMember: (id, updatedMember) => {
        set((state) => ({
          team: state.team.map((member) =>
            member.id === id ? { ...member, ...updatedMember } : member
          ),
        }));
      },

      deleteTeamMember: (id) => {
        set((state) => ({
          team: state.team.filter((member) => member.id !== id),
        }));
      },

      // ===== SERVICES ACTIONS =====
      addService: (service) => {
        set((state) => ({
          services: [...state.services, { ...service, id: Math.max(...state.services.map(s => s.id), 0) + 1 }],
        }));
      },

      updateService: (id, updatedService) => {
        set((state) => ({
          services: state.services.map((service) =>
            service.id === id ? { ...service, ...updatedService } : service
          ),
        }));
      },

      deleteService: (id) => {
        set((state) => ({
          services: state.services.filter((service) => service.id !== id),
        }));
      },

      // ===== SOLUTIONS ACTIONS =====
      addSolution: (solution) => {
        set((state) => ({
          solutions: [...state.solutions, { ...solution, id: Math.max(...state.solutions.map(s => s.id), 0) + 1 }],
        }));
      },

      updateSolution: (id, updatedSolution) => {
        set((state) => ({
          solutions: state.solutions.map((solution) =>
            solution.id === id ? { ...solution, ...updatedSolution } : solution
          ),
        }));
      },

      deleteSolution: (id) => {
        set((state) => ({
          solutions: state.solutions.filter((solution) => solution.id !== id),
        }));
      },

      // ===== TESTIMONIALS ACTIONS =====
      addTestimonial: (testimonial) => {
        set((state) => ({
          testimonials: [...state.testimonials, { ...testimonial, id: Math.max(...state.testimonials.map(t => t.id), 0) + 1, createdAt: new Date().toISOString() }],
        }));
      },

      updateTestimonial: (id, updatedTestimonial) => {
        set((state) => ({
          testimonials: state.testimonials.map((testimonial) =>
            testimonial.id === id ? { ...testimonial, ...updatedTestimonial } : testimonial
          ),
        }));
      },

      deleteTestimonial: (id) => {
        set((state) => ({
          testimonials: state.testimonials.filter((testimonial) => testimonial.id !== id),
        }));
      },

      // ===== CONTACTS ACTIONS =====
      addContact: (contact) => {
        set((state) => ({
          contacts: [...state.contacts, { ...contact, id: Math.max(...state.contacts.map(c => c.id), 0) + 1, createdAt: new Date().toISOString() }],
        }));
      },

      deleteContact: (id) => {
        set((state) => ({
          contacts: state.contacts.filter((contact) => contact.id !== id),
        }));
      },

      // ===== NEWS ACTIONS =====
      addNews: (news) => {
        set((state) => ({
          news: [...state.news, { ...news, id: Math.max(...state.news.map(n => n.id), 0) + 1, createdAt: new Date().toISOString() }],
        }));
      },

      updateNews: (id, updatedNews) => {
        set((state) => ({
          news: state.news.map((item) =>
            item.id === id ? { ...item, ...updatedNews } : item
          ),
        }));
      },

      deleteNews: (id) => {
        set((state) => ({
          news: state.news.filter((item) => item.id !== id),
        }));
      },

      // ===== JOBS ACTIONS =====
      addJob: (job) => {
        set((state) => ({
          jobs: [...state.jobs, { ...job, id: Math.max(...state.jobs.map(j => j.id), 0) + 1, createdAt: new Date().toISOString() }],
        }));
      },

      updateJob: (id, updatedJob) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id ? { ...job, ...updatedJob } : job
          ),
        }));
      },

      deleteJob: (id) => {
        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== id),
        }));
      },

      // ===== APPLICATIONS ACTIONS =====
      addApplication: (application) => {
        set((state) => ({
          applications: [...state.applications, { ...application, id: Math.max(...state.applications.map(a => a.id), 0) + 1, createdAt: new Date().toISOString() }],
        }));
      },

      deleteApplication: (id) => {
        set((state) => ({
          applications: state.applications.filter((application) => application.id !== id),
        }));
      },

      // ===== PROJECTS ACTIONS =====
      addProject: (project) => {
        set((state) => ({
          projects: [...state.projects, { ...project, id: Math.max(...state.projects.map(p => p.id), 0) + 1, createdAt: new Date().toISOString() }],
        }));
      },

      updateProject: (id, updatedProject) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updatedProject } : project
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        }));
      },

      // ===== SETTINGS ACTIONS =====
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      // ===== RESET ACTIONS =====
      resetToDefault: () => {
        set({
          team: initialData.team || [],
          services: initialData.services || [],
          solutions: initialData.solutions || [],
          testimonials: initialData.testimonials || [],
          contacts: initialData.contacts || [],
          news: initialData.news || [],
          jobs: initialData.jobs || [],
          applications: initialData.applications || [],
          projects: initialData.projects || [],
          settings: initialData.settings || {},
        });
      },

      // Export/Import for backup
      exportData: () => {
        const state = get();
        return {
          team: state.team,
          services: state.services,
          solutions: state.solutions,
          testimonials: state.testimonials,
          contacts: state.contacts,
          news: state.news,
          jobs: state.jobs,
          applications: state.applications,
          projects: state.projects,
          settings: state.settings,
        };
      },

      importData: (data) => {
        set({
          team: data.team || [],
          services: data.services || [],
          solutions: data.solutions || [],
          testimonials: data.testimonials || [],
          contacts: data.contacts || [],
          news: data.news || [],
          jobs: data.jobs || [],
          applications: data.applications || [],
          projects: data.projects || [],
          settings: data.settings || {},
        });
      },
    }),
    {
      name: 'tru-app-store', // localStorage key
      version: 1,
    }
  )
);

export default useStore;
