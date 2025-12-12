const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const LOG_FILE = 'test-results-full.log';
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'w' });

function log(msg) {
  const timestamp = new Date().toISOString();
  const fullMsg = `[${timestamp}] ${msg}`;
  console.log(fullMsg);
  logStream.write(fullMsg + '\n');
}

function testApi(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function main() {
  log('=== API COMPREHENSIVE TEST SUITE ===\n');
  
  const serverProcess = spawn('npm', ['start'], {
    cwd: 'c:\\Users\\EMMANUEL\\Documents\\site tru\\backend',
    stdio: 'pipe',
    shell: true
  });

  serverProcess.stdout.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) log(`[SERVER] ${msg}`);
  });

  serverProcess.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) log(`[ERROR] ${msg}`);
  });

  log('Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 6000));

  log('\n=== PHASE 1: GET ENDPOINTS ===\n');

  const getTests = [
    { name: 'GET /api/team', path: '/api/team' },
    { name: 'GET /api/testimonials', path: '/api/testimonials' },
    { name: 'GET /api/news', path: '/api/news' },
    { name: 'GET /api/solutions', path: '/api/solutions' },
    { name: 'GET /api/jobs', path: '/api/jobs' },
    { name: 'GET /api/services', path: '/api/services' },
    { name: 'GET /api/contacts', path: '/api/contacts' },
    { name: 'GET /api/settings', path: '/api/settings' },
    { name: 'GET /api/applications', path: '/api/applications' }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of getTests) {
    try {
      const result = await testApi(test.path);
      if (result.status === 200) {
        log(`✅ ${test.name}`);
        passed++;
      } else {
        log(`❌ ${test.name} - Status: ${result.status}`);
        failed++;
      }
    } catch (err) {
      log(`❌ ${test.name} - Error: ${err.message}`);
      failed++;
    }
  }

  log(`\n=== PHASE 2: POST ENDPOINTS (CREATE) ===\n`);

  const postTests = [
    {
      name: 'POST /api/team (create team member)',
      path: '/api/team',
      method: 'POST',
      data: {
        name: 'Test User',
        title: 'Test Title',
        bio: 'Test bio',
        email: 'test@example.com',
        phone: '+1234567890',
        specialties: '[]',
        certifications: '[]'
      }
    },
    {
      name: 'POST /api/testimonials (create testimonial)',
      path: '/api/testimonials',
      method: 'POST',
      data: {
        name: 'John Doe',
        title: 'Client',
        company: 'Test Corp',
        testimonial: 'Great service!',
        rating: 5
      }
    },
    {
      name: 'POST /api/jobs (create job)',
      path: '/api/jobs',
      method: 'POST',
      data: {
        title: 'Software Engineer',
        description: 'We are hiring',
        location: 'Remote',
        type: 'Full-time',
        department: 'Engineering'
      }
    },
    {
      name: 'POST /api/services (create service)',
      path: '/api/services',
      method: 'POST',
      data: {
        name: 'Web Development',
        description: 'Professional web development services',
        price: 5000,
        category: 'Development'
      }
    },
    {
      name: 'POST /api/contacts (create contact message)',
      path: '/api/contacts',
      method: 'POST',
      data: {
        full_name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+9876543210',
        subject: 'Inquiry',
        message: 'I have a question'
      }
    }
  ];

  for (const test of postTests) {
    try {
      const result = await testApi(test.path, 'POST', test.data);
      if (result.status === 201 || result.status === 200) {
        log(`✅ ${test.name} - Status: ${result.status}`);
        passed++;
      } else {
        log(`❌ ${test.name} - Status: ${result.status}`);
        log(`   Response: ${result.body.substring(0, 200)}`);
        failed++;
      }
    } catch (err) {
      log(`❌ ${test.name} - Error: ${err.message}`);
      failed++;
    }
  }

  log(`\n=== FINAL RESULTS ===`);
  log(`Total Passed: ${passed}/${getTests.length + postTests.length}`);
  log(`Total Failed: ${failed}/${getTests.length + postTests.length}`);
  log(`Success Rate: ${Math.round((passed / (getTests.length + postTests.length)) * 100)}%`);

  if (failed === 0) {
    log(`\n✅ ALL TESTS PASSED!`);
  }

  serverProcess.kill();
  logStream.end();

  console.log('\n✅ Tests completed!');
  process.exit(0);
}

main().catch(err => {
  log(`Fatal: ${err.message}`);
  process.exit(1);
});
