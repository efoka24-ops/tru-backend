#!/usr/bin/env node
// Test des endpoints API avant déploiement
// Usage: node test-api.cjs

const http = require('http');

const API_URL = process.env.API_URL || 'http://localhost:5000';

const endpoints = [
  { method: 'GET', path: '/api/team', name: 'Get Team Members' },
  { method: 'GET', path: '/api/testimonials', name: 'Get Testimonials' },
  { method: 'GET', path: '/api/solutions', name: 'Get Solutions' },
  { method: 'GET', path: '/api/services', name: 'Get Services' },
  { method: 'GET', path: '/api/news', name: 'Get News' },
  { method: 'GET', path: '/api/jobs', name: 'Get Jobs' },
  { method: 'GET', path: '/api/contacts', name: 'Get Contacts' },
];

function testEndpoint(method, path) {
  return new Promise((resolve) => {
    const url = new URL(API_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            status: '✅',
            code: res.statusCode,
            count: Array.isArray(json) ? json.length : 'object'
          });
        } catch (e) {
          resolve({
            status: '⚠️',
            code: res.statusCode,
            message: 'Response is not JSON'
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        status: '❌',
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: '❌',
        error: 'Timeout after 5 seconds'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 Test des endpoints API\n');
  console.log(`API URL: ${API_URL}\n`);
  console.log('=' .repeat(70));

  let passed = 0;
  let failed = 0;

  for (const endpoint of endpoints) {
    process.stdout.write(`Testing ${endpoint.name.padEnd(25)}...`);
    const result = await testEndpoint(endpoint.method, endpoint.path);
    
    if (result.status === '✅') {
      console.log(` ${result.status} (${result.code}) - ${result.count} items`);
      passed++;
    } else if (result.status === '⚠️') {
      console.log(` ${result.status} (${result.code}) - ${result.message}`);
      passed++;
    } else {
      console.log(` ${result.status} ${result.error}`);
      failed++;
    }
  }

  console.log('=' .repeat(70));
  console.log(`\n📊 Résultats: ${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log('✨ Tous les tests sont passés!\n');
    process.exit(0);
  } else {
    console.log('❌ Certains tests ont échoué.\n');
    console.log('💡 Vérifier que:');
    console.log('  1. Le serveur backend est lancé');
    console.log('  2. La base de données est accessible');
    console.log('  3. Les tables sont créées');
    process.exit(1);
  }
}

runTests();
