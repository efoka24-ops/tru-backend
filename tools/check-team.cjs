const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTeam() {
  try {
    const result = await pool.query('SELECT id, name, title, image IS NOT NULL as has_image, LENGTH(image) as image_size FROM team ORDER BY id DESC LIMIT 10');
    console.log('Team members:');
    console.table(result.rows);
    
    // Check full data for first member
    if (result.rows.length > 0) {
      const full = await pool.query('SELECT id, name, title, image FROM team WHERE id = $1', [result.rows[0].id]);
      const member = full.rows[0];
      console.log('\n📋 Full data for', member.name);
      console.log('Image starts with:', member.image ? member.image.substring(0, 50) + '...' : 'NULL');
      console.log('Image length:', member.image ? member.image.length : 0);
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTeam();
