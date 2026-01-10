#!/bin/bash

# Monitor Render Deployment Status
# Shows when the backend finishes deploying after git push

echo "🔍 Checking Render backend deployment status..."
echo ""
echo "Open this link to monitor:"
echo "https://dashboard.render.com/services/tru-backend-o1zc"
echo ""
echo "Wait for status to change from 'Deploying' to 'Live' (green)"
echo ""
echo "Estimated time: 2-3 minutes"
echo ""
echo "Once it's 'Live', you can run the migration:"
echo "node complete-migration.js"
