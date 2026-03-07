#!/usr/bin/env node

const http = require('http');
const fs = require('fs');

const logFile = 'test-results.log';
const log = (msg) => {
  const timestamp = new Date().toISOString();
  const fullMsg = `[${timestamp}] ${msg}`;
  console.log(fullMsg);
  fs.appendFileSync(logFile, fullMsg + '\n');
};

function testApi(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  log('=== API TEST SUITE ===');
  log('Testing PostgreSQL connection and CRUD operations\n');

  const tests = [
    { name: 'GET /api/team', path: '/api/team', method: 'GET' },
    { name: 'GET /api/testimonials', path: '/api/testimonials', method: 'GET' },
    { name: 'GET /api/news', path: '/api/news', method: 'GET' },
    { name: 'GET /api/solutions', path: '/api/solutions', method: 'GET' },
    { name: 'GET /api/jobs', path: '/api/jobs', method: 'GET' },
    { name: 'GET /api/services', path: '/api/services', method: 'GET' },
    { name: 'GET /api/contacts', path: '/api/contacts', method: 'GET' },
    { name: 'GET /api/settings', path: '/api/settings', method: 'GET' },
    { name: 'GET /api/applications', path: '/api/applications', method: 'GET' }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      log(`\nTesting: ${test.name}`);
      const result = await testApi(test.path, test.method);
      
      if (result.status === 200) {
        log(`✅ PASSED: ${test.name}`);
        log(`   Status: ${result.status}`);
        const parsedBody = JSON.parse(result.body);
        log(`   Response: ${JSON.stringify(parsedBody).substring(0, 100)}...`);
        passed++;
      } else {
        log(`❌ FAILED: ${test.name}`);
        log(`   Status: ${result.status}`);
        log(`   Response: ${result.body}`);
        failed++;
      }
    } catch (error) {
      log(`❌ ERROR: ${test.name}`);
      log(`   Error: ${error.message}`);
      failed++;
    }
  }

  log(`\n=== TEST RESULTS ===`);
  log(`Passed: ${passed}/${tests.length}`);
  log(`Failed: ${failed}/${tests.length}`);
  log(`Success Rate: ${Math.round((passed / tests.length) * 100)}%`);
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  log(`Fatal error: ${err.message}`);
  process.exit(1);
});
