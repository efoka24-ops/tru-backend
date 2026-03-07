const fs = require('fs');
const path = require('path');

// Lire l'image
const imagePath = path.join(__dirname, 'uploads', 'her.jpeg');
const imageBuffer = fs.readFileSync(imagePath);
const base64 = imageBuffer.toString('base64');
const dataUrl = `data:image/jpeg;base64,${base64}`;

// Écrire dans un fichier pour affichage
fs.writeFileSync(path.join(__dirname, 'herve_image_url.txt'), dataUrl, 'utf-8');
console.log('✅ Image convertie et sauvegardée');
console.log('📝 Fichier créé: herve_image_url.txt');
console.log('🖼️  Longueur data URL:', dataUrl.length, 'caractères');
