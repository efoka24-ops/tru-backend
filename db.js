import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

let db = null;

export async function initializeDatabase() {
  try {
    console.log('📊 Initializing PostgreSQL...');
    const connStr = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!connStr) throw new Error('No DATABASE_URL');
    console.log('📍 Using:', connStr.substring(0,30) + '...');
    db = new Pool({ connectionString: connStr, ssl: { rejectUnauthorized: false }, max: 20 });
    console.log('✅ Connected!');
    // Create tables and wait for completion
    await createTables();
    console.log('✅ All tables created');
    return true;
  } catch (e) { console.error('❌ Error:', e.message); throw e; }
}

async function createTables() {
  const tables = [
    'CREATE TABLE IF NOT EXISTS team (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, title VARCHAR(255), bio TEXT, image TEXT, email VARCHAR(255), phone VARCHAR(20), specialties TEXT, certifications TEXT, linked_in VARCHAR(255), is_founder BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())',
    'CREATE TABLE IF NOT EXISTS testimonials (id SERIAL PRIMARY KEY, name VARCHAR(255), title VARCHAR(255), company VARCHAR(255), testimonial TEXT, rating INT, image TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())',
    'CREATE TABLE IF NOT EXISTS news (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT, content TEXT, category VARCHAR(100), image TEXT, date TIMESTAMP, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())',
    'CREATE TABLE IF NOT EXISTS solutions (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, description TEXT, category VARCHAR(100), image TEXT, benefits TEXT, features TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())',
    'CREATE TABLE IF NOT EXISTS jobs (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT, location VARCHAR(255), type VARCHAR(50), department VARCHAR(100), requirements TEXT, salary_range VARCHAR(100), created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())',
    'CREATE TABLE IF NOT EXISTS applications (id SERIAL PRIMARY KEY, job_id INT, job_title VARCHAR(255), full_name VARCHAR(255), email VARCHAR(255), phone VARCHAR(20), linkedin VARCHAR(255), cover_letter TEXT, resume TEXT, status VARCHAR(50) DEFAULT pending, applied_at TIMESTAMP DEFAULT NOW(), created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())',
    'CREATE TABLE IF NOT EXISTS contacts (id SERIAL PRIMARY KEY, full_name VARCHAR(255), email VARCHAR(255), phone VARCHAR(20), subject VARCHAR(255), message TEXT, status VARCHAR(50) DEFAULT pending, reply_method VARCHAR(50), reply_message TEXT, created_at TIMESTAMP DEFAULT NOW(), reply_date TIMESTAMP, updated_at TIMESTAMP DEFAULT NOW())',
    'CREATE TABLE IF NOT EXISTS settings (id SERIAL PRIMARY KEY, site_title VARCHAR(255), slogan VARCHAR(255), tagline VARCHAR(255), email VARCHAR(255), phone VARCHAR(20), address TEXT, facebook VARCHAR(255), twitter VARCHAR(255), linkedin VARCHAR(255), instagram VARCHAR(255), primary_color VARCHAR(50), description TEXT, business_hours JSONB, maintenance_mode BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())',
    'CREATE TABLE IF NOT EXISTS services (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, description TEXT, price INT, category VARCHAR(100), created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())'
  ];
  for (const sql of tables) { 
    try { 
      await db.query(sql); 
    } catch (e) { 
      console.warn('⚠️ Table creation error:', e.message);
    } 
  }
}

