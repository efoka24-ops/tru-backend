/**
 * Migration script: Migrate data from data.json to PostgreSQL
 * Run this once to initialize the database with existing data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, 'data.json');

async function migrateData() {
  try {
    console.log('🔄 Starting data migration from data.json to PostgreSQL...\n');

    // Read data.json
    if (!fs.existsSync(dataPath)) {
      console.log('⚠️ data.json not found, skipping migration');
      return;
    }

    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);

    console.log('📊 Loaded data from data.json');

    // Initialize database (create tables)
    await db.initializeDatabase();

    // Migrate Team
    if (data.team && Array.isArray(data.team)) {
      console.log('\n👥 Migrating team members...');
      for (const member of data.team) {
        try {
          await db.createTeamMember({
            name: member.name,
            title: member.title,
            bio: member.bio,
            image: member.image,
            email: member.email,
            phone: member.phone,
            specialties: member.specialties || [],
            certifications: member.certifications || [],
            linked_in: member.linked_in,
            is_founder: member.is_founder || false
          });
        } catch (error) {
          console.warn(`⚠️ Skipped team member ${member.name}:`, error.message);
        }
      }
      console.log(`✅ Migrated ${data.team.length} team members`);
    }

    // Migrate Testimonials
    if (data.testimonials && Array.isArray(data.testimonials)) {
      console.log('\n💬 Migrating testimonials...');
      for (const testimonial of data.testimonials) {
        try {
          await db.createTestimonial({
            name: testimonial.name,
            title: testimonial.title,
            company: testimonial.company,
            testimonial: testimonial.testimonial,
            rating: testimonial.rating,
            image: testimonial.image
          });
        } catch (error) {
          console.warn(`⚠️ Skipped testimonial:`, error.message);
        }
      }
      console.log(`✅ Migrated ${data.testimonials.length} testimonials`);
    }

    // Migrate News
    if (data.news && Array.isArray(data.news)) {
      console.log('\n📰 Migrating news...');
      for (const news of data.news) {
        try {
          await db.createNews({
            title: news.title,
            description: news.description,
            content: news.content || '',
            category: news.category,
            image: news.image,
            date: news.date
          });
        } catch (error) {
          console.warn(`⚠️ Skipped news ${news.title}:`, error.message);
        }
      }
      console.log(`✅ Migrated ${data.news.length} news articles`);
    }

    // Migrate Solutions
    if (data.solutions && Array.isArray(data.solutions)) {
      console.log('\n💡 Migrating solutions...');
      for (const solution of data.solutions) {
        try {
          await db.createSolution({
            name: solution.name,
            description: solution.description,
            category: solution.category,
            image: solution.image,
            benefits: solution.benefits || [],
            features: solution.features || []
          });
        } catch (error) {
          console.warn(`⚠️ Skipped solution ${solution.name}:`, error.message);
        }
      }
      console.log(`✅ Migrated ${data.solutions.length} solutions`);
    }

    // Migrate Jobs
    if (data.jobs && Array.isArray(data.jobs)) {
      console.log('\n💼 Migrating jobs...');
      for (const job of data.jobs) {
        try {
          await db.createJob({
            title: job.title,
            description: job.description,
            location: job.location,
            type: job.type,
            department: job.department,
            requirements: job.requirements,
            salary_range: job.salary_range
          });
        } catch (error) {
          console.warn(`⚠️ Skipped job ${job.title}:`, error.message);
        }
      }
      console.log(`✅ Migrated ${data.jobs.length} jobs`);
    }

    // Migrate Applications
    if (data.applications && Array.isArray(data.applications)) {
      console.log('\n📝 Migrating applications...');
      for (const app of data.applications) {
        try {
          await db.createApplication({
            job_id: app.jobId,
            job_title: app.jobTitle,
            full_name: app.fullName,
            email: app.email,
            phone: app.phone,
            linkedin: app.linkedin,
            cover_letter: app.coverLetter,
            resume: app.resume
          });
        } catch (error) {
          console.warn(`⚠️ Skipped application:`, error.message);
        }
      }
      console.log(`✅ Migrated ${data.applications.length} applications`);
    }

    // Migrate Contacts
    if (data.contacts && Array.isArray(data.contacts)) {
      console.log('\n📧 Migrating contacts...');
      for (const contact of data.contacts) {
        try {
          await db.createContact({
            full_name: contact.fullName,
            email: contact.email,
            phone: contact.phone,
            subject: contact.subject,
            message: contact.message
          });
        } catch (error) {
          console.warn(`⚠️ Skipped contact:`, error.message);
        }
      }
      console.log(`✅ Migrated ${data.contacts.length} contacts`);
    }

    // Migrate Settings
    if (data.settings) {
      console.log('\n⚙️ Migrating settings...');
      try {
        await db.updateSettings({
          site_title: data.settings.siteTitle,
          slogan: data.settings.slogan,
          tagline: data.settings.tagline,
          email: data.settings.email,
          phone: data.settings.phone,
          address: data.settings.address,
          facebook: data.settings.socialMedia?.facebook || '',
          twitter: data.settings.socialMedia?.twitter || '',
          linkedin: data.settings.socialMedia?.linkedin || '',
          instagram: data.settings.socialMedia?.instagram || '',
          primary_color: data.settings.primaryColor,
          description: data.settings.description,
          business_hours: data.settings.businessHours,
          maintenance_mode: data.settings.maintenanceMode
        });
        console.log('✅ Settings migrated');
      } catch (error) {
        console.warn('⚠️ Skipped settings:', error.message);
      }
    }

    // Migrate Services
    if (data.services && Array.isArray(data.services)) {
      console.log('\n🔧 Migrating services...');
      for (const service of data.services) {
        try {
          await db.createService({
            name: service.name,
            description: service.description,
            price: service.price,
            category: service.category
          });
        } catch (error) {
          console.warn(`⚠️ Skipped service ${service.name}:`, error.message);
        }
      }
      console.log(`✅ Migrated ${data.services.length} services`);
    }

    console.log('\n✅ ✅ ✅ MIGRATION COMPLETED SUCCESSFULLY! ✅ ✅ ✅\n');
    console.log('🎉 All data has been migrated to PostgreSQL');
    console.log('📌 You can now remove or archive data.json if desired');

  } catch (error) {
    console.error('\n❌ Migration error:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();
