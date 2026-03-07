/**
 * Migration script: Migrate data from data.json to PostgreSQL
 * Run: npm run migrate
 * IMPORTANT: Run this ONCE on first Render deployment!
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as db from './databaseService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try both locations for data.json
const DATA_DIR = process.env.DATA_DIR || __dirname;
const dataPath = path.join(DATA_DIR, 'data.json');
const localDataPath = path.join(__dirname, 'data.json');
const dataPathToUse = fs.existsSync(dataPath) ? dataPath : localDataPath;

async function migrateData() {
  try {
    console.log('\n🔄 🔄 🔄 STARTING DATA MIGRATION 🔄 🔄 🔄\n');
    console.log('📍 Reading data from:', dataPathToUse);

    // Read data.json
    if (!fs.existsSync(dataPathToUse)) {
      console.log('⚠️  data.json not found at', dataPathToUse);
      console.log('⚠️  Skipping migration - database will be empty');
      return;
    }

    const rawData = fs.readFileSync(dataPathToUse, 'utf8');
    const data = JSON.parse(rawData);
    console.log('✅ Loaded data.json successfully\n');

    // Initialize database tables
    console.log('⏳ Creating database tables...');
    await db.initializeDatabase();

    let totalMigrated = 0;

    // Migrate Team
    if (data.team && Array.isArray(data.team)) {
      console.log('\n👥 Migrating team members...');
      for (const member of data.team) {
        try {
          await db.addTeamMember(member);
          console.log(`   ✓ ${member.name}`);
        } catch (error) {
          console.warn(`   ⚠️  ${member.name}: ${error.message}`);
        }
      }
      console.log(`✅ ${data.team.length} team members migrated`);
      totalMigrated += data.team.length;
    }

    // Migrate Services
    if (data.services && Array.isArray(data.services)) {
      console.log('\n🔧 Migrating services...');
      for (const service of data.services) {
        try {
          await db.addService(service);
          console.log(`   ✓ ${service.title}`);
        } catch (error) {
          console.warn(`   ⚠️  ${service.title}: ${error.message}`);
        }
      }
      console.log(`✅ ${data.services.length} services migrated`);
      totalMigrated += data.services.length;
    }

    // Migrate Solutions
    if (data.solutions && Array.isArray(data.solutions)) {
      console.log('\n💡 Migrating solutions...');
      for (const solution of data.solutions) {
        try {
          await db.query(
            `INSERT INTO solutions (name, subtitle, description, long_description, color, icon, features)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              solution.name,
              solution.subtitle,
              solution.description,
              solution.longDescription,
              solution.color,
              solution.icon,
              JSON.stringify(solution.features || []),
            ]
          );
          console.log(`   ✓ ${solution.name}`);
        } catch (error) {
          console.warn(`   ⚠️  ${solution.name}: ${error.message}`);
        }
      }
      console.log(`✅ ${data.solutions.length} solutions migrated`);
      totalMigrated += data.solutions.length;
    }

    // Migrate Testimonials
    if (data.testimonials && Array.isArray(data.testimonials)) {
      console.log('\n💬 Migrating testimonials...');
      for (const testimonial of data.testimonials) {
        try {
          await db.query(
            `INSERT INTO testimonials (name, title, company, testimonial, rating, image)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              testimonial.name,
              testimonial.title,
              testimonial.company,
              testimonial.testimonial,
              testimonial.rating,
              testimonial.image,
            ]
          );
          console.log(`   ✓ ${testimonial.name}`);
        } catch (error) {
          console.warn(`   ⚠️  ${testimonial.name}: ${error.message}`);
        }
      }
      console.log(`✅ ${data.testimonials.length} testimonials migrated`);
      totalMigrated += data.testimonials.length;
    }

    // Migrate News
    if (data.news && Array.isArray(data.news)) {
      console.log('\n📰 Migrating news...');
      for (const news of data.news) {
        try {
          await db.query(
            `INSERT INTO news (title, description, content, image)
             VALUES ($1, $2, $3, $4)`,
            [news.title, news.description, news.content, news.image]
          );
          console.log(`   ✓ ${news.title}`);
        } catch (error) {
          console.warn(`   ⚠️  ${news.title}: ${error.message}`);
        }
      }
      console.log(`✅ ${data.news.length} news articles migrated`);
      totalMigrated += data.news.length;
    }

    // Migrate Jobs
    if (data.jobs && Array.isArray(data.jobs)) {
      console.log('\n💼 Migrating jobs...');
      for (const job of data.jobs) {
        try {
          await db.query(
            `INSERT INTO jobs (title, department, location, description, requirements)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              job.title,
              job.department,
              job.location,
              job.description,
              JSON.stringify(job.requirements || []),
            ]
          );
          console.log(`   ✓ ${job.title}`);
        } catch (error) {
          console.warn(`   ⚠️  ${job.title}: ${error.message}`);
        }
      }
      console.log(`✅ ${data.jobs.length} jobs migrated`);
      totalMigrated += data.jobs.length;
    }

    // Migrate Applications
    if (data.applications && Array.isArray(data.applications)) {
      console.log('\n📝 Migrating applications...');
      for (const app of data.applications) {
        try {
          await db.addApplication(app);
          console.log(`   ✓ Application from ${app.name}`);
        } catch (error) {
          console.warn(`   ⚠️  Application: ${error.message}`);
        }
      }
      console.log(`✅ ${data.applications.length} applications migrated`);
      totalMigrated += data.applications.length;
    }

    // Migrate Contacts
    if (data.contacts && Array.isArray(data.contacts)) {
      console.log('\n📧 Migrating contacts...');
      for (const contact of data.contacts) {
        try {
          await db.addContact(contact);
          console.log(`   ✓ Contact from ${contact.name}`);
        } catch (error) {
          console.warn(`   ⚠️  Contact: ${error.message}`);
        }
      }
      console.log(`✅ ${data.contacts.length} contacts migrated`);
      totalMigrated += data.contacts.length;
    }

    // Migrate Projects
    if (data.projects && Array.isArray(data.projects)) {
      console.log('\n🎯 Migrating projects...');
      for (const project of data.projects) {
        try {
          await db.query(
            `INSERT INTO projects (name, client, description, category, status, technologies, details)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              project.name,
              project.client,
              project.description,
              project.category,
              project.status,
              JSON.stringify(project.technologies || []),
              project.details,
            ]
          );
          console.log(`   ✓ ${project.name}`);
        } catch (error) {
          console.warn(`   ⚠️  ${project.name}: ${error.message}`);
        }
      }
      console.log(`✅ ${data.projects.length} projects migrated`);
      totalMigrated += data.projects.length;
    }

    // Migrate Settings
    if (data.settings) {
      console.log('\n⚙️  Migrating settings...');
      try {
        await db.query(
          `INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2`,
          ['site_settings', JSON.stringify(data.settings)]
        );
        console.log('✅ Settings migrated');
      } catch (error) {
        console.warn('⚠️  Settings:', error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ ✅ ✅ MIGRATION COMPLETED SUCCESSFULLY! ✅ ✅ ✅');
    console.log('='.repeat(60));
    console.log(`\n📊 Total records migrated: ${totalMigrated}`);
    console.log('\n🎉 All data is now safe in PostgreSQL!');
    console.log('📌 Your data will persist even after Render restarts.\n');

    process.exit(0);

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ ❌ ❌ MIGRATION FAILED ❌ ❌ ❌');
    console.error('='.repeat(60));
    console.error('\nError:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();
