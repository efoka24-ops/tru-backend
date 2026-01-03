// Script pour tester la connexion admin et récupérer le token
import crypto from 'crypto';
import fs from 'fs';

// Lire data.json pour trouver l'admin
const data = JSON.parse(fs.readFileSync('./backend/data.json', 'utf8'));

console.log('📋 Membres de l\'équipe avec comptes:');
data.memberAccounts.forEach((account, i) => {
  console.log(`${i + 1}. Email: ${account.email}`);
  console.log(`   Role: ${account.role}`);
  console.log(`   Status: ${account.status}`);
  console.log(`   Password Hash: ${account.passwordHash}`);
  console.log('');
});

// JWT generation (même secret que le backend)
function generateJWT(payload, secret = 'tru_jwt_secret_key_2025', expiresIn = '24h') {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Date.now();
  const expiresInMs = 24 * 60 * 60 * 1000;
  
  const body = {
    ...payload,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + expiresInMs) / 1000)
  };
  
  const headerEncoded = Buffer.from(JSON.stringify(header)).toString('base64url');
  const bodyEncoded = Buffer.from(JSON.stringify(body)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${headerEncoded}.${bodyEncoded}`)
    .digest('base64url');
  
  return `${headerEncoded}.${bodyEncoded}.${signature}`;
}

// Trouver l'admin
const adminAccount = data.memberAccounts.find(a => a.role === 'admin');
if (adminAccount) {
  const adminMember = data.team.find(m => m.id === adminAccount.memberId);
  console.log('👤 Admin trouvé:');
  console.log(`   Email: ${adminAccount.email}`);
  console.log(`   Member: ${adminMember?.name || 'Unknown'}`);
  
  // Générer un token admin
  const token = generateJWT({
    memberId: adminAccount.memberId,
    email: adminAccount.email,
    role: adminAccount.role
  });
  
  console.log('\n✅ Token Admin Généré:');
  console.log(token);
  console.log('\n📋 Instructions:');
  console.log('1. Ouvrez le DevTools (F12)');
  console.log('2. Allez dans Console');
  console.log('3. Exécutez:');
  console.log(`   localStorage.setItem('adminToken', '${token}')`);
  console.log('4. Rechargez la page');
  console.log('5. Le dropdown devrait afficher les membres !');
} else {
  console.log('❌ Aucun admin trouvé dans les comptes');
}
