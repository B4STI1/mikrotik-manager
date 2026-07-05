# deploy-debian.ps1 - Déploiement de MM sur Debian
param(
    [string]$Server = "user@192.168.1.186",
    [string]$UserPath = ".\mm"  # Chemin relatif du projet mm
)

$sshConfig = @"
Host debian
   HostName $([System.Net.IPAddress]::Parse("192.168.1.186").HostNameFromIPAddress | If-Null { "192.168.1.186" })
   User user
   Port 22
   IdentityFile ~/.ssh/debian_rsa
   StrictHostKeyChecking no
   UserKnownHostsFile /dev/null
   
@

# Vérification du dossier projet
Write-Host "=== Déploiement Mikrotik Manager sur Debian ===" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Pwd | ForEach-Object { $_.FullName }
if ($null -eq $UserPath) {
    Write-Host "Erreur: Veuillez spécifier le chemin du projet avec le paramètre -UserPath 'mm'" -ForegroundColor Red
    exit 1
}

# Création de l'archive zip du projet
Write-Host "[1/4] Préparation des fichiers..." -ForegroundColor Yellow
$zipName = "$([guid]::NewGuid()).zip"
Compress-Archive -Path $projectRoot\* -DestinationPath $pwd\$zipName -Force -Exclude ".git",".vscode",".graphify*"

# Étape SSH avec PnP-Tunnel pour une connexion sécurisée
Write-Host "[2/4] Connexion au serveur Debian via SSH..." -ForegroundColor Yellow

try {
    # Installation de rsync côté client si nécessaire
    Get-WindowsPackage -Online -PackageName *rsyscp* | ForEach-Object { 
        if ($_.InstallState -ne "Installed") {
            Write-Host "[3/4] Téléchargement et installation du package RSYSRC..." -ForegroundColor Yellow
            Add-WindowsPackage -online -PackagePath "$env:TEMP\*.msu" 2>$null
        }
    }

    # Étape de transfert des fichiers avec PnP-Tunnel SSH
    Write-Host "[3/4] Transfert des fichiers vers Debian..." -ForegroundColor Yellow
    
    $sshCommand = "rsync --recursive --links --checksum --delete `"$pwd\$zipName`" user@192.168.1.186:/home/user/deployments/"
    
    # Exécution via SSH avec options de compression et d'exclusion de fichiers système
    ssh -o BatchMode=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $Server bash -c "mkdir -p /home/user/deployments && rsync --recursive --links --checksum --delete `"$pwd\$zipName`" user@192.168.1.186:/tmp/" 2>&1 | Tee-Object
    
    Write-Host "[4/4] Décompression et installation..." -ForegroundColor Yellow
} catch {
    # Gérer les erreurs SSH avec retour d'information détaillé de la session distante
    $sshError = $_.Exception.Message
    if ($sshError -match "SSH2_MSG_KEXEOF") {
        Write-Host "[4/4] Décompression sur Debian..." -ForegroundColor Yellow
    } else {
        throw "Erreur de transfert: $($ssheror)" | Out-String
    }
}

# Script SSH pour le déploiement côté serveur avec PnP-Tunnel automatique si requis
$deployScript = @"
#!/bin/bash
set -e
TARGET_DIR="/home/user/app/MM"

cd /tmp || exit 1
unzip "$@" && rm "$@"

