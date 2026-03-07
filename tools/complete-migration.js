/**
 * Complete Migration Test & Execution
 * 
 * This script:
 * 1. Tests backend connectivity
 * 2. Gets admin token
 * 3. Runs migration
 * 4. Verifies results
 * 
 * Usage: node complete-migration.js
 */

import axios from 'axios';
import readline from 'readline';

const BACKEND_URL = 'https://tru-backend-o1zc.onrender.com';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function testBackend() {
  try {
    console.log('\n1️⃣ Testing backend connectivity...');
    const res = await axios.get(`${BACKEND_URL}/api/health`);
    console.log('   ✅ Backend is responding');
    return true;
  } catch (error) {
    console.error('   ❌ Backend is not responding');
    console.error('   Error:', error.message);
    return false;
  }
}

async function runMigration(token) {
  try {
    console.log('\n2️⃣ Running migration...');
    const res = await axios.post(
      `${BACKEND_URL}/api/admin/migrate-data`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (res.data.status === 'SUCCESS') {
      console.log('   ✅ Migration successful!\n');
      console.log('   📊 Imported:');
      Object.entries(res.data.imported).forEach(([key, count]) => {
        if (count > 0) {
          console.log(`      - ${key}: ${count}`);
        }
      });
      return true;
    } else {
      console.error('   ❌ Migration failed:', res.data.message);
      return false;
    }
  } catch (error) {
    console.error('   ❌ Migration error:', error.response?.data?.error || error.message);
    if (error.response?.status === 401) {
      console.log('\n   ⚠️  Unauthorized - token may be invalid or expired');
    }
    return false;
  }
}

async function verifyMigration() {
  try {
    console.log('\n3️⃣ Verifying migrated data...');
    const teamRes = await axios.get(`${BACKEND_URL}/api/team`);
    const team = teamRes.data;
    console.log(`   ✅ Team data exists (${team.length} members)`);
    return true;
  } catch (error) {
    console.error('   ❌ Verification failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   COMPLETE MIGRATION SCRIPT             ║');
  console.log('║   Data.json → PostgreSQL                ║');
  console.log('╚════════════════════════════════════════╝');

  // Step 1: Test backend
  const backendOk = await testBackend();
  if (!backendOk) {
    console.log('\n❌ Cannot proceed - backend not accessible');
    console.log('   Check: https://tru-backend-o1zc.onrender.com/api/health');
    rl.close();
    process.exit(1);
  }

  // Step 2: Get token
  console.log('\n🔑 Need admin token to proceed\n');
  const hasToken = await ask('Do you have an admin token? (y/n): ');
  
  let token;
  if (hasToken.toLowerCase() === 'y') {
    token = await ask('Paste your admin token: ');
  } else {
    console.log('\n💡 Get token from backoffice:');
    console.log('   1. Open: https://bo.trugroup.cm');
    console.log('   2. Login with admin account');
    console.log('   3. Open DevTools (F12)');
    console.log('   4. Go to Console tab');
    console.log('   5. Run: localStorage.getItem("token")');
    console.log('   6. Copy the token\n');
    token = await ask('Paste your admin token: ');
  }

  if (!token || token.trim().length === 0) {
    console.log('\n❌ No token provided');
    rl.close();
    process.exit(1);
  }

  // Step 3: Run migration
  const migrationOk = await runMigration(token.trim());
  if (!migrationOk) {
    console.log('\n❌ Migration failed');
    rl.close();
    process.exit(1);
  }

  // Step 4: Verify
  const verifyOk = await verifyMigration();

  if (verifyOk) {
    console.log('\n✅ MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('\n📋 Next steps:');
    console.log('   1. Check backoffice: https://bo.trugroup.cm');
    console.log('   2. Verify team data is showing');
    console.log('   3. Wait 15 minutes and refresh to test persistence');
    console.log('   4. Data should still be there! ✅\n');
  } else {
    console.log('\n⚠️  Migration completed but verification failed');
    console.log('   Check backend logs for details\n');
  }

  rl.close();
  process.exit(0);
}

main().catch(error => {
  console.error('Unexpected error:', error);
  rl.close();
  process.exit(1);
});
