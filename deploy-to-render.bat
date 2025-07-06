@echo off
echo 🚀 Starting deployment to Render...

REM Check if git is initialized
if not exist ".git" (
    echo ❌ Git repository not found. Please initialize git first:
    echo    git init
    echo    git add .
    echo    git commit -m "Initial commit"
    pause
    exit /b 1
)

REM Set environment to production
echo 🔧 Setting environment to production...
call npm run env:production

REM Build the project
echo 🏗️  Building the project...
call npm run build

REM Check if build was successful
if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
) else (
    echo ❌ Build failed!
    pause
    exit /b 1
)

REM Commit changes if any
git status --porcelain > temp_status.txt
set /p HAS_CHANGES=<temp_status.txt
del temp_status.txt

if not "%HAS_CHANGES%"=="" (
    echo 📝 Committing changes...
    git add .
    git commit -m "Deploy to Render - %date% %time%"
)

REM Push to remote
echo 📤 Pushing to remote repository...
git push origin main

echo ✅ Deployment script completed!
echo.
echo 📋 Next steps:
echo 1. Go to https://dashboard.render.com
echo 2. Create a new Web Service
echo 3. Connect your GitHub repository
echo 4. Use these settings:
echo    - Build Command: npm install ^&^& npm run build
echo    - Start Command: npm start
echo    - Environment: Node
echo 5. Add environment variables:
echo    - NODE_ENV=production
echo    - NEXT_PUBLIC_API_BASE_URL=https://backend-rxua.onrender.com
echo.
echo 🌐 Your app will be available at: https://event-management-frontend.onrender.com
pause 