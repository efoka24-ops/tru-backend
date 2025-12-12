const pg = require('pg');
const { Pool } = pg;
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function resetTables() {
  try {
    const tables = [
      'DROP TABLE IF EXISTS applications CASCADE',
      'DROP TABLE IF EXISTS contacts CASCADE',
      'DROP TABLE IF EXISTS settings CASCADE',
      'DROP TABLE IF EXISTS services CASCADE',
      'DROP TABLE IF EXISTS jobs CASCADE',
      'DROP TABLE IF EXISTS solutions CASCADE',
      'DROP TABLE IF EXISTS news CASCADE',
      'DROP TABLE IF EXISTS testimonials CASCADE',
      'DROP TABLE IF EXISTS team CASCADE'
    ];

    console.log('🔄 Dropping all tables...');
    for (const sql of tables) {
      await pool.query(sql);
      console.log(`✅ ${sql.split(' ')[2]}`);
    }

    console.log('\n🔄 Creating tables...');
    const creates = [
      'CREATE TABLE IF NOT EXISTS team (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, title VARCHAR(255), bio TEXT, image TEXT, email VARCHAR(255), phone VARCHAR(20), specialties TEXT, certifications TEXT, linked_in VARCHAR(255), is_founder BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())',
      'CREATE TABLE IF NOT EXISTS testimonials (id SERIAL PRIMARY KEY, name VARCHAR(255), title VARCHAR(255), company VARCHAR(255), testimonial TEXT, rating INT, image TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())',
      'CREATE TABLE IF NOT EXISTS news (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT, content TEXT, category VARCHAR(100), image TEXT, date TIMESTAMP, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())',
      'CREATE TABLE IF NOT EXISTS solutions (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, description TEXT, category VARCHAR(100), image TEXT, benefits TEXT, features TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())',
      'CREATE TABLE IF NOT EXISTS jobs (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT, location VARCHAR(255), type VARCHAR(50), department VARCHAR(100), requirements TEXT, salary_range VARCHAR(100), created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())',
      'CREATE TABLE IF NOT EXISTS applications (id SERIAL PRIMARY KEY, job_id INT REFERENCES jobs(id) ON DELETE CASCADE, job_title VARCHAR(255), full_name VARCHAR(255), email VARCHAR(255), phone VARCHAR(20), linkedin VARCHAR(255), cover_letter TEXT, resume TEXT, status VARCHAR(50) DEFAULT \'pending\', applied_at TIMESTAMP DEFAULT NOW(), created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())',
      'CREATE TABLE IF NOT EXISTS contacts (id SERIAL PRIMARY KEY, full_name VARCHAR(255), email VARCHAR(255), phone VARCHAR(20), subject VARCHAR(255), message TEXT, status VARCHAR(50) DEFAULT \'pending\', reply_method VARCHAR(50), reply_message TEXT, created_at TIMESTAMP DEFAULT NOW(), reply_date TIMESTAMP, updated_at TIMESTAMP DEFAULT NOW())',
      'CREATE TABLE IF NOT EXISTS settings (id SERIAL PRIMARY KEY, site_title VARCHAR(255), slogan VARCHAR(255), tagline VARCHAR(255), email VARCHAR(255), phone VARCHAR(20), address TEXT, facebook VARCHAR(255), twitter VARCHAR(255), linkedin VARCHAR(255), instagram VARCHAR(255), primary_color VARCHAR(50), description TEXT, business_hours JSONB, maintenance_mode BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())',
      'CREATE TABLE IF NOT EXISTS services (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, description TEXT, price INT, category VARCHAR(100), created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())'
    ];

    for (const sql of creates) {
      await pool.query(sql);
      const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
      console.log(`✅ ${tableName}`);
    }

    console.log('\n✅ All tables reset successfully!');
    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

resetTables();
