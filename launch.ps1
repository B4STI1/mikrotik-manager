# Script PowerShell pour lancer Mikrotik Manager
# Lance le backend et le frontend en mode développement

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Mikrotik Manager - Mode Development" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$HTTP_PORT = "6464"
$HTTPS_PORT = "6464"
$BACKEND_PORT = "3001"
$FRONTEND_PORT = "3000"

# Verifier que Node.js est installe
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Erreur : Node.js n'est pas installe !" -ForegroundColor Red
    Write-Host "Veuillez installer Node.js depuis : https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host "[1/5] Verification des installations..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "  Node.js : $nodeVersion" -ForegroundColor Green

if (Test-Path "backend") {
    $packageJson = Get-Content "backend\package.json" -Raw | ConvertFrom-Json
    Write-Host "  Backend : $(( $packageJson.dependencies['express'] ) -join ',')" -ForegroundColor Green
}

if (Test-Path "frontend") {
    $frontendPkg = Get-Content "frontend\package.json" -Raw | ConvertFrom-Json
    Write-Host "  Frontend: React $frontendPkg.dependencies.react" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/5] Installation des dependencies..." -ForegroundColor Yellow

# Installer les dependencies backend
Write-Host "  [Backend] Installation..." -ForegroundColor Gray
cd backend
npm install 2>&1 | Out-Null
cd ..

# Installer les dependencies frontend
Write-Host "  [Frontend] Installation..." -ForegroundColor Gray
cd frontend
npm install 2>&1 | Out-Null
cd ..

Write-Host ""
Write-Host "[3/5] Generer le certificat SSL..." -ForegroundColor Yellow

# Generer le certificat SSL
if (-not (Test-Path "certs")) {
    Write-Host "  Creation du repertoire certs..." -ForegroundColor Gray
    New-Item -ItemType Directory -Path "certs" -Force | Out-Null

    # Generer le certificat SSL self-signed
    $certCommand = "openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
        -keyout 'certs\server.key' `
        -out 'certs\server.crt' `
        -subj '/C=FR/ST=Ile-de-France/L=Paris/O=MikroTikManager/OU=Self-Signed/CN=localhost'"

    Write-Host "  Generation du certificat SSL..." -ForegroundColor Gray
    openssl $certCommand 2>&1 | ForEach-Object {
        if ($_ -match "Generating") {
            Write-Host $_ -ForegroundColor Green
        }
    }
} else {
    Write-Host "  Certificate exists..." -ForegroundColor Green
}

Write-Host ""
Write-Host "[4/5] Configuration des ports..." -ForegroundColor Yellow

# Configurer les ports dans .env
$envContent = Get-Content ".env" -Raw
$envContent = $envContent -replace 'HTTP_PORT=.*', "HTTP_PORT=$HTTP_PORT"
$envContent = $envContent -replace 'HTTPS_PORT=.*', "HTTPS_PORT=$HTTPS_PORT"
Set-Content ".env" -Value $envContent -NoNewline

Write-Host "  HTTP_PORT : $HTTP_PORT" -ForegroundColor Green
Write-Host "  HTTPS_PORT : $HTTPS_PORT" -ForegroundColor Green
Write-Host "  Backend : $BACKEND_PORT" -ForegroundColor Green
Write-Host "  Frontend : $FRONTEND_PORT" -ForegroundColor Green

Write-Host ""
Write-Host "[5/5] Lancement des serveurs..." -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host " Backend API : http://127.0.0.1:$BACKEND_PORT" -ForegroundColor Green
Write-Host " Frontend :   http://127.0.0.1:$FRONTEND_PORT" -ForegroundColor Green
Write-Host " Acces HTTPS : http://127.0.0.1:$HTTPS_PORT" -ForegroundColor Green
Write-Host ""
Write-Host " Appuyez sur Ctrl+C dans chaque terminal pour arreter" -ForegroundColor Yellow
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan

# Lancer le backend
$backendProcess = Start-Process powershell -ArgumentList "-Command", "cd '$PWD\backend'; npm run dev" -WindowStyle Normal -PassThru
Write-Host "  Backend PID : $($backendProcess.Id)" -ForegroundColor Gray

# Lancer le frontend
$frontendProcess = Start-Process powershell -ArgumentList "-Command", "cd '$PWD\frontend'; npm run dev" -WindowStyle Normal -PassThru
Write-Host "  Frontend PID: $($frontendProcess.Id)" -ForegroundColor Gray

# Attendre quelques secondes puis ouvrir le navigateur
Start-Sleep -Seconds 5
Write-Host ""
Write-Host "Ouvrant le navigateur automatiquement..." -ForegroundColor Green
Start-Process "http://127.0.0.1:$FRONTEND_PORT"

Write-Host ""
Write-Host "Serveurs lancs avec succes !" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan

# Attendre la fin des processus
$backendProcess.WaitForExit()
$frontendProcess.WaitForExit()

Write-Host ""
Write-Host "Arret des serveurs." -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan
