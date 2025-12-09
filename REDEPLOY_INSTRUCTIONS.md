# 🚀 REDEPLOY GUIDE: Fix "Failed to fetch" Errors

## ⚡ QUICK SUMMARY
Your code is ready. Vercel is running OLD code. Need to trigger redeployment.

---

## 📋 WHY THIS IS HAPPENING

**Problem:** All three Vercel deployments return "Failed to fetch" or `FUNCTION_INVOCATION_FAILED`

**Root Cause:** 
- Latest code fixes were pushed to GitHub ✅ (commit ba921d3)
- BUT Vercel deployments still running OLD code ❌
- Latest fixes include critical Vercel compatibility fixes

**Solution:** Redeploy each service to Vercel

---

## 🔧 REDEPLOY METHODS (Pick ONE)

### METHOD 1: AUTOMATIC REDEPLOY (Simplest) ✅ RECOMMENDED
**GitHub integration will auto-redeploy when you push**

1. Add diagnostic file to git:
   ```bash
   git add DEPLOYMENT_ISSUES_DIAGNOSIS.md
   git commit -m "doc: Add deployment diagnostic"
   git push origin main
   ```

2. Wait 2-3 minutes for Vercel to auto-redeploy all 3 services
3. Check status at https://vercel.com/dashboard/

---

### METHOD 2: MANUAL REDEPLOY (Via Vercel Dashboard)
**Do this if auto-redeploy doesn't work**

#### Backend (tru-backend-five)
1. Go to: https://vercel.com/dashboard
2. Select project: **tru-backend-five**
3. Click **"Deployments"** tab
4. Find the latest deployment (should show commit ba921d3)
5. Click the **"..." menu** on the right
6. Click **"Redeploy"**
7. Wait for green "READY" status
8. **Test:** Open https://tru-backend-five.vercel.app/api/test in browser
   - Should show JSON response (not error)

#### Frontend (tru-website)
1. Go to: https://vercel.com/dashboard
2. Select project: **tru-website**
3. Verify Environment Variables:
   - Go to Settings → Environment Variables
   - Should have: `VITE_API_URL = https://tru-backend-five.vercel.app`
   - If missing, add it and redeploy
4. Click **"Deployments"** tab → Latest deployment → **"Redeploy"**
5. Wait for green "READY" status
6. **Test:** Open https://tru-website.vercel.app/
   - Press F12 (Developer Tools)
   - Go to Console tab
   - Look for log: `🔗 API_BASE_URL: https://tru-backend-five.vercel.app/api`
   - If you see team members on /team page = ✅ WORKING

#### Backoffice (tru-backoffice)
1. Go to: https://vercel.com/dashboard
2. Select project: **tru-backoffice**
3. Verify Environment Variables:
   - Go to Settings → Environment Variables
   - Should have: `VITE_BACKEND_URL = https://tru-backend-five.vercel.app`
   - If missing, add it and redeploy
4. Click **"Deployments"** tab → Latest deployment → **"Redeploy"**
5. Wait for green "READY" status
6. **Test:** Open https://tru-backoffice.vercel.app/
   - Login: admin@trugroup.cm / TRU2024!
   - Go to Team section
   - Try adding a member with image
   - Upload should work (no "Failed to fetch")

---

### METHOD 3: COMMAND LINE (If you have Vercel CLI)
```bash
cd "c:\Users\EMMANUEL\Documents\site tru"
vercel deploy --prod
```

---

## 🧪 TESTING CHECKLIST (After Redeploy)

### ✅ Backend Health
```
curl https://tru-backend-five.vercel.app/api/test
```
Expected response:
```json
{
  "status": "OK",
  "message": "Backend is responding correctly",
  "timestamp": "2025-12-09T...",
  "apiUrl": "Not set"
}
```

### ✅ Backend Team Data
```
curl https://tru-backend-five.vercel.app/api/team
```
Expected: JSON array (may be empty `[]` initially)

