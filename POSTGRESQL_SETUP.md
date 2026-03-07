# 🚀 POSTGRESQL SETUP - STEP BY STEP

## Step 1: Create Render PostgreSQL Database

1. Go to: https://dashboard.render.com
2. Click: "New +" → "PostgreSQL"
3. Fill in:
   - **Name**: tru-database
   - **Database**: tru_data
   - **User**: tru_user
   - **Region**: Frankfurt (same as your backend)
   - **Version**: PostgreSQL 15
   - **Plan**: FREE
4. Click "Create Database"
5. Wait 2-3 minutes for creation
6. Copy the connection string (External Database URL)
   Example: postgresql://user:password@db.render.com:5432/dbname

## Step 2: Add DATABASE_URL to Render Backend Service

1. Go to: https://dashboard.render.com
2. Select: tru-backend-o1zc service
3. Go to: Settings → Environment
4. Add new variable:
   - **Key**: DATABASE_URL
   - **Value**: [paste your PostgreSQL connection string]
5. Click "Save Changes"
6. Service will auto-redeploy

## Step 3: Migrate Data from data.json to PostgreSQL (LOCAL)

Run this command in your local backend directory:

```bash
cd backend
node migrate-to-postgres.js
```

This will import all your current data.json into PostgreSQL.

## Step 4: Verify Migration

After migration completes:
- ✅ Team members imported
- ✅ Testimonials imported
- ✅ Services imported
- ✅ Settings imported
- ✅ All other data imported

## Step 5: Test on Production

1. Go to backoffice: https://bo.trugroup.cm (or your URL)
2. Add new team member
3. Go to https://tru-backend-o1zc.onrender.com/api/team
4. Verify your new team member is there
5. Wait 15 minutes
6. Refresh again - data should still be there ✅

## Troubleshooting

### Database Connection Failed
- Check DATABASE_URL is correct
- Check Render PostgreSQL is "Available" status
- Check firewall allows external connections (Render does by default)

### Migration Errors
```bash
node migrate-to-postgres.js
```
Check console output for which records failed

### Want to Reset Database?
```bash
# WARNING: This deletes all data!
# Only run if you want fresh start
pg_dump postgresql://user:pass@host/db -c > backup.sql
# Then modify: DROP TABLE ... in the dump and re-run
```

## Next Steps After Success

1. Monitor Render backend logs daily
2. Backoffice changes now persist ✅
3. Team can safely edit from backoffice
4. Data survives container restarts ✅

---

**Questions?** Check [FIX_TEAM_DATA_PERSISTENCE.md](../FIX_TEAM_DATA_PERSISTENCE.md)
