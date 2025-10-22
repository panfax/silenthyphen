#!/bin/bash

# Server-side deployment script for SilentHyphen
# Run this on your Hetzner server

set -e

echo "🔄 Updating SilentHyphen on server..."

cd /var/www/silenthyphen

echo "📥 Pulling latest changes..."
sudo git pull

echo "📦 Installing dependencies..."
sudo npm install

echo "🔨 Building project..."
sudo npm run build

echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo "🌐 SilentHyphen is now live!"
