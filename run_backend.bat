@echo off
title SmartTransit Kanpur - FastAPI Backend
echo =======================================================
echo   SmartTransit Kanpur - Python FastAPI Backend Server
echo   SIH Transportation ^& Logistics Prototype
echo =======================================================
echo.
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
