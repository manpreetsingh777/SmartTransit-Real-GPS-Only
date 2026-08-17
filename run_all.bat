@echo off
title SmartTransit Kanpur - Master Launcher
echo ===============================================================
echo   SmartTransit Kanpur - Hybrid Intelligent Bus Tracking System
echo   SIH Transportation ^& Logistics Prototype
echo ===============================================================
echo.
echo [1/2] Launching Python FastAPI Backend Server (Port 8000)...
start "SmartTransit Backend" cmd /k "run_backend.bat"

echo [2/2] Launching React Vite Frontend Dev Server (Port 5173)...
start "SmartTransit Frontend" cmd /k "run_frontend.bat"

echo.
echo ===============================================================
echo   All services launched!
echo   • Frontend Web App:  http://localhost:5173
echo   • FastAPI Swagger:   http://localhost:8000/docs
echo   • WebSocket Live:    ws://localhost:8000/ws/live
echo ===============================================================
echo.
timeout /t 3 /nobreak >nul
start http://localhost:5173
