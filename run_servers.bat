@echo off
title CCTNS Upgrade command center launcher
echo =======================================================
echo     CCTNS 1.0 to 2.0 UPGRADE DASHBOARD LAUNCHER
echo =======================================================
echo.
echo Starting Backend API Server (Port 5000)...
start "CCTNS Backend API Server" cmd /k "cd backend && npm start"

echo.
echo Starting Frontend React/Vite App (Port 3000)...
start "CCTNS Frontend React App" cmd /k "cd frontend && npm run dev"

echo.
echo =======================================================
echo SUCCESS: Both servers are starting up!
echo - Frontend URL: http://localhost:3000
echo - Backend URL: http://localhost:5000
echo =======================================================
echo.
pause
