#!/bin/bash

# Script de déploiement sur Vercel
# Usage: ./deploy-vercel.sh

echo "🚀 Déploiement TRU GROUP sur Vercel"
echo "===================================="

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé"
    echo "📦 Installation: npm install -g vercel"
    exit 1
fi

# 1. Déployer le Backend
echo ""
echo "1️⃣  Déploiement du Backend..."
cd backend
vercel --prod --name tru-backend
BACKEND_URL=$(vercel ls --json | jq -r '.deployments[0].url')
echo "✅ Backend déployé: $BACKEND_URL"
cd ..

# 2. Mettre à jour les URLs du backoffice
echo ""
echo "2️⃣  Configuration du Backoffice..."
sed -i "s|http://localhost:5000|https://$BACKEND_URL|g" src/App.jsx
sed -i "s|http://localhost:5000|https://$BACKEND_URL|g" src/pages/*.jsx

# 3. Déployer le Frontend
echo ""
echo "3️⃣  Déploiement du Frontend..."
vercel --prod --name tru-frontend
echo "✅ Frontend déployé"

# 4. Déployer le Backoffice
echo ""
echo "4️⃣  Déploiement du Backoffice..."
cd backoffice
vercel --prod --name tru-backoffice
echo "✅ Backoffice déployé"
cd ..

echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "📱 Accès aux applications:"
echo "  Frontend: https://tru-frontend.vercel.app"
echo "  Backoffice: https://tru-backoffice.vercel.app"
echo "  Backend API: https://$BACKEND_URL"
