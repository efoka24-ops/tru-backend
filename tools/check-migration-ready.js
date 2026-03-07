/**
 * PRE-MIGRATION CHECKLIST
 * Run this to verify everything is ready before migration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('\n🔍 PRE-MIGRATION CHECKLIST\n');
console.log('================================\n');

let passed = 0;
let failed = 0;

// Check 1: data.json exists
const dataPath = path.join(__dirname, 'data.json');
if (fs.existsSync(dataPath)) {
  const stats = fs.statSync(dataPath);
  console.log(`✅ data.json exists (${Math.round(stats.size / 1024)}KB)`);
  passed++;
} else {
  console.log('❌ data.json NOT FOUND!');
  console.log('   You need data.json to migrate');
  failed++;
}

// Check 2: data.json is valid JSON
if (fs.existsSync(dataPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log(`✅ data.json is valid JSON`);
    
    // Show what's in it
    console.log(`   - team: ${data.team?.length || 0} members`);
    console.log(`   - testimonials: ${data.testimonials?.length || 0} items`);
    console.log(`   - services: ${data.services?.length || 0} items`);
    console.log(`   - settings: ${data.settings ? '✓' : '✗'}`);
    console.log(`   - contacts: ${data.contacts?.length || 0} items`);
    console.log(`   - news: ${data.news?.length || 0} items`);
    passed++;
  } catch (err) {
    console.log('❌ data.json is INVALID JSON!');
    console.log(`   Error: ${err.message}`);
    failed++;
  }
}

// Check 3: .env has DATABASE_URL
try {
  const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
  if (envFile.includes('DATABASE_URL')) {
    const dbUrl = envFile.split('\n').find(line => line.startsWith('DATABASE_URL='));
    if (dbUrl && dbUrl.includes('dpg-')) {
      console.log('✅ DATABASE_URL points to Render PostgreSQL');
      console.log(`   Database: tru_data`);
      passed++;
    } else {
      console.log('⚠️  DATABASE_URL exists but may not be correct');
      console.log('   Expected: postgresql://tru_user:...@dpg-...');
      failed++;
    }
  } else {
    console.log('❌ DATABASE_URL not found in .env!');
    failed++;
  }
} catch (err) {
  console.log('❌ Cannot read .env file');
  failed++;
}

// Check 4: migrate-to-postgres.js exists
const migrateFile = path.join(__dirname, 'migrate-to-postgres.js');
if (fs.existsSync(migrateFile)) {
  console.log('✅ Migration script exists');
  passed++;
} else {
  console.log('❌ migrate-to-postgres.js NOT FOUND!');
  failed++;
}

// Check 5: pg package installed
try {
  const pkgFile = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
  if (pkgFile.dependencies.pg) {
    console.log('✅ pg package is installed');
    passed++;
  } else {
    console.log('⚠️  pg package not in dependencies');
    console.log('   Run: npm install pg');
    failed++;
  }
} catch (err) {
  console.log('⚠️  Cannot check package.json');
}

console.log('\n================================');
console.log(`\n${passed} checks passed, ${failed} checks failed\n`);

if (failed === 0) {
  console.log('✅ ALL CHECKS PASSED!');
  console.log('\n📝 Next step:');
  console.log('   1. Make sure DATABASE_URL is added to Render service');
  console.log('   2. Wait for Render backend to redeploy (status = Live)');
  console.log('   3. Run: node migrate-to-postgres.js\n');
  process.exit(0);
} else {
  console.log('❌ SOME CHECKS FAILED!');
  console.log('\nFix the issues above before running migration.\n');
  process.exit(1);
}
