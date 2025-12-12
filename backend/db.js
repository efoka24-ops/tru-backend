/**
 * Database module - PostgreSQL queries using @vercel/postgres
 * Handles all database operations for TRU GROUP website
 */

import { sql } from '@vercel/postgres';

// ============= INITIALIZATION =============

export async function initializeDatabase() {
  try {
    console.log('📊 Initializing PostgreSQL database...');

    // Create tables if they don't exist
    await createTables();
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
}

async function createTables() {
  try {
    // Team table
    await sql`
      CREATE TABLE IF NOT EXISTS team (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        bio TEXT,
        image TEXT,
        email VARCHAR(255),
        phone VARCHAR(20),
        specialties TEXT[],
        certifications TEXT[],
        linked_in VARCHAR(255),
        is_founder BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Team table created');

    // Testimonials table
    await sql`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        title VARCHAR(255),
        company VARCHAR(255),
        testimonial TEXT,
        rating INT,
        image TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Testimonials table created');

    // News table
    await sql`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content TEXT,
        category VARCHAR(100),
        image TEXT,
        date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ News table created');

    // Solutions table
    await sql`
      CREATE TABLE IF NOT EXISTS solutions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        image TEXT,
        benefits TEXT[],
        features TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Solutions table created');

    // Jobs table
    await sql`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        type VARCHAR(50),
        department VARCHAR(100),
        requirements TEXT,
        salary_range VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Jobs table created');

    // Applications table
    await sql`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        job_id INT,
        job_title VARCHAR(255),
        full_name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        linkedin VARCHAR(255),
        cover_letter TEXT,
        resume TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        applied_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Applications table created');

    // Contacts table
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        subject VARCHAR(255),
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        reply_method VARCHAR(50),
        reply_message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        reply_date TIMESTAMP,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Contacts table created');

    // Settings table
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        site_title VARCHAR(255),
        slogan VARCHAR(255),
        tagline VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        facebook VARCHAR(255),
        twitter VARCHAR(255),
        linkedin VARCHAR(255),
        instagram VARCHAR(255),
        primary_color VARCHAR(50),
        description TEXT,
        business_hours JSONB,
        maintenance_mode BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Settings table created');

    // Services table
    await sql`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price INT,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Services table created');

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('📊 Tables already exist, skipping creation');
    } else {
      throw error;
    }
  }
}

// ============= TEAM OPERATIONS =============

export async function getTeam() {
  try {
    const result = await sql`SELECT * FROM team ORDER BY id`;
    return result.rows;
  } catch (error) {
    console.error('Error fetching team:', error);
    return [];
  }
}

export async function createTeamMember(data) {
  try {
    const result = await sql`
      INSERT INTO team (name, title, bio, image, email, phone, specialties, certifications, linked_in, is_founder)
      VALUES (${data.name}, ${data.title || null}, ${data.bio || null}, ${data.image || null}, 
              ${data.email || null}, ${data.phone || null}, ${JSON.stringify(data.specialties || [])}, 
              ${JSON.stringify(data.certifications || [])}, ${data.linked_in || null}, ${data.is_founder || false})
      RETURNING *
    `;
    console.log('✅ Team member created:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating team member:', error);
    throw error;
  }
}

export async function updateTeamMember(id, data) {
  try {
    const result = await sql`
      UPDATE team 
      SET name = ${data.name}, title = ${data.title}, bio = ${data.bio}, image = ${data.image},
          email = ${data.email}, phone = ${data.phone}, specialties = ${JSON.stringify(data.specialties || [])},
          certifications = ${JSON.stringify(data.certifications || [])}, linked_in = ${data.linked_in},
          is_founder = ${data.is_founder}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    console.log('✅ Team member updated:', id);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating team member:', error);
    throw error;
  }
}

export async function deleteTeamMember(id) {
  try {
    const result = await sql`DELETE FROM team WHERE id = ${id} RETURNING id`;
    console.log('✅ Team member deleted:', id);
    return { success: true, id };
  } catch (error) {
    console.error('Error deleting team member:', error);
    throw error;
  }
}

// ============= TESTIMONIALS OPERATIONS =============

export async function getTestimonials() {
  try {
    const result = await sql`SELECT * FROM testimonials ORDER BY id DESC`;
    return result.rows;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

export async function createTestimonial(data) {
  try {
    const result = await sql`
      INSERT INTO testimonials (name, title, company, testimonial, rating, image)
      VALUES (${data.name}, ${data.title}, ${data.company}, ${data.testimonial}, ${data.rating}, ${data.image})
      RETURNING *
    `;
    console.log('✅ Testimonial created:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating testimonial:', error);
    throw error;
  }
}

export async function updateTestimonial(id, data) {
  try {
    const result = await sql`
      UPDATE testimonials
      SET name = ${data.name}, title = ${data.title}, company = ${data.company}, 
          testimonial = ${data.testimonial}, rating = ${data.rating}, image = ${data.image},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    console.log('✅ Testimonial updated:', id);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating testimonial:', error);
    throw error;
  }
}

export async function deleteTestimonial(id) {
  try {
    await sql`DELETE FROM testimonials WHERE id = ${id}`;
    console.log('✅ Testimonial deleted:', id);
    return { success: true, id };
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    throw error;
  }
}

// ============= NEWS OPERATIONS =============

export async function getNews() {
  try {
    const result = await sql`SELECT * FROM news ORDER BY date DESC`;
    return result.rows;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export async function createNews(data) {
  try {
    const result = await sql`
      INSERT INTO news (title, description, content, category, image, date)
      VALUES (${data.title}, ${data.description}, ${data.content || ''}, ${data.category}, ${data.image}, ${data.date || new Date()})
      RETURNING *
    `;
    console.log('✅ News created:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating news:', error);
    throw error;
  }
}

export async function updateNews(id, data) {
  try {
    const result = await sql`
      UPDATE news
      SET title = ${data.title}, description = ${data.description}, content = ${data.content},
          category = ${data.category}, image = ${data.image}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    console.log('✅ News updated:', id);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating news:', error);
    throw error;
  }
}

export async function deleteNews(id) {
  try {
    await sql`DELETE FROM news WHERE id = ${id}`;
    console.log('✅ News deleted:', id);
    return { success: true, id };
  } catch (error) {
    console.error('Error deleting news:', error);
    throw error;
  }
}

// ============= SOLUTIONS OPERATIONS =============

export async function getSolutions() {
  try {
    const result = await sql`SELECT * FROM solutions ORDER BY id`;
    return result.rows;
  } catch (error) {
    console.error('Error fetching solutions:', error);
    return [];
  }
}

export async function createSolution(data) {
  try {
    const result = await sql`
      INSERT INTO solutions (name, description, category, image, benefits, features)
      VALUES (${data.name}, ${data.description}, ${data.category}, ${data.image},
              ${JSON.stringify(data.benefits || [])}, ${JSON.stringify(data.features || [])})
      RETURNING *
    `;
    console.log('✅ Solution created:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating solution:', error);
    throw error;
  }
}

export async function updateSolution(id, data) {
  try {
    const result = await sql`
      UPDATE solutions
      SET name = ${data.name}, description = ${data.description}, category = ${data.category},
          image = ${data.image}, benefits = ${JSON.stringify(data.benefits || [])},
          features = ${JSON.stringify(data.features || [])}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    console.log('✅ Solution updated:', id);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating solution:', error);
    throw error;
  }
}

export async function deleteSolution(id) {
  try {
    await sql`DELETE FROM solutions WHERE id = ${id}`;
    console.log('✅ Solution deleted:', id);
    return { success: true, id };
  } catch (error) {
    console.error('Error deleting solution:', error);
    throw error;
  }
}

// ============= JOBS OPERATIONS =============

export async function getJobs() {
  try {
    const result = await sql`SELECT * FROM jobs ORDER BY id DESC`;
    return result.rows;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

export async function createJob(data) {
  try {
    const result = await sql`
      INSERT INTO jobs (title, description, location, type, department, requirements, salary_range)
      VALUES (${data.title}, ${data.description}, ${data.location}, ${data.type}, 
              ${data.department}, ${data.requirements}, ${data.salary_range})
      RETURNING *
    `;
    console.log('✅ Job created:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}

export async function updateJob(id, data) {
  try {
    const result = await sql`
      UPDATE jobs
      SET title = ${data.title}, description = ${data.description}, location = ${data.location},
          type = ${data.type}, department = ${data.department}, requirements = ${data.requirements},
          salary_range = ${data.salary_range}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    console.log('✅ Job updated:', id);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
}

export async function deleteJob(id) {
  try {
    await sql`DELETE FROM jobs WHERE id = ${id}`;
    console.log('✅ Job deleted:', id);
    return { success: true, id };
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
}

// ============= APPLICATIONS OPERATIONS =============

export async function getApplications() {
  try {
    const result = await sql`SELECT * FROM applications ORDER BY applied_at DESC`;
    return result.rows;
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
}

export async function createApplication(data) {
  try {
    const result = await sql`
      INSERT INTO applications (job_id, job_title, full_name, email, phone, linkedin, cover_letter, resume)
      VALUES (${data.job_id}, ${data.job_title}, ${data.full_name}, ${data.email}, 
              ${data.phone}, ${data.linkedin}, ${data.cover_letter}, ${data.resume})
      RETURNING *
    `;
    console.log('✅ Application created:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
}

export async function deleteApplication(id) {
  try {
    await sql`DELETE FROM applications WHERE id = ${id}`;
    console.log('✅ Application deleted:', id);
    return { success: true, id };
  } catch (error) {
    console.error('Error deleting application:', error);
    throw error;
  }
}

// ============= CONTACTS OPERATIONS =============

export async function getContacts() {
  try {
    const result = await sql`SELECT * FROM contacts ORDER BY created_at DESC`;
    return result.rows;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
}

export async function createContact(data) {
  try {
    const result = await sql`
      INSERT INTO contacts (full_name, email, phone, subject, message)
      VALUES (${data.full_name}, ${data.email}, ${data.phone}, ${data.subject}, ${data.message})
      RETURNING *
    `;
    console.log('✅ Contact created:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
}

export async function replyContact(id, data) {
  try {
    const result = await sql`
      UPDATE contacts
      SET status = 'replied', reply_method = ${data.reply_method}, 
          reply_message = ${data.reply_message}, reply_date = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    console.log('✅ Contact replied:', id);
    return result.rows[0];
  } catch (error) {
    console.error('Error replying to contact:', error);
    throw error;
  }
}

export async function deleteContact(id) {
  try {
    await sql`DELETE FROM contacts WHERE id = ${id}`;
    console.log('✅ Contact deleted:', id);
    return { success: true, id };
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
}

// ============= SETTINGS OPERATIONS =============

export async function getSettings() {
  try {
    const result = await sql`SELECT * FROM settings ORDER BY id LIMIT 1`;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
}

export async function updateSettings(data) {
  try {
    const existing = await getSettings();
    
    if (existing) {
      const result = await sql`
        UPDATE settings
        SET site_title = ${data.site_title}, slogan = ${data.slogan}, tagline = ${data.tagline},
            email = ${data.email}, phone = ${data.phone}, address = ${data.address},
            facebook = ${data.facebook}, twitter = ${data.twitter}, linkedin = ${data.linkedin},
            instagram = ${data.instagram}, primary_color = ${data.primary_color},
            description = ${data.description}, business_hours = ${JSON.stringify(data.business_hours)},
            maintenance_mode = ${data.maintenance_mode}, updated_at = NOW()
        WHERE id = 1
        RETURNING *
      `;
      console.log('✅ Settings updated');
      return result.rows[0];
    } else {
      const result = await sql`
        INSERT INTO settings (id, site_title, slogan, tagline, email, phone, address, 
                             facebook, twitter, linkedin, instagram, primary_color, description, 
                             business_hours, maintenance_mode)
        VALUES (1, ${data.site_title}, ${data.slogan}, ${data.tagline}, ${data.email}, 
                ${data.phone}, ${data.address}, ${data.facebook}, ${data.twitter}, 
                ${data.linkedin}, ${data.instagram}, ${data.primary_color}, 
                ${data.description}, ${JSON.stringify(data.business_hours)}, ${data.maintenance_mode})
        RETURNING *
      `;
      console.log('✅ Settings created');
      return result.rows[0];
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}

// ============= SERVICES OPERATIONS =============

export async function getServices() {
  try {
    const result = await sql`SELECT * FROM services ORDER BY id`;
    return result.rows;
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export async function createService(data) {
  try {
    const result = await sql`
      INSERT INTO services (name, description, price, category)
      VALUES (${data.name}, ${data.description}, ${data.price}, ${data.category})
      RETURNING *
    `;
    console.log('✅ Service created:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
}

export async function updateService(id, data) {
  try {
    const result = await sql`
      UPDATE services
      SET name = ${data.name}, description = ${data.description}, price = ${data.price},
          category = ${data.category}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    console.log('✅ Service updated:', id);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
}

export async function deleteService(id) {
  try {
    await sql`DELETE FROM services WHERE id = ${id}`;
    console.log('✅ Service deleted:', id);
    return { success: true, id };
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
}
