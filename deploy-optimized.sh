#!/bin/bash

# Optimized deployment script for low-resource VPS
# Uses Next.js standalone mode and builds on server with optimizations

set -e

echo "🚀 Starting optimized deployment..."

# Pull latest changes
echo "📥 Pulling changes..."
git pull origin main

# Install dependencies (only if package.json changed)
if [ package.json -nt node_modules/.package.json ]; then
  echo "📦 Installing dependencies..."
  npm ci --production=false
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npm run db:generate

# Build with Node.js memory limit (prevents crashes)
echo "🔨 Building Next.js (standalone mode)..."
NODE_OPTIONS="--max-old-space-size=1536" npm run build

# Copy standalone output to proper location
if [ -d ".next/standalone" ]; then
  echo "📦 Setting up standalone build..."
  cp -r .next/standalone/* .
  cp -r .next/static .next/standalone/.next/
fi

# Restart PM2
echo "🔄 Restarting PM2..."
pm2 restart mentari-app
pm2 save

echo "✅ Deployment completed!"
echo "💡 Tip: First build takes longer, subsequent builds are faster"
