@echo off
title Digital Menu Manager - Dev Server
echo.
echo  ===================================================
echo    Digital Menu Manager - Starting Development
echo  ===================================================
echo.

set ROOT=%~dp0
set API_DIR=%ROOT%artifacts\api-server
set FRONTEND_DIR=%ROOT%artifacts\qr-menu

:: ── Step 1: Build API Server ─────────────────────────────
echo  [1/3] Building API Server...
cd /d "%API_DIR%"
call pnpm run build
if %ERRORLEVEL% neq 0 (
  echo  [ERROR] API Server build failed! Check the output above.
  pause
  exit /b 1
)
echo  [1/3] API Server built successfully.
echo.

:: ── Step 2: Start API Server in new window ───────────────
echo  [2/3] Starting API Server on port 5000...
start "API Server (port 5000)" cmd /k "cd /d "%API_DIR%" && node --enable-source-maps dist\index.mjs"
timeout /t 3 /nobreak >nul

:: ── Step 3: Start Frontend in new window ─────────────────
echo  [3/3] Starting Frontend on port 5173...
start "QR Menu Frontend (port 5173)" cmd /k "cd /d "%FRONTEND_DIR%" && node_modules\.bin\vite.cmd --config vite.config.ts"

echo.
echo  ===================================================
echo.
echo    Both servers started in separate windows!
echo.
echo    Frontend ....  http://localhost:5173
echo    Admin .......  http://localhost:5173/admin
echo    Setup .......  http://localhost:5173/admin/setup
echo    Customer ....  http://localhost:5173/menu/1
echo    API Health ..  http://localhost:5000/api/healthz
echo.
echo    FIRST TIME SETUP:
echo    1. Wait for API Server window to show "Connected"
echo    2. Open http://localhost:5173/admin/setup
echo    3. Click "Initialize Restaurant in MongoDB"
echo    4. Start adding categories and menu items!
echo.
echo  ===================================================
echo.
pause
