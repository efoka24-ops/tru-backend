/**
 * Migration Endpoint Handler
 * Provides API endpoint to migrate data.json to PostgreSQL
 * Call: POST /api/admin/migrate-data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, 'data.json');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/**
 * Migrate data from data.json to PostgreSQL
 * Called via POST /api/admin/migrate-data
 */
export async function migrateDataHandler(req, res) {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting migration from data.json to PostgreSQL...');

    // Read data.json
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ 
        error: 'data.json not found',
        status: 'FAILED'
      });
    }

    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(fileContent);

    console.log('📦 Found data.json with:');
    const summary = {
      team: data.team?.length || 0,
      testimonials: data.testimonials?.length || 0,
      services: data.services?.length || 0,
      contacts: data.contacts?.length || 0,
      news: data.news?.length || 0,
      jobs: data.jobs?.length || 0,
    };
    
    Object.entries(summary).forEach(([key, val]) => {
      console.log(`   - ${key}: ${val}`);
    });

    // Start transaction
    await client.query('BEGIN');
    const results = {};

    // Migrate Team
    if (data.team && Array.isArray(data.team)) {
      console.log('\n📝 Migrating team members...');
      let count = 0;
      for (const member of data.team) {
        try {
          await client.query(
            `INSERT INTO team (name, title, description, image, email, phone, skills, bio) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             ON CONFLICT DO NOTHING`,
            [
              member.name || 'Unknown',
              member.title || null,
              member.description || null,
              member.image || null,
              member.email || null,
              member.phone || null,
              member.skills ? JSON.stringify(member.skills) : null,
              member.bio || null
            ]
          );
          count++;
          console.log(`  ✓ ${member.name}`);
        } catch (err) {
          console.error(`  ✗ Error: ${member.name}:`, err.message);
        }
      }
      results.team = count;
    }

    // Migrate Testimonials
    if (data.testimonials && Array.isArray(data.testimonials)) {
      console.log('\n💬 Migrating testimonials...');
      let count = 0;
      for (const testimonial of data.testimonials) {
        try {
          await client.query(
            `INSERT INTO testimonials (name, title, message, rating, image, company) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             ON CONFLICT DO NOTHING`,
            [
              testimonial.name || 'Anonymous',
              testimonial.title || null,
              testimonial.testimonial || testimonial.message || null,
              testimonial.rating || null,
              testimonial.image || null,
              testimonial.company || null
            ]
          );
          count++;
          console.log(`  ✓ ${testimonial.name}`);
        } catch (err) {
          console.error(`  ✗ Error:`, err.message);
        }
      }
      results.testimonials = count;
    }

    // Migrate Services
    if (data.services && Array.isArray(data.services)) {
      console.log('\n⚙️ Migrating services...');
      let count = 0;
      for (const service of data.services) {
        try {
          await client.query(
            `INSERT INTO services (name, description, icon, features) 
             VALUES ($1, $2, $3, $4) 
             ON CONFLICT DO NOTHING`,
            [
              service.name || 'Service',
              service.description || null,
              service.icon || null,
              service.features ? JSON.stringify(service.features) : null
            ]
          );
          count++;
          console.log(`  ✓ ${service.name}`);
        } catch (err) {
          console.error(`  ✗ Error:`, err.message);
        }
      }
      results.services = count;
    }

    // Migrate Settings
    if (data.settings) {
      console.log('\n⚙️ Migrating settings...');
      try {
        const settings = data.settings;
        await client.query(
          `INSERT INTO settings (id, site_title, slogan, tagline, email, phone, address, description, social_media, business_hours, primary_color, secondary_color, accent_color, maintenance_mode, maintenance_message)
           VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (id) DO UPDATE SET
             site_title = $1, slogan = $2, tagline = $3, email = $4, phone = $5,
             address = $6, description = $7, social_media = $8, business_hours = $9,
             primary_color = $10, secondary_color = $11, accent_color = $12,
             maintenance_mode = $13, maintenance_message = $14`,
          [
            settings.siteTitle || 'TRU GROUP',
            settings.slogan || null,
            settings.tagline || null,
            settings.email || null,
            settings.phone || null,
            settings.address || null,
            settings.description || null,
            settings.socialMedia ? JSON.stringify(settings.socialMedia) : '{}',
            settings.businessHours ? JSON.stringify(settings.businessHours) : '{}',
            settings.primaryColor || '#10b981',
            settings.secondaryColor || '#0d9488',
            settings.accentColor || '#64748b',
            settings.maintenanceMode || false,
            settings.maintenanceMessage || null
          ]
        );
        results.settings = 1;
        console.log('  ✓ Settings imported');
      } catch (err) {
        console.error('  ✗ Error:', err.message);
        results.settings = 0;
      }
    }

    // Migrate Contacts
    if (data.contacts && Array.isArray(data.contacts)) {
      console.log('\n📧 Migrating contacts...');
      let count = 0;
      for (const contact of data.contacts) {
        try {
          await client.query(
            `INSERT INTO contacts (name, email, phone, subject, message, read) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             ON CONFLICT DO NOTHING`,
            [
              contact.name || contact.full_name || 'Unknown',
              contact.email || null,
              contact.phone || null,
              contact.subject || null,
              contact.message || null,
              contact.read || false
            ]
          );
          count++;
          console.log(`  ✓ ${contact.name || contact.full_name}`);
        } catch (err) {
          console.error(`  ✗ Error:`, err.message);
        }
      }
      results.contacts = count;
    }

    // Migrate Jobs
    if (data.jobs && Array.isArray(data.jobs)) {
      console.log('\n💼 Migrating jobs...');
      let count = 0;
      for (const job of data.jobs) {
        try {
          await client.query(
            `INSERT INTO jobs (title, description, location, type, salary_range) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT DO NOTHING`,
            [
              job.title || 'Position',
              job.description || null,
              job.location || null,
              job.type || null,
              job.salary_range || null
            ]
          );
          count++;
          console.log(`  ✓ ${job.title}`);
        } catch (err) {
          console.error(`  ✗ Error:`, err.message);
        }
      }
      results.jobs = count;
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log('\n✅ Migration completed successfully!');

    res.json({
      status: 'SUCCESS',
      message: 'Migration completed successfully!',
      imported: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    
    res.status(500).json({
      status: 'FAILED',
      error: error.message,
      message: 'Migration failed. Check logs for details.'
    });
  } finally {
    client.release();
  }
}

export default { migrateDataHandler };
