#!/usr/bin/env node
// Pre-deployment verification script
// Usage: node check-deployment.cjs

const fs = require('fs');
const path = require('path');

const checks = [];

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  checks.push({
    name: description,
    status: exists ? '✅' : '❌',
    path: filePath
  });
  return exists;
}

function checkContent(filePath, content, description) {
  const exists = fs.existsSync(filePath);
  if (!exists) {
    checks.push({
      name: description,
      status: '❌',
      path: filePath,
      reason: 'File not found'
    });
    return false;
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const hasContent = fileContent.includes(content);
  checks.push({
    name: description,
    status: hasContent ? '✅' : '❌',
    path: filePath,
    reason: hasContent ? '' : `Missing: "${content.substring(0, 30)}..."`
  });
  return hasContent;
}

console.log('\n🔍 Vérification pré-déploiement Vercel\n');

// Frontend checks
console.log('📦 Frontend:');
checkFile('package.json', 'package.json exists');
checkFile('vite.config.js', 'vite.config.js exists');
checkFile('src/main.jsx', 'src/main.jsx exists');
checkFile('index.html', 'index.html exists');
checkContent('package.json', '"build": "vite build"', 'Build script configured');

// Backend checks
console.log('\n🔧 Backend:');
checkFile('backend/server.js', 'backend/server.js exists');
checkFile('backend/package.json', 'backend/package.json exists');
checkFile('backend/db.js', 'backend/db.js exists');
checkContent('backend/server.js', 'cors', 'CORS configured');
checkContent('backend/server.js', '/api/team', '/api/team endpoint exists');

// Deployment configs
console.log('\n🚀 Deployment:');
checkFile('.gitignore', '.gitignore exists');
checkFile('vercel.json', 'vercel.json exists');
checkFile('.env.example', '.env.example exists');
checkFile('DEPLOYMENT_GUIDE.md', 'DEPLOYMENT_GUIDE.md exists');

// Environment variables
console.log('\n🔐 Environment Variables:');
checkContent('vercel.json', 'DATABASE_URL', 'DATABASE_URL in vercel.json');
checkContent('.env.example', 'POSTGRES_HOST', 'Example env variables');

// Git checks
console.log('\n📚 Git:');
checkFile('.git', '.git repository exists');
checkFile('.git/config', 'Git config exists');

// Display results
console.log('\n' + '═'.repeat(60));
console.log('📊 RÉSULTATS:\n');

let passed = 0;
let failed = 0;

checks.forEach(check => {
  const status = check.status;
  const name = check.name.padEnd(40);
  const reason = check.reason ? ` (${check.reason})` : '';
  console.log(`${status} ${name}${reason}`);
  
  if (status === '✅') passed++;
  if (status === '❌') failed++;
});

console.log('\n' + '═'.repeat(60));
console.log(`\n✅ Passé: ${passed}/${passed + failed}`);

if (failed > 0) {
  console.log(`\n❌ Problèmes détectés: ${failed}`);
  console.log('\n💡 Corrections:');
  console.log('  1. Vérifier que tous les fichiers existent');
  console.log('  2. Vérifier que .env.example contient les bonnes variables');
  console.log('  3. Vérifier que vercel.json est correctement configuré');
  console.log('  4. Vérifier que .git existe (git init si nécessaire)');
  process.exit(1);
} else {
  console.log('\n✨ Tous les vérifications sont passées!');
  console.log('\n📝 Prochaine étape: npm run deploy');
  process.exit(0);
}
