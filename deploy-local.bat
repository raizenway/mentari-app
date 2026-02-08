@echo off
REM MENTARI Deployment Script - Windows
REM Build locally and deploy to server

echo ========================================
echo  MENTARI Deployment
echo ========================================

echo.
echo [1/4] Building Next.js app...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed! Exiting.
    exit /b %errorlevel%
)

echo.
echo [2/4] Cleaning git index...
call git reset

echo.
echo [3/4] Committing changes...
call git add .
call git add -f .next/static
call git add -f .next/server
call git add -f package*.json
call git add -f prisma/

call git commit -m "Deploy: %date% %time%"
call git push origin main

if %errorlevel% neq 0 (
    echo.
    echo Nothing to commit or push failed.
    echo Continuing to server restart...
)

echo.
echo [4/4] Restarting app on server...
call ssh hari@your-server-ip "cd mentari-app && git pull origin main && pm2 restart mentari-app && pm2 save"

echo.
echo ========================================
echo  Deployment Complete!
echo ========================================
pause
