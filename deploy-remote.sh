#!/bin/bash

# Remote deployment script - run from your local machine
# This will SSH into your server and deploy

echo "🚀 Deploying to server..."

# Commit changes first
echo "📝 Committing local changes..."
git add .
git commit -m "Update code $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

# SSH to server and deploy
echo "📡 Deploying on server..."
ssh hari@your-server-ip 'cd mentari-app && git pull && npm install && npm run build && pm2 restart mentari-app && pm2 save'

echo "✅ Deployment completed!"
