#!/bin/bash

# MENTARI App Deployment Script
# Run this on the server after pushing changes to git

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Pull latest changes
echo "📥 Pulling latest changes from git..."
git pull origin main

# Install dependencies (if package.json changed)
echo "📦 Installing dependencies..."
npm install --production=false

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npm run db:generate

# Build the application
echo "🔨 Building Next.js app..."
npm run build

# Restart PM2 process
echo "🔄 Restarting PM2 process..."
pm2 restart mentari-app

# Save PM2 configuration
pm2 save

echo "✅ Deployment completed successfully!"
echo "📊 Check status with: pm2 status"
echo "📋 View logs with: pm2 logs mentari-app"
