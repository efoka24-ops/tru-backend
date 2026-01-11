/**
 * Database Service - Abstraction layer for PostgreSQL
 * Provides CRUD operations for all entities
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Initialize connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render
  },
});

// Log connection events
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL Pool Error:', err);
});

/**
 * Initialize database tables
 */
export async function initializeDatabase() {
  try {
    console.log('⏳ Initializing database tables...');

    // Team table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS team (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        bio TEXT,
        image TEXT,
        email VARCHAR(255),
        phone VARCHAR(20),
        linked_in VARCHAR(255),
        is_founder BOOLEAN DEFAULT false,
        specialties JSONB DEFAULT '[]'::jsonb,
        certifications JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Services table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        icon VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        features JSONB DEFAULT '[]'::jsonb,
        objective TEXT,
        color VARCHAR(100),
        image VARCHAR(1000),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Solutions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS solutions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        description TEXT,
        long_description TEXT,
        color VARCHAR(100),
        icon VARCHAR(100),
        features JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Contacts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        subject VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Testimonials table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        company VARCHAR(255),
        testimonial TEXT,
        rating INT,
        image VARCHAR(1000),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // News table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content TEXT,
        image VARCHAR(1000),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Jobs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        department VARCHAR(255),
        location VARCHAR(255),
        description TEXT,
        requirements JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Applications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        job_id INT,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Projects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        client VARCHAR(255),
        description TEXT,
        category VARCHAR(100),
        status VARCHAR(50),
        technologies JSONB DEFAULT '[]'::jsonb,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

/**
 * Execute a query
 */
export async function query(text, params = []) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
}

/**
 * Get Team Members
 */
export async function getTeam() {
  const result = await query('SELECT * FROM team ORDER BY id');
  return result.rows;
}

/**
 * Get Services
 */
export async function getServices() {
  const result = await query('SELECT * FROM services ORDER BY id');
  return result.rows;
}

/**
 * Get Solutions
 */
export async function getSolutions() {
  const result = await query('SELECT * FROM solutions ORDER BY id');
  return result.rows;
}

/**
 * Get Testimonials
 */
export async function getTestimonials() {
  const result = await query('SELECT * FROM testimonials ORDER BY id');
  return result.rows;
}

/**
 * Get News
 */
export async function getNews() {
  const result = await query('SELECT * FROM news ORDER BY id DESC');
  return result.rows;
}

/**
 * Get Jobs
 */
export async function getJobs() {
  const result = await query('SELECT * FROM jobs ORDER BY id DESC');
  return result.rows;
}

/**
 * Get Contacts
 */
export async function getContacts() {
  const result = await query('SELECT * FROM contacts ORDER BY id DESC');
  return result.rows;
}

/**
 * Get Applications
 */
export async function getApplications() {
  const result = await query('SELECT * FROM applications ORDER BY id DESC');
  return result.rows;
}

/**
 * Get Projects
 */
export async function getProjects() {
  const result = await query('SELECT * FROM projects ORDER BY id DESC');
  return result.rows;
}

/**
 * Get Settings
 */
export async function getSettings() {
  const result = await query('SELECT * FROM settings WHERE key = $1', ['site_settings']);
  return result.rows[0]?.value || {};
}

/**
 * Add Team Member
 */
export async function addTeamMember(member) {
  const result = await query(
    `INSERT INTO team (name, title, bio, image, email, phone, linked_in, is_founder, specialties, certifications)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      member.name,
      member.title,
      member.bio,
      member.image,
      member.email,
      member.phone,
      member.linked_in || '',
      member.is_founder || false,
      JSON.stringify(member.specialties || []),
      JSON.stringify(member.certifications || []),
    ]
  );
  return result.rows[0];
}

/**
 * Update Team Member
 */
export async function updateTeamMember(id, member) {
  const result = await query(
    `UPDATE team SET 
     name = $1, title = $2, bio = $3, image = $4, email = $5, phone = $6,
     linked_in = $7, is_founder = $8, specialties = $9, certifications = $10,
     updated_at = CURRENT_TIMESTAMP
     WHERE id = $11 RETURNING *`,
    [
      member.name,
      member.title,
      member.bio,
      member.image,
      member.email,
      member.phone,
      member.linked_in || '',
      member.is_founder || false,
      JSON.stringify(member.specialties || []),
      JSON.stringify(member.certifications || []),
      id,
    ]
  );
  return result.rows[0];
}

/**
 * Delete Team Member
 */
export async function deleteTeamMember(id) {
  await query('DELETE FROM team WHERE id = $1', [id]);
}

/**
 * Add Service
 */
export async function addService(service) {
  const result = await query(
    `INSERT INTO services (icon, title, description, features, objective, color, image)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      service.icon,
      service.title,
      service.description,
      JSON.stringify(service.features || []),
      service.objective,
      service.color,
      service.image,
    ]
  );
  return result.rows[0];
}

/**
 * Update Service
 */
export async function updateService(id, service) {
  const result = await query(
    `UPDATE services SET 
     icon = $1, title = $2, description = $3, features = $4, objective = $5, 
     color = $6, image = $7, updated_at = CURRENT_TIMESTAMP
     WHERE id = $8 RETURNING *`,
    [
      service.icon,
      service.title,
      service.description,
      JSON.stringify(service.features || []),
      service.objective,
      service.color,
      service.image,
      id,
    ]
  );
  return result.rows[0];
}

/**
 * Delete Service
 */
export async function deleteService(id) {
  await query('DELETE FROM services WHERE id = $1', [id]);
}

/**
 * Add Contact
 */
export async function addContact(contact) {
  const result = await query(
    `INSERT INTO contacts (name, email, subject, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [contact.name, contact.email, contact.subject, contact.message]
  );
  return result.rows[0];
}

/**
 * Add Job Application
 */
export async function addApplication(app) {
  const result = await query(
    `INSERT INTO applications (job_id, name, email, phone, message)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [app.job_id, app.name, app.email, app.phone, app.message]
  );
  return result.rows[0];
}

/**
 * Close connection
 */
export async function closeConnection() {
  await pool.end();
}

export default pool;
