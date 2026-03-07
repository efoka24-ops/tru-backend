#!/usr/bin/env bash
# Script to deploy DATABASE_URL to Render backend service

echo "🚀 This script would update Render backend with DATABASE_URL"
echo "⚠️  You need to do this manually in Render Dashboard:"
echo ""
echo "1. Go to: https://dashboard.render.com"
echo "2. Click: tru-backend-o1zc service"
echo "3. Go to: Settings → Environment"
echo "4. Add Variable:"
echo "   Key:   DATABASE_URL"
echo "   Value: postgresql://tru_user:4NY92ftO7OHVWkOgdo4GEBvjsIAArzj7@dpg-d5hbovd6ubrc73fth2ig-a/tru_data"
echo ""
echo "5. Click: Save Changes"
echo "6. Wait for auto-redeploy (watch status until 'Live')"
echo ""
echo "✅ After that, run: npm run migrate"
