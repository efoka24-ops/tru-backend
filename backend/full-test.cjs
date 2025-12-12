const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const LOG_FILE = 'test-results.log';
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'w' });

function log(msg) {
  const timestamp = new Date().toISOString();
  const fullMsg = `[${timestamp}] ${msg}`;
  console.log(fullMsg);
  logStream.write(fullMsg + '\n');
}

function testApi(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      timeout: 5000
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
    req.end();
  });
}

async function main() {
  log('=== STARTING SERVER ===');
  
  const serverProcess = spawn('npm', ['start'], {
    cwd: 'c:\\Users\\EMMANUEL\\Documents\\site tru\\backend',
    stdio: 'pipe',
    shell: true
  });

  serverProcess.stdout.on('data', (data) => {
    log(`[SERVER] ${data.toString().trim()}`);
  });

  serverProcess.stderr.on('data', (data) => {
    log(`[ERROR] ${data.toString().trim()}`);
  });

  log('Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 6000));

  log('\n=== RUNNING TESTS ===\n');

  const endpoints = [
    '/api/team',
    '/api/testimonials',
    '/api/news',
    '/api/solutions',
    '/api/jobs',
    '/api/services',
    '/api/contacts',
    '/api/settings',
    '/api/applications'
  ];

  let passed = 0;
  let failed = 0;

  for (const endpoint of endpoints) {
    try {
      const result = await testApi(endpoint);
      if (result.status === 200) {
        log(`✅ ${endpoint} - Status: ${result.status}`);
        passed++;
      } else {
        log(`❌ ${endpoint} - Status: ${result.status}`);
        failed++;
      }
    } catch (err) {
      log(`❌ ${endpoint} - Error: ${err.message}`);
      failed++;
    }
  }

  log(`\n=== RESULTS ===`);
  log(`Passed: ${passed}/${endpoints.length}`);
  log(`Failed: ${failed}/${endpoints.length}`);

  serverProcess.kill();
  logStream.end();

  console.log('\n✅ Tests completed! Results saved to test-results.log');
  process.exit(0);
}

main().catch(err => {
  log(`Fatal: ${err.message}`);
  process.exit(1);
});
