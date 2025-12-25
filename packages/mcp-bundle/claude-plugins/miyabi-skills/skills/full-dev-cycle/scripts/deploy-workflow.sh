#!/bin/bash
# Full Development Cycle - Deploy Workflow
# Usage: ./deploy-workflow.sh [commit-message] [--skip-tests] [--force]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
MAIN_BRANCH="${MAIN_BRANCH:-main}"
SKIP_TESTS=false
FORCE=false

# Parse arguments
COMMIT_MSG="${1:-}"
shift || true
for arg in "$@"; do
    case $arg in
        --skip-tests) SKIP_TESTS=true ;;
        --force) FORCE=true ;;
    esac
done

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# Phase 1: Pre-flight checks
phase1_preflight() {
    log "Phase 1: Pre-flight checks"
    
    # Check git status
    if ! git diff --quiet || ! git diff --cached --quiet; then
        success "Changes detected"
    else
        error "No changes to commit"
    fi
    
    # Check branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" = "$MAIN_BRANCH" ] && [ "$FORCE" = false ]; then
        warn "On main branch. Use feature branch or --force"
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    success "Branch: $CURRENT_BRANCH"
    
    # Check Docker
    if ! docker info > /dev/null 2>&1; then
        error "Docker not running"
    fi
    success "Docker available"
}

# Phase 2: Git operations
phase2_git() {
    log "Phase 2: Git operations"
    
    # Stage all changes
    git add -A
    success "Changes staged"
    
    # Commit
    if [ -z "$COMMIT_MSG" ]; then
        error "Commit message required"
    fi
    git commit -m "$COMMIT_MSG"
    success "Committed: $COMMIT_MSG"
    
    # Push
    git push origin "$CURRENT_BRANCH" 2>/dev/null || \
    git push -u origin "$CURRENT_BRANCH"
    success "Pushed to origin/$CURRENT_BRANCH"
}

# Phase 3: Run tests (optional)
phase3_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        warn "Skipping tests (--skip-tests)"
        return
    fi
    
    log "Phase 3: Running tests"
    
    # Check for test script
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        npm test || error "Tests failed"
        success "Tests passed"
    elif [ -f "Makefile" ] && grep -q "test:" Makefile; then
        make test || error "Tests failed"
        success "Tests passed"
    else
        warn "No test configuration found"
    fi
}

# Phase 4: Docker deployment
phase4_deploy() {
    log "Phase 4: Docker deployment"
    
    # Stop current services
    if [ -f "$COMPOSE_FILE" ]; then
        docker compose -f "$COMPOSE_FILE" down 2>/dev/null || true
        success "Services stopped"
        
        # Rebuild and start
        docker compose -f "$COMPOSE_FILE" up -d --build
        success "Services started"
        
        # Wait for health
        sleep 5
        
        # Check status
        docker compose -f "$COMPOSE_FILE" ps
    else
        warn "No compose file found, skipping container deployment"
    fi
}

# Phase 5: Verification
phase5_verify() {
    log "Phase 5: Verification"
    
    # Check containers
    if [ -f "$COMPOSE_FILE" ]; then
        UNHEALTHY=$(docker compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null | \
                    grep -c '"unhealthy"' || echo "0")
        if [ "$UNHEALTHY" -gt 0 ]; then
            warn "$UNHEALTHY unhealthy container(s)"
            docker compose -f "$COMPOSE_FILE" logs --tail=20
        else
            success "All containers healthy"
        fi
    fi
    
    # Check common ports
    for port in 3000 8000 8080; do
        if nc -z localhost $port 2>/dev/null; then
            success "Port $port is open"
        fi
    done
}

# Main execution
main() {
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║     Full Development Cycle Deploy      ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    
    phase1_preflight
    echo ""
    phase2_git
    echo ""
    phase3_tests
    echo ""
    phase4_deploy
    echo ""
    phase5_verify
    
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║          Deployment Complete!          ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    
    # Summary
    log "Summary:"
    echo "  Branch: $CURRENT_BRANCH"
    echo "  Commit: $COMMIT_MSG"
    echo "  Compose: $COMPOSE_FILE"
    echo ""
    log "Next steps:"
    echo "  - Create PR: gh pr create"
    echo "  - View logs: docker compose logs -f"
    echo "  - Monitor: docker stats"
}

main
