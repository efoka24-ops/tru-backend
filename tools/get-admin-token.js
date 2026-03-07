/**
 * Get Admin Token for Testing
 * 
 * This script helps you get an admin token to test the migration endpoint
 * Usage: node get-admin-token.js
 */

import axios from 'axios';

const BACKEND_URL = 'https://tru-backend-o1zc.onrender.com';
// Or use local for testing: 'http://localhost:5000'

// You need valid admin credentials
// Check your data.json for admin accounts
const ADMIN_CREDENTIALS = {
  email: 'admin@trugroup.cm', // Replace with real admin email
  password: 'admin123'        // Replace with real admin password
};

async function getAdminToken() {
  try {
    console.log('🔐 Getting admin token...\n');
    
    // Try login endpoint
    const loginRes = await axios.post(`${BACKEND_URL}/api/login`, {
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password
    });

    if (loginRes.data.token) {
      console.log('✅ Successfully got admin token!\n');
      console.log('Token:', loginRes.data.token);
      console.log('\nTo test migration, use this command:\n');
      console.log(`curl -X POST ${BACKEND_URL}/api/admin/migrate-data \\`);
      console.log(`  -H "Authorization: Bearer ${loginRes.data.token}" \\`);
      console.log(`  -H "Content-Type: application/json"`);
      
      return loginRes.data.token;
    }
  } catch (error) {
    console.error('❌ Failed to get token:', error.response?.data || error.message);
    console.log('\n📝 Make sure:');
    console.log('1. Backend is running');
    console.log('2. Credentials are correct');
    console.log('3. User has admin role');
    
    // Fallback: ask for manual token
    console.log('\n💡 Or, you can manually get a token from backoffice:');
    console.log('1. Open: https://bo.trugroup.cm');
    console.log('2. Login with admin account');
    console.log('3. Check browser console (F12 → Console)');
    console.log('4. Run: localStorage.getItem("token")');
    console.log('5. Copy the token value');
  }
}

getAdminToken();