export async function getTeam() { try { return (await db.query('SELECT * FROM team ORDER BY id')).rows; } catch (e) { return []; } }
export async function createTeamMember(data) { const r = await db.query('INSERT INTO team (name, title, bio, image, email, phone, specialties, certifications, linked_in, is_founder) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *', [data.name, data.title||null, data.bio||null, data.image||null, data.email||null, data.phone||null, JSON.stringify(data.specialties||[]), JSON.stringify(data.certifications||[]), data.linked_in||null, data.is_founder||false]); return r.rows[0]; }
export async function updateTeamMember(id, data) { const r = await db.query('UPDATE team SET name=$1,title=$2,bio=$3,image=$4,email=$5,phone=$6,specialties=$7,certifications=$8,linked_in=$9,is_founder=$10,updated_at=NOW() WHERE id=$11 RETURNING *', [data.name, data.title, data.bio, data.image, data.email, data.phone, JSON.stringify(data.specialties||[]), JSON.stringify(data.certifications||[]), data.linked_in, data.is_founder, id]); return r.rows[0]; }
export async function deleteTeamMember(id) { await db.query('DELETE FROM team WHERE id = $1', [id]); return { success: true, id }; }
export async function getTestimonials() { try { return (await db.query('SELECT * FROM testimonials ORDER BY id DESC')).rows; } catch (e) { return []; } }
export async function createTestimonial(data) { const r = await db.query('INSERT INTO testimonials (name,title,company,testimonial,rating,image) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [data.name, data.title, data.company, data.testimonial, data.rating, data.image]); return r.rows[0]; }
export async function updateTestimonial(id, data) { const r = await db.query('UPDATE testimonials SET name=$1,title=$2,company=$3,testimonial=$4,rating=$5,image=$6,updated_at=NOW() WHERE id=$7 RETURNING *', [data.name, data.title, data.company, data.testimonial, data.rating, data.image, id]); return r.rows[0]; }
export async function deleteTestimonial(id) { await db.query('DELETE FROM testimonials WHERE id = $1', [id]); return { success: true, id }; }
export async function getNews() { try { return (await db.query('SELECT * FROM news ORDER BY date DESC')).rows; } catch (e) { return []; } }
export async function createNews(data) { const r = await db.query('INSERT INTO news (title,description,content,category,image,date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [data.title, data.description, data.content||'', data.category, data.image, data.date||new Date()]); return r.rows[0]; }
export async function updateNews(id, data) { const r = await db.query('UPDATE news SET title=$1,description=$2,content=$3,category=$4,image=$5,updated_at=NOW() WHERE id=$6 RETURNING *', [data.title, data.description, data.content, data.category, data.image, id]); return r.rows[0]; }
export async function deleteNews(id) { await db.query('DELETE FROM news WHERE id = $1', [id]); return { success: true, id }; }
export async function getSolutions() { try { return (await db.query('SELECT * FROM solutions ORDER BY id')).rows; } catch (e) { return []; } }
export async function createSolution(data) { const r = await db.query('INSERT INTO solutions (name,description,category,image,benefits,features) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [data.name, data.description, data.category, data.image, JSON.stringify(data.benefits||[]), JSON.stringify(data.features||[])]); return r.rows[0]; }
export async function updateSolution(id, data) { const r = await db.query('UPDATE solutions SET name=$1,description=$2,category=$3,image=$4,benefits=$5,features=$6,updated_at=NOW() WHERE id=$7 RETURNING *', [data.name, data.description, data.category, data.image, JSON.stringify(data.benefits||[]), JSON.stringify(data.features||[]), id]); return r.rows[0]; }
export async function deleteSolution(id) { await db.query('DELETE FROM solutions WHERE id = $1', [id]); return { success: true, id }; }
export async function getJobs() { try { return (await db.query('SELECT * FROM jobs ORDER BY id DESC')).rows; } catch (e) { return []; } }
export async function createJob(data) { const r = await db.query('INSERT INTO jobs (title,description,location,type,department,requirements,salary_range) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', [data.title, data.description, data.location, data.type, data.department, data.requirements, data.salary_range]); return r.rows[0]; }
export async function updateJob(id, data) { const r = await db.query('UPDATE jobs SET title=$1,description=$2,location=$3,type=$4,department=$5,requirements=$6,salary_range=$7,updated_at=NOW() WHERE id=$8 RETURNING *', [data.title, data.description, data.location, data.type, data.department, data.requirements, data.salary_range, id]); return r.rows[0]; }
export async function deleteJob(id) { await db.query('DELETE FROM jobs WHERE id = $1', [id]); return { success: true, id }; }
export async function getApplications() { try { return (await db.query('SELECT * FROM applications ORDER BY applied_at DESC')).rows; } catch (e) { return []; } }
export async function createApplication(data) { const r = await db.query('INSERT INTO applications (job_id,job_title,full_name,email,phone,linkedin,cover_letter,resume) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', [data.job_id, data.job_title, data.full_name, data.email, data.phone, data.linkedin, data.cover_letter, data.resume]); return r.rows[0]; }
export async function deleteApplication(id) { await db.query('DELETE FROM applications WHERE id = $1', [id]); return { success: true, id }; }
export async function getContacts() { try { return (await db.query('SELECT * FROM contacts ORDER BY created_at DESC')).rows; } catch (e) { return []; } }
export async function createContact(data) { const r = await db.query('INSERT INTO contacts (full_name,email,phone,subject,message) VALUES ($1,$2,$3,$4,$5) RETURNING *', [data.full_name, data.email, data.phone, data.subject, data.message]); return r.rows[0]; }
export async function replyContact(id, data) { const r = await db.query('UPDATE contacts SET status=$1,reply_method=$2,reply_message=$3,reply_date=NOW() WHERE id=$4 RETURNING *', ['replied', data.reply_method, data.reply_message, id]); return r.rows[0]; }
export async function deleteContact(id) { await db.query('DELETE FROM contacts WHERE id = $1', [id]); return { success: true, id }; }
export async function getSettings() { try { const r = await db.query('SELECT * FROM settings ORDER BY id LIMIT 1'); return r.rows[0]||null; } catch (e) { return null; } }
export async function updateSettings(data) { const existing = await getSettings(); if (existing) { const r = await db.query('UPDATE settings SET site_title=$1,slogan=$2,tagline=$3,email=$4,phone=$5,address=$6,facebook=$7,twitter=$8,linkedin=$9,instagram=$10,primary_color=$11,description=$12,business_hours=$13,maintenance_mode=$14,updated_at=NOW() WHERE id=1 RETURNING *', [data.site_title, data.slogan, data.tagline, data.email, data.phone, data.address, data.facebook, data.twitter, data.linkedin, data.instagram, data.primary_color, data.description, JSON.stringify(data.business_hours), data.maintenance_mode]); return r.rows[0]; } else { const r = await db.query('INSERT INTO settings (id,site_title,slogan,tagline,email,phone,address,facebook,twitter,linkedin,instagram,primary_color,description,business_hours,maintenance_mode) VALUES (1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *', [data.site_title, data.slogan, data.tagline, data.email, data.phone, data.address, data.facebook, data.twitter, data.linkedin, data.instagram, data.primary_color, data.description, JSON.stringify(data.business_hours), data.maintenance_mode]); return r.rows[0]; } }
export async function getServices() { try { return (await db.query('SELECT * FROM services ORDER BY id')).rows; } catch (e) { return []; } }
export async function createService(data) { const r = await db.query('INSERT INTO services (name,description,price,category) VALUES ($1,$2,$3,$4) RETURNING *', [data.name, data.description, data.price, data.category]); return r.rows[0]; }
export async function updateService(id, data) { const r = await db.query('UPDATE services SET name=$1,description=$2,price=$3,category=$4,updated_at=NOW() WHERE id=$5 RETURNING *', [data.name, data.description, data.price, data.category, id]); return r.rows[0]; }
export async function deleteService(id) { await db.query('DELETE FROM services WHERE id = $1', [id]); return { success: true, id }; }
