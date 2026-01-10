# 🚀 GitHub Auto-Backup Setup

## Objective

Every time you modify data.json in the backoffice, it automatically commits and pushes to GitHub.

**Result**: Even if Render restarts, data.json is recovered from GitHub ✅

---

## 🔑 Step 1: Create GitHub Personal Access Token

1. **Go to**: https://github.com/settings/tokens
2. Click: "Generate new token" → "Generate new token (classic)"
3. **Fill in**:
   - Name: `TRU Backend Auto-Backup`
   - Expiration: `90 days` (or longer)
   - Scopes: Check ONLY:
     - ✅ `repo` (full control of private repositories)
     - ✅ `workflow` (update GitHub Action workflows)
4. Click: "Generate token"
5. **⚠️ COPY THE TOKEN** (you won't see it again!)
   - Looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 🔐 Step 2: Add Token to Backend Environment

### Local (.env file)
```bash
cd "C:\Users\EMMANUEL\Documents\site tru\backend"
```

Edit `.env` and add:
```dotenv
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Render Dashboard
1. Go to: https://dashboard.render.com
2. Service: `tru-backend-o1zc`
3. Settings → Environment
4. Add Variable:
   ```
   Key:   GITHUB_TOKEN
   Value: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
5. Click: "Save Changes"
6. Wait for redeploy

---

## ✅ Step 3: Test Locally

```bash
cd "C:\Users\EMMANUEL\Documents\site tru\backend"
npm start
```

Then in backoffice:
1. Add/edit/delete a team member
2. Save

**Check GitHub**: https://github.com/efoka24-ops/tru-backend
- Recent commits should show your changes ✅

---

## 📝 How It Works

```
Backoffice → Modify Data
              ↓
Backend → writeDataAndBackup()
              ↓
         ├→ Save data.json locally
         └→ Git auto-commit & push
              ↓
GitHub Repository Updated ✅
              ↓
Render Restart?
→ Git pull latest
→ data.json restored ✅
```

---

## 🔍 Monitor Backups

**Check backup status**:
```bash
curl https://tru-backend-o1zc.onrender.com/api/admin/backup-status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Response:
```json
{
  "lastBackup": "a1b2c3d - Add team member (2026-01-10 15:30:45 +0000)",
  "pendingChanges": 0,
  "isCommitting": false,
  "queueSize": 0
}
```

---

## ⚠️ Security Notes

- ✅ Token has LIMITED scope (only `repo` + `workflow`)
- ✅ Token expires in 90 days
- ⚠️ Never share the token
- ⚠️ If compromised, revoke at: https://github.com/settings/tokens

---

## 🧪 Test Scenario (15 minutes)

1. Add team member in backoffice
2. Check GitHub - commit created? ✅
3. Wait 15 minutes
4. Render restarts (or manually restart service)
5. Check backoffice - team member still there? ✅
6. Check API: `/api/team` - data visible? ✅

**If all ✅**: Auto-backup is working! 🎉

---

## 🐛 Troubleshooting

### "Backup not working"
1. Check: Is `GITHUB_TOKEN` in `.env`?
2. Check: Is token valid? (not expired)
3. Check: Is repo `efoka24-ops/tru-backend` correct?
4. Check: Backend logs for errors

### "Token invalid"
- Go to: https://github.com/settings/tokens
- Delete old token
- Create new one
- Update `.env` and Render

### "Git errors in logs"
- Check git config is correct
- Verify token has `repo` scope
- Check network/firewall allows git push

---

## 📊 Expected Commit Message

```
data: auto-backup - Add team member (John Doe)

Timestamp: 2026-01-10T15:30:45.123Z
Environment: production

[automated commit]
```

---

**Ready? Let's go!** 🚀

Next: Add GITHUB_TOKEN to Render, then test.
