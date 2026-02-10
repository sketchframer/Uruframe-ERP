@echo off
:: ──────────────────────────────────────────────────
:: Structura ERP — Production startup (Windows)
:: Runs: backend (FastAPI) + frontend (Vite preview)
:: ──────────────────────────────────────────────────
title Structura ERP — Production

cd /d "%~dp0"

echo ============================================
echo   Structura ERP — Production
echo   %date% %time%
echo ============================================
echo.

:: 1. Run database migrations
echo [1/3] Running database migrations...
cd backend
uv run alembic upgrade head
if errorlevel 1 (
    echo ERROR: Migration failed.
    pause
    exit /b 1
)
cd ..

:: 2. Build frontend
echo [2/3] Building frontend...
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed.
    pause
    exit /b 1
)

:: 3. Start backend + frontend preview in parallel
echo [3/3] Starting servers...
echo.
echo   Backend  : http://localhost:8000
echo   Frontend : http://localhost:4173
echo   Health   : http://localhost:8000/health
echo.
echo   Press Ctrl+C to stop both servers.
echo.

start "Structura Backend" cmd /k "cd /d "%~dp0backend" && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000"
npm run preview
