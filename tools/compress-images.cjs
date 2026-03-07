// Script to compress base64 images in database to reduce payload size
const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

// Simple JPEG compression by reducing quality - simulate by truncating for now
// In production, use sharp or other image library
function compressBase64Image(base64String, maxSizeKB = 150) {
  if (!base64String || !base64String.startsWith('data:')) {
    return base64String;
  }
  
  const currentSizeKB = base64String.length / 1024;
  console.log(`Current size: ${Math.round(currentSizeKB)}KB`);
  
  // For now, just log - actual compression would require image library
  // This is a placeholder for image compression logic
  return base64String;
}

async function compressImages() {
  try {
    console.log('🔍 Scanning for large images...');
    const result = await pool.query('SELECT id, name, LENGTH(image) as size FROM team WHERE image IS NOT NULL ORDER BY LENGTH(image) DESC');
    
    console.log('\n📊 Team images:');
    result.rows.forEach(row => {
      const sizeKB = Math.round(row.size / 1024);
      const status = sizeKB > 200 ? '❌ TOO LARGE' : '✅ OK';
      console.log(`  ${status} ${row.name}: ${sizeKB}KB`);
    });
    
    // Note: To actually compress, you would need:
    // 1. Install 'sharp' package: npm install sharp
    // 2. Load image, resize, compress, re-encode to base64
    // 3. Update database with compressed version
    
    console.log('\n💡 To reduce image sizes:');
    console.log('1. Use an image compression tool (TinyPNG, ImageOptim)');
    console.log('2. Or reinstall members with smaller images');
    console.log('3. Resize images to max 400x400px before uploading');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

compressImages();
