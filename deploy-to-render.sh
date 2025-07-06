#!/bin/bash

# Deploy to Render Script
echo "🚀 Starting deployment to Render..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  You're not on the main branch. Current branch: $CURRENT_BRANCH"
    echo "   Consider switching to main: git checkout main"
fi

# Set environment to production
echo "🔧 Setting environment to production..."
npm run env:production

# Build the project
echo "🏗️  Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Commit changes if any
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Committing changes..."
    git add .
    git commit -m "Deploy to Render - $(date)"
fi

# Push to remote
echo "📤 Pushing to remote repository..."
git push origin main

echo "✅ Deployment script completed!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://dashboard.render.com"
echo "2. Create a new Web Service"
echo "3. Connect your GitHub repository"
echo "4. Use these settings:"
echo "   - Build Command: npm install && npm run build"
echo "   - Start Command: npm start"
echo "   - Environment: Node"
echo "5. Add environment variables:"
echo "   - NODE_ENV=production"
echo "   - NEXT_PUBLIC_API_BASE_URL=https://backend-rxua.onrender.com"
echo ""
echo "🌐 Your app will be available at: https://event-management-frontend.onrender.com" 