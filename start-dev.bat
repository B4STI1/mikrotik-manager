@echo off
REM Script pour lancer le projet en mode développement sans Docker

echo ============================================
echo   Mikrotik Manager - Mode Developpeur
echo ============================================
echo.

REM Installer les dependances backend
echo [1/4] Installation des dependances backend...
cd backend
call npm install
cd ..

echo.
echo [2/4] Installation des dependances frontend...
cd frontend
call npm install
cd ..

echo.
echo [3/4] Lancement du backend (port 3001)...
start cmd /c "cd backend && npm run dev"

echo.
echo [4/4] Lancement du frontend (port 3000)...
start cmd /c "cd frontend && npm run dev"

echo.
echo ============================================
echo   Serveurs lancees !
echo ============================================
echo.
echo Backend: http://127.0.0.1:3001/api
echo Frontend: http://127.0.0.1:3000
echo.
echo Ouvrez votre navigateur sur: http://127.0.0.1:3000
echo.
echo Appuyez sur Ctrl+C dans chaque terminal pour arreter.
echo ============================================
