#!/bin/bash

# SilentHyphen Deployment Script for Hetzner
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting SilentHyphen deployment..."

# Build the project
echo "📦 Building project..."
npm run build

echo "✅ Build complete!"
echo ""
echo "📤 Next steps:"
echo "1. Push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Update SilentHyphen'"
echo "   git push"
echo ""
echo "2. On Hetzner server, run:"
echo "   cd /var/www/silenthyphen"
echo "   sudo git pull"
echo "   sudo npm install"
echo "   sudo npm run build"
echo "   sudo systemctl reload nginx"
echo ""
echo "Or use the server deployment script:"
echo "   ssh your-user@your-server 'bash -s' < deploy-server.sh"
