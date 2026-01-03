// Test quick pour vérifier les endpoints locaux
import http from 'http';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJJZCI6NCwiZW1haWwiOiJlbW1hbnVlbEB0cnVncm91cC5jbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NTk4MzY2NiwiZXhwIjoxNzY2MDcwMDY2fQ.1476MzjDII8I5rQ-jHg9xmW8G7T3dY62E6SQBKhv02Q';

function testEndpoint(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ ${path} → Status ${res.statusCode}`);
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`   Count: ${json.members?.length || json.team?.length || 'N/A'} items`);
          } catch(e) {}
        }
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${path} → Error: ${err.message}`);
      resolve();
    });
    
    req.end();
  });
}

async function test() {
  console.log('🧪 Testing Local Backend Endpoints...\n');
  
  await testEndpoint('/');
  await testEndpoint('/api/health');
  await testEndpoint('/api/test/team');
  await testEndpoint('/api/admin/members', { 'Authorization': `Bearer ${token}` });
  
  console.log('\n✅ Tests completed!');
  process.exit(0);
}

test();
