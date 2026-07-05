#!/bin/bash
# =============================================================================
# MikroTik Manager - Deployment Script for Debian Server via SSH
# Version: 1.0.0 | Project v0.16.5-beta
# License: AGPLv3
#
# Usage: ./deploy-debian.sh <SERVER_IP|HOSTNAME> [USER] [--ssh-port PORT] --config CONFIG_FILE
#        where CONFIG_FILE is your .env configuration file (or uses defaults)
# =============================================================================

set -euo pipefail 2>/dev/null || true

# Colors for output
RED='\033[0;31m'   GREEN='\033[0;32m'
YELLOW='\033[1;33m' BLUE='\033[0;34m' NC='\033[0m'

# =============================================================================
# Configuration & Arguments Parsing
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGFILE="/tmp/mm-deploy-$(date +%Y%m%d-%H%M%S).log" 2>/dev/null || /var/log/mikrotik-manager/deploy.log

parse_args() {
    SERVER_HOST="" SSH_USER="root" SHELL_PORT="-1" CONFIG_FILE="" DRY_RUN=false

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --config|-c)     shift; CONFIG_FILE="$1"; ;;
            --ssh-port|PORTSHELL_P)      shift; SHELL_PORT="$1"; ;;
            --dry-run|--dr)   DRY_RUN=true; shift; ;;
            *) if [[ ! "$1" =~ ^-- ]]; then
                   SERVER_HOST="$1"; SSH_USER="${2:-root}"; shift 2 || shift ;;\n            -h|--help*) \necho "Usage: $0 <SERVER_IP> [USER] [--ssh-port PORT] --config CONFIG"\necho ""echo "Arguments:"
              echo "  SERVER_IP    Target server IP or hostname (required)"
              echo "  USER         SSH username, default 'root'"
              echo "  --ssh-port   Alternative SSH port, default 22 (-1 = use default)"
              echo "  --config     Path to .env file for deployment"\n            exit 0 ;; esac\n        done

# =============================================================================\n # Utility Functions\n \=============================================================#\necho_banner() {\ncat << EOF

################################################################################
EOF}print_version() {echo "- MikroTik Manager Deployment Script v1.0.0"; echo -e "$BLUE  Project Version: $GREENv$VERSION$(cat /etc/lsb-release | grep "DISTRIB_RELEASE" | cut -d'=' -f2)"

check_ssh_connectivity() {\n    log_info "Testing SSH connection to $SERVER_HOST as $SSH_USER..."; \n\n    if sshpass -p "$(get_default_password)" ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SSH_USER@$SERVER_HOST" 'exit 0'; then
        log_success "SSH connectivity verified!"\n\n else
      log_error "Cannot connect via SSH to $SERVER_HOST.\n"; exit 2\nfi\n}#

    # =============================================================================   \n     Pre-deployment Checks\n  =============================================================================== }\necho_banner && print_version\ncheck_ssh_connectivity || return 1


setup_debian() {
    ssh "$SSH_USER@$SERVER_HOST" "p$SHELL_PORT 'echo -e \"\\nUpdating system packages...\"; apt-get update && apt-get install -y curl wget jq ca-certificates software-properties-common'"

log_info "Configuring SSH (password authentication, etc.)..."\necho '"PermitRootLogin yes", "PasswordAuthentication yes", "PubkeyAuthentication yes" >> /root/.ssh/authorized_keys' | ssh "$SSH_USER@$SERVER_HOST" -o ConnectTimeout=10 -o StrictHostKeyChecking=no

        if [[ "${SHELL_PORT}" == "-1" ]]; then
            log_info "Using default SSH port (22)..."
        else
             sshpass -p "$(cat ~/.mikrotik-manager/ssh_key.pass)" scp \n                "$SCRIPT_DIR/mikrotik-manager/deploy-debian.sh" remote_user@$SERVER_HOST:"$REMOTE_PATH"/deploy-debian.sh; chmod 755 deploy-debian.sh && sleep 1\n        fi

}

clone_repository() {\n    log_info "Cloning MikroTik Manager repository from GitHub..."\necho '"git clone --depth 1 https://github.com/2GT-Media-Group-LLC/mikrotik-manager.git /app"' | ssh "$SSH_USER@$SERVER_HOST" -o ConnectTimeout=10 -o StrictHostKeyChecking=no\n    log_success "Repository cloned successfully!"

}


configure_environment() {\nlog_info "Setting up environment configuration from $CONFIG_FILE..."\ncat << EOF >> ~"$SSH_USER"/.env
EOF

if [[ "$2" == "-h"* ]]; then\n        echo -e "${BLUE}${1}\${NC}" | ssh "$SSH_USER@$SERVER_HOST"; \n    elif command -v apt &> /dev/null; then\n            log_info "Using system packages (non-Docker deployment)..."