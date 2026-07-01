@echo off
title AI Excel Intelligence PRO
color 0A

echo.
echo  ================================================
echo    AI Excel Intelligence PRO - Starting...
echo  ================================================
echo.

cd /d "%~dp0"

echo  [1/2] Starting FastAPI Backend on port 8000...
start "FastAPI Backend" cmd /k "python -m uvicorn backend.main:app --port 8000 --no-access-log"

timeout /t 3 /nobreak >nul

echo  [2/2] Starting React Frontend on port 5173...
start "React Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 4 /nobreak >nul

echo.
echo  ================================================
echo    Both servers are running!
echo.
echo    React App  ^>  http://localhost:5173
echo    API Docs   ^>  http://127.0.0.1:8000/docs
echo  ================================================
echo.

start http://localhost:5173

pause