### ✅ Frontend Page Load
1. Open: https://tru-website.vercel.app/team
2. Press F12 → Console
3. Look for logs:
   ```
   🔗 API_BASE_URL: https://tru-backend-five.vercel.app/api
   📡 Fetching: https://tru-backend-five.vercel.app/api/services
   ✅ Services loaded: [...]
   ```
4. If you see team members = ✅ WORKING

### ✅ Backoffice Upload
1. Open: https://tru-backoffice.vercel.app/
2. Login: admin@trugroup.cm / TRU2024!
3. Go to: Settings → Team
4. Click "Add" or edit an existing member
5. Upload an image
6. Expected: Image appears (no "Failed to fetch" error)
7. If successful = ✅ WORKING

---

## 🚨 IF STILL FAILING AFTER REDEPLOY

### Step 1: Check Vercel Logs
1. Go to: https://vercel.com/dashboard/[project-name]
2. Click "Deployments"
3. Click the deployment that failed
4. Scroll down and look for error messages
5. Copy the error and share

### Step 2: Verify Environment Variables
```
Vercel Dashboard → Settings → Environment Variables
```

**Frontend (tru-website) should have:**
- `VITE_API_URL` = `https://tru-backend-five.vercel.app`

**Backoffice (tru-backoffice) should have:**
- `VITE_BACKEND_URL` = `https://tru-backend-five.vercel.app`

### Step 3: Check Browser DevTools
1. Open affected page
2. Press F12
3. Go to **Network** tab
4. Reload page
5. Look for red requests (failures)
6. Click on failed request and check Response tab for error details

### Step 4: Check CORS
- Backend should allow CORS from all origins (it does)
- If you see "CORS" error, contact support

---

## 📝 WHAT WAS FIXED (Why redeployment matters)

**Commit ba921d3:** "fix: Simplify Vercel detection and skip filesystem operations on serverless"
- **What:** Backend now detects Vercel environment and skips filesystem operations
- **Why:** Vercel Serverless doesn't have persistent filesystem
- **Impact:** Backend won't crash with file access errors

**Commit a0eee3c:** "fix: Implement Vercel-compatible storage layer (in-memory for serverless)"
- **What:** Created `backend/storage.js` for smart storage abstraction
- **Why:** Data needs to work differently on Vercel vs local
- **Impact:** Backend works on Vercel with in-memory storage

**Commit 021ca86:** "debug: Add API logging and test endpoint for debugging backend connectivity"
- **What:** Added `/api/test` endpoint and detailed logging
- **Why:** Makes debugging easier
- **Impact:** Can now test backend health easily

**Commit a06418d:** "fix: Centralize image upload with environment-based backend URL"
- **What:** Created `uploadHelper.js` for consistent uploads
- **Why:** Removes hardcoded URLs
- **Impact:** Upload works in backoffice

**Commit 78ac37d:** "fix: Configure backoffice API to use Vercel backend URL from environment"
- **What:** Backend URL now from environment variables
- **Why:** Supports different URLs for dev/prod
- **Impact:** Backoffice connects correctly to backend

---

## ⏱️ TIMELINE

- **NOW:** Start redeployment (~1 minute to trigger)
- **~2-5 min:** Vercel builds and deploys
- **After deploy:** Test each service (5 minutes)
- **Total time:** ~10 minutes

---

## 💡 LOCAL TESTING (Before Vercel)

Your backend works locally! To test:

```bash
# Terminal 1: Start backend
cd "c:\Users\EMMANUEL\Documents\site tru\backend"
npm start

# Terminal 2: Test API
curl http://localhost:5000/api/test
# Should return: {"status":"OK",...}
```

---

## 📞 SUPPORT

If issues persist:
1. Check Vercel logs for specific error
2. Verify all environment variables are set
3. Check GitHub commits are up-to-date: `git log --oneline -5`
4. Clear browser cache (Ctrl+Shift+Delete)
5. Try incognito window (private browsing)

---

**Next Step:** Pick METHOD 1 or 2 above and redeploy now! ⚡