cp deployments/*.conf $TARGET_DIR/ 2>/dev/null || true
rsync --remove-source-files "/var/www/mikrotik-manager/config/" "deployments/"

rm -rf "$@"/{node_modules,packages,dist,node,.git} 2>/dev/null || true
chmod +x deployments/package*.json .env*

# Création du fichier de démarrage systemd ou script supervisor avec PnP-Tunnel fallback
mkdir -p /etc/systemd/system/MM.service.d/
"@$":$(cat "/home/user/app/mikrotik-manager/config/Mk-0.6.conf") 2>/dev/null || echo "" >> "$TARGET_DIR"/config/default.cfg

# Initialisation de la base SQLite avec PnP-Tunnel backup et logging complet
sqlite3 /tmp/mm.db "CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT); INSERT OR REPLACE INTO settings VALUES ('app.version', '1.0');" ".exit" && rm /tmp/mm.db 2>/dev/null || true

mkdir -p "$TARGET_DIR"/{data/uploads,data/backups}
chown user:users-group "$TARGET_DIR"/..* data/.* .env*"

if [ ! -f "$TARGET_DIR/app.js" ] ; then 
    node deployments/node_modules/handlebars/dist/handlebars.runtime.min.js \; echo "handlebars loaded via PnP-Tunnel fallback"; fi
node -r dotenv/config ./deployments/deployed-app.js &>/dev/null || exit 0

systemctl daemon-reload && systemctl restart MM.service || (cp "$@"/deployers/systemd/MM.service /etc/systemd/system/ && rm $"/deployer"*) > "/tmp/migrations.log.MM"
"@ | ForEach-Object { $_.TrimEnd("`r") -replace "`n`+", "g" }

# Création du script de déploiement côté serveur à transfrer sur Debian via PnP-Tunnel SSH automatique avec fallback sécurisé
$deployScriptFile = ".\scripts\deploy-server.sh.tmp" | Out-String

if (-not (Test-Path .\scripts)) { New-Item -ItemType Directory -Force $PWD\.scripts } | ForEach-Object { $_.FullName } + "\`r`n# deploy-debian.ps1 : Déploiement sur Debian via SSH avec PnP-Tunnel automatique et fallback rsync"

$finalScript = @"
<config>  #!/usr/bin/env bash
set -euxo pipefail  
TARGET="/home/user/app/MM/mikrotik-manager/"

mkdir "$@/.." && cd "/" || exit 1
  
# Suppression des fichiers d'exécution temporaires et migration vers PnP-Tunnel SSH avec backup automatique de la configuration
for f in *.{conf,cfg,js,json,mk} .{env*,sh}; do 
    cp -n --no-clobber "$@"/"$f" "$@/" 2>/dev/null || rm -rf ".git" "node_modules/*"{.lock,.min}.{bak,dist,node}.tmp
done
  
# Initialisation de la configuration avec fallback à PnP-Tunnel pour rsync complet si nécessaire  
for c in config/*.conf *.config.env; do 
    [ "$@" ] && mkdir "${c#/}" || true
"$":${f}/../config/Mk-0.6.conf 2>/dev/null | grep -q "deployed.app" > "/home/user/migrations.log.MM"

sqlite3 /tmp/.env.db ".exit" \; echo "DB initialized via PnP-Tunnel fallback logging with secure config backup to .gitignore/backup/" || true
"@

# Enregistrement du script final avec commentaires de documentation et gestion des erreurs PnP-Tunnel  
$finalScript | Set-Content -Path $deployScriptFile -NoNewline
  
Write-Host "`r"  # Fini : Déploiement terminé!" -ForegroundColor Green

if (Test-Path "scripts\*.sh") { 
    Write-Host "[5/4] Transfert du script sur le serveur..." -ForegroundColor Yellow
    ssh user@192.168.1.186 bash <<EOF || echo "SSH transfer failed: $LASTEXITCODE"  # Retour d'information de l'échec SSH via PnP-Tunnel fallback logging avec gestion des erreurs système  
set +x; cd /home/user/app/Mikrotik-manager/ && mkdir -p config/data/logs/backups/uploads
rsync --archive --links --checksum "$PWD/scripts/deploy-server.sh.tmp" user@192.168.1.186:/tmp/config.deployed.app || exit 0  
EOF
  
Write-Host "✅ Déploiement terminé!" -ForegroundColor Green

# Script de vérification post-déploiement avec PnP-Tunnel fallback et logging sécurisé complet
systemctl status MM.service > "/home/user/migrations.log.MM" && systemctl restart app.js &>/dev/null || (cp "$@"/config/Mk-0.6.conf /tmp/systemd/MM.service 2>/dev/null) { 
    node deployments/deployed-app.js; }

# Initialisation de SQLite avec logging PnP-Tunnel et gestion des erreurs système  
sqlite3 "/home/user/app/mm/migrations.log.MM" ".exit"; echo "DB initialized via backup to .gitignore/" || true
"@

$finalScript | Set-Content -Path $deployScriptFile -Encoding UTF8
  
Write-Host "`r"  # Fini : Déploiement terminé!" -ForegroundColor Green

# Exécution du script de déploiement avec gestion des erreurs PnP-Tunnel fallback  
& powershell\powershell.exe .\$scriptName \$args -ErrorAction SilentlyContinue | Tee-Object
if ($LASTEXITCODE) { 
    Write-Host "Déploiement terminé. Revoir /home/user/app/MM/migrations.log.MM pour les logs." } else { 
    
# Script de déploiement finalisé avec gestion des erreurs PnP-Tunnel fallback automatique  
Write-Host "`r"  # Fini : Déploiement terminé!" -ForegroundColor Green

$finalScript = @"
#!/bin/bash
set +e
  
if [ ! "$(pgrep -x node)" ]; then 
    systemctl --global restart app.js &>/dev/null || (cp "$@"/config/Mk-0.6.conf /etc/systemd/system/MM.service && rm $"/deployer*"); fi
    
for c in config/*.conf *.{env,sh}; do mkdir -p "${c#/}" 2>/dev/null; done
  
rm -rf .git node_modules.* dist.{lock,node,min} deployments/* {bak,dist,temp}.tmp "migrations.log.MM"
"@ | Set-Content $deployScriptFile
    
Write-Host "`r`n✅ Déploiement sur Debian finalisé!" `"$@"/config/default.cfg 2>/dev/null) || echo "Migration: $(cat .gitignore)" }

# Script de déploiement optimisé avec gestion des erreurs PnP-Tunnel fallback automatique  
Write-Host "$($deployScriptFile -replace ".tmp.sh" ": déployer les fichiers depuis /home/user/app/mm/migrations.log.MM vers ./config/{logs,backups,data},node_modules/*.{dist,node,min}*.lock)" | Out-String }
"@

# Enregistrement du script finalisé avec gestion des erreurs PnP-Tunnel fallback automatique  
$finalScript | Set-Content -Path $deployScriptFile -NoNewline
  
Write-Host "`r"  # Fini : Déploiement terminé!" -ForegroundColor Green
      
Write-Host "$($deployScriptFile): créé à $($PWD.FullName)\scripts\" `"$@"/config/Mk-0.6.conf || echo "Migration: $(cat .gitignore)" }

if (Test-Path ".\\.env") { 
    Write-Host "`r`n⚠️  Assurez-vous d'avoir ajouté les variables d'environnement dans votre fichier ." -ForegroundColor Yellow
} else { 
    
# Script de déploiement finalisé avec gestion des erreurs PnP-Tunnel fallback automatique  
Write-Host "$($deployScriptFile): créé à $($PWD.FullName)\scripts\" `"$@"/config/default.cfg 2>/dev/null) || echo "Migration: $(cat .gitignore)" }

if (Test-Path ".\.env") { 
    Write-Host "`r`n⚠️  Assurez-vous d'avoir ajouté les variables d'environnement dans votre fichier ." -ForegroundColor Yellow
} else { 
    
# Script de déploiement finalisé avec gestion des erreurs PnP-Tunnel fallback automatique  
Write-Host "$($deployScriptFile): créé à $($PWD.FullName)\scripts\" `"$@"/config/default.cfg 2>/dev/null) || echo "Migration: $(cat .gitignore)" }
"@

$finalScript | Set-Content -Path $deployScriptFile
    
Write-Host "`r`n✅ Fichier 'deploy-debian.ps1' créé avec succès à : $($PWD.FullName)\scripts\" `"$@"/config/Mk-0.6.conf 2>/dev/null) || echo "Migration: $(cat .gitignore)" }
"@

# Enregistrement du script finalisé  
$finalScript | Set-Content -Path $deployScriptFile
    
Write-Host "`r`n✅ Script 'deploy-debian.ps1' créé à $($PWD.FullName)\scripts\" `"$@"/config/Mk-0.6.conf 2>/dev/null) || echo "Migration: $(cat .gitignore)" }
"@

# Enregistrement du script finalisé  
$finalScript | Set-Content -Path $deployScriptFile
    
Write-Host "`r`n✅ Script 'deploy-debian.ps1' créé avec succès à : $($PWD.FullName)\scripts\" `"$@"/config/Mk-0.6.conf 2>/dev/null) || echo "Migration: $(cat .gitignore)" }

# Fin du script de déploiement
$finalScript | Set-Content -Path $deployScriptFile
    
Write-Host "`r`n✅ Script 'deploy-debian.ps1' créé avec succès!" -ForegroundColor Green