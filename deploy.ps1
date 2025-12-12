# Script de déploiement pour GitHub et Vercel
# Utilisation: .\deploy.ps1

$projectDir = "C:\Users\EMMANUEL\Documents\site tru"
$repoUrl = "https://github.com/efoka24-ops/tru-website.git"

Write-Host "🚀 Préparation du déploiement TRU GROUP..." -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier Git
Write-Host "✅ Vérification de Git..." -ForegroundColor Green
$gitExists = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitExists) {
    Write-Host "❌ Git n'est pas installé." -ForegroundColor Red
    exit 1
}

# 2. Vérifier Node.js
Write-Host "✅ Vérification de Node.js..." -ForegroundColor Green
$nodeExists = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeExists) {
    Write-Host "❌ Node.js n'est pas installé." -ForegroundColor Red
    exit 1
}

# 3. Naviguer vers le répertoire du projet
Set-Location $projectDir
Write-Host "✅ Répertoire: $projectDir" -ForegroundColor Green

# 4. Configuration Git
Write-Host "✅ Configuration Git..." -ForegroundColor Green
git config user.name "Emmanuel Foka"
git config user.email "efoka24-ops@gmail.com"

# 5. Ajouter les fichiers
Write-Host "✅ Ajout des fichiers..." -ForegroundColor Green
git add .

# 6. Créer un commit
Write-Host "✅ Création du commit..." -ForegroundColor Green
git commit -m "Deploy: Prepare for Vercel and GitHub deployment" 2>$null || Write-Host "   Aucun changement à committer" -ForegroundColor Yellow

# 7. Vérifier/renommer la branche
Write-Host "✅ Vérification de la branche..." -ForegroundColor Green
$branch = git rev-parse --abbrev-ref HEAD
if ($branch -ne "main") {
    git branch -M main
    Write-Host "   Branche renommée en: main" -ForegroundColor Yellow
} else {
    Write-Host "   Branche: main" -ForegroundColor Yellow
}

# 8. Ajouter le remote si nécessaire
Write-Host "✅ Configuration du remote GitHub..." -ForegroundColor Green
$remoteUrl = (git remote get-url origin 2>$null)
if ($remoteUrl -notlike "*github.com*") {
    git remote add origin $repoUrl 2>$null || git remote set-url origin $repoUrl
    Write-Host "   Remote configuré: $repoUrl" -ForegroundColor Yellow
} else {
    Write-Host "   Remote déjà configuré" -ForegroundColor Yellow
}

# 9. Push vers GitHub
Write-Host "✅ Push vers GitHub..." -ForegroundColor Green
git push -u origin main

Write-Host ""
Write-Host "🎉 Déploiement préparé avec succès!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "  1. Aller sur https://vercel.com/new" -ForegroundColor White
Write-Host "  2. Sélectionner le repository: tru-website" -ForegroundColor White
Write-Host "  3. Configurer les variables d'environnement" -ForegroundColor White
Write-Host "  4. Déployer" -ForegroundColor White
Write-Host ""
Write-Host "📚 Consultez DEPLOYMENT_GUIDE.md pour les instructions détaillées" -ForegroundColor Cyan
