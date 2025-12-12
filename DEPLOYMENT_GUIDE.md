# TRU GROUP - Deployment Guide

## Pre-Deployment Checklist

✅ **Backend API**
- All 14 API tests passing
- Base64 image handling implemented
- Database schema created with all 9 tables
- CORS configured for production
- Error handling in place

✅ **Frontend**
- React Vite application configured
- Image display fixed with proper validation
- API integration with error handling
- Polling every 10 seconds for data updates

✅ **Database**
- Vercel PostgreSQL configured
- All tables created and tested
- Connection pooling enabled

## GitHub Setup

### 1. Push to GitHub

```bash
cd "C:\Users\EMMANUEL\Documents\site tru"
git config user.name "Your Name"
git config user.email "your.email@example.com"
git add .
git commit -m "Initial commit: TRU GROUP website with React frontend and Express backend"
git branch -M main
git remote add origin https://github.com/efoka24-ops/tru-website.git
git push -u origin main
```

### 2. Update .gitignore

Ensure `.gitignore` exists with:
```
node_modules/
dist/
.env
.env.local
.env.production.local
*.log
.DS_Store
.vscode/
```

## Vercel Deployment

### Step 1: Frontend Deployment (Vite React App)

1. **Connect GitHub Repository**
   - Go to https://vercel.com/new
   - Select "GitHub" and authorize
   - Select `efoka24-ops/tru-website`
   - Framework Preset: **Vite**

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   No environment variables needed for frontend

4. **Deploy**
   - Click "Deploy"
   - Wait for build completion

### Step 2: Backend API Deployment

For a full-stack setup, you have two options:

#### Option A: Monorepo with Vercel (Recommended)

1. **Update vercel.json** to configure API routes
2. **Create backend API route handler**

```bash
mkdir -p api
```

Create `api/team.js`:
```javascript
import db from '../backend/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const team = await db.getTeam();
    res.status(200).json(team);
  }
}
```

#### Option B: Separate Backend Deployment (Current Setup)

For now, keep backend on current hosting and update frontend CORS:

3. **Set Environment Variables in Vercel**
   - Dashboard > Settings > Environment Variables
   - Add: `VITE_API_URL=https://your-backend-domain.com`

4. **Update frontend API calls**
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
   ```

### Step 3: Database Configuration

1. **Get Vercel Postgres Credentials**
   - Vercel Dashboard > Storage > Postgres
   - Copy connection string

2. **Add to Environment Variables**
   - `DATABASE_URL`: postgres://...
   - `POSTGRES_URL`: postgres://...

3. **Initialize Database (One-time)**
   ```bash
   node backend/reset-db.cjs
   ```

## Local Development Before Deployment

### 1. Test with Production Environment Variables

```bash
# Create .env.production.local
cp .env.example .env.production.local

# Fill in real Vercel Postgres credentials
# Then test locally:
NODE_ENV=production npm run dev
```

### 2. Test Full Build

```bash
npm run build
npm run preview
```

### 3. Verify API Connectivity

```bash
# Backend should be running
curl http://localhost:5000/api/team

# Frontend should be serving from dist/
curl http://localhost:4173
```

## Post-Deployment Verification

1. **Check Frontend**
   - Visit https://your-domain.vercel.app
   - Verify all pages load
   - Check console for errors

2. **Test API Endpoints**
   - GET /api/team
   - GET /api/testimonials
   - GET /api/solutions
   - etc.

3. **Verify Images Display**
   - Check Team page loads images
   - Check Solutions page loads images
   - Verify base64 images render correctly

4. **Monitor Vercel Logs**
   - Vercel Dashboard > Deployments
   - Check Function logs for errors
   - Monitor build logs

## Troubleshooting

### Frontend Build Fails
- Check `npm run build` locally
- Verify all imports are correct
- Check for missing environment variables

### API Not Found
- Verify vercel.json rewrites configuration
- Check backend routes in server.js
- Verify DATABASE_URL is set correctly

### Images Not Loading
- Check browser DevTools Network tab
- Verify image URLs in response
- Check CORS headers in backend

### Database Connection Error
- Verify DATABASE_URL format
- Check if IP is whitelisted (if required)
- Test connection: `psql $DATABASE_URL`

## Rollback Plan

If deployment fails:

```bash
# Revert to previous commit
git revert <commit-hash>
git push

# Vercel will auto-redeploy from main
```

---

**Deployment Time:** ~5-10 minutes
**Expected Downtime:** 0 minutes (blue/green deployment)
**Status Page:** https://status.vercel.com
