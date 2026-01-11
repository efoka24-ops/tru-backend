# ✅ RENDER DEPLOYMENT CHECKLIST - DATA PERSISTENCE FIX

## Pre-Deployment Verification

- [ ] Git changes are committed locally
  ```bash
  git status
  git add .
  git commit -m "fix: data persistence on Render - set DATA_DIR env var"
  ```

- [ ] `package.json` has been updated with `DATA_DIR` in start script
  ```bash
  grep "DATA_DIR=/opt/render/project" package.json
  ```

- [ ] `gitAutoBackupService.js` uses correct paths
  ```bash
  grep "const DATA_FILE = 'data.json'" backend/services/gitAutoBackupService.js
  grep "cd \"\${DATA_DIR}\"" backend/services/gitAutoBackupService.js
  ```

## Render Dashboard Configuration

1. **Environment Variables** (Settings → Environment)
   - [ ] Set `DATA_DIR=/opt/render/project/src/backend`
   - [ ] Set `GITHUB_TOKEN=<your_token>` (if using auto-backup)
   - [ ] Keep `NODE_ENV=production`
   - [ ] Keep `PORT=10000`

2. **Disk → Persistent Disk**
   - [ ] Mount Path: `/opt/render/project/src/backend`
   - [ ] Size: At least 1GB

3. **Deploy**
   - [ ] Push code to GitHub
   - [ ] Trigger manual deploy on Render
   - [ ] Wait for "Deployed" status

## Post-Deployment Testing

1. **Check Backend Logs**
   - [ ] Should see: `📂 Volume persistant: /opt/render/project/src/backend`
   - [ ] Should see: `📂 Chemin DATA_FILE: /opt/render/project/src/backend/data.json`
   - [ ] Should NOT see: "backend/backend/" git warning

2. **Test Data Persistence**
   - [ ] Create a team member in Backoffice → GET /api/team shows it ✅
   - [ ] Wait 5 minutes for periodic backup
   - [ ] Refresh frontend → Team member still there ✅
   - [ ] Manually trigger Render "Redeploy"
   - [ ] Wait 60 seconds for server startup
   - [ ] Check frontend again → Team member STILL there ✅

3. **Check Git Backup (if GITHUB_TOKEN is set)**
   - [ ] Visit GitHub repo: `efoka24-ops/tru-backend`
   - [ ] Branch: `main`
   - [ ] File: `data.json`
   - [ ] Recent commits should show "data: auto-backup - ..."

4. **Monitor Logs for Errors**
   - [ ] No "Git command failed" errors
   - [ ] No "backend/backend/" warnings
   - [ ] Should see "No changes to commit" or successful commits every 5 minutes

## Rollback Plan (if needed)

If data persistence still fails:

1. **Check Render Persistent Disk**
   - Is the disk properly mounted?
   - Has enough space?

2. **Verify Environment Variables**
   - Render Dashboard → Environment
   - Confirm `DATA_DIR` is set correctly

3. **Check File Paths**
   - Log into Render terminal (if available)
   - Verify file exists: `ls -la /opt/render/project/src/backend/data.json`

4. **Force Redeploy**
   - Render Dashboard → Manual Redeploy
   - Watch logs during startup

## Quick Verification Commands

```bash
# Check if changes were committed
git log --oneline -5

# Verify environment in start script
cat package.json | grep "start"

# Check service file
grep "DATA_FILE" backend/services/gitAutoBackupService.js
grep "cd.*DATA_DIR" backend/services/gitAutoBackupService.js
```
