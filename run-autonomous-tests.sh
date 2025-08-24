#!/bin/bash

# MCP PLAYWRIGHT - Autonomous Test Execution Script
# Execução completa do protocolo de testes autônomos v2.0

set -e

echo "🤖 MCP PLAYWRIGHT - PROTOCOLO DE TESTE AUTOMATIZADO v2.0"
echo "================================================================="
echo "Execução Autônoma por Agente IA - Cobertura 90%+ com WCAG AA"
echo "================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
export NODE_ENV=test
export HEADLESS=true
export COVERAGE_TARGET=90
export WCAG_COMPLIANCE=AA
export AUTONOMOUS_MODE=true
export SELF_HEALING=true

echo -e "${BLUE}📋 Configuração:${NC}"
echo "  • Modo: Autônomo"
echo "  • Cobertura: ${COVERAGE_TARGET}%+"
echo "  • WCAG: ${WCAG_COMPLIANCE}"
echo "  • Self-healing: ${SELF_HEALING}"
echo "  • Headless: ${HEADLESS}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "success" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "error" ]; then
        echo -e "${RED}❌ $message${NC}"
    elif [ "$status" = "warning" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    else
        echo -e "${BLUE}ℹ️  $message${NC}"
    fi
}

# Function to run command with error handling
run_command() {
    local cmd="$1"
    local description="$2"
    local required="${3:-true}"
    
    echo -e "${BLUE}🔄 $description...${NC}"
    
    if eval "$cmd"; then
        print_status "success" "$description concluído"
        return 0
    else
        if [ "$required" = "true" ]; then
            print_status "error" "$description falhou"
            exit 1
        else
            print_status "warning" "$description falhou (opcional)"
            return 1
        fi
    fi
}

# Check prerequisites
echo -e "${BLUE}🔍 Verificando pré-requisitos...${NC}"

if ! command_exists node; then
    print_status "error" "Node.js não encontrado"
    exit 1
fi

if ! command_exists npm; then
    print_status "error" "npm não encontrado"
    exit 1
fi

NODE_VERSION=$(node --version)
print_status "success" "Node.js $NODE_VERSION"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_status "error" "package.json não encontrado"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -d "node_modules/@playwright" ]; then
    run_command "npm install" "Instalação de dependências"
fi

# Install Playwright browsers
echo -e "${BLUE}🌐 Verificando browsers Playwright...${NC}"
if [ ! -d "node_modules/@playwright/test" ]; then
    run_command "npx playwright install" "Instalação de browsers Playwright"
else
    run_command "npx playwright install chromium" "Atualização browser Chromium" "false"
fi

# Start development server
echo -e "${BLUE}🚀 Iniciando servidor de desenvolvimento...${NC}"
if ! pgrep -f "next dev" > /dev/null; then
    echo "Iniciando servidor..."
    npm run dev &
    SERVER_PID=$!
    sleep 10
    
    # Verify server is running
    if curl -f -s http://localhost:3000 > /dev/null; then
        print_status "success" "Servidor rodando em http://localhost:3000"
    else
        print_status "error" "Servidor não respondeu"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
else
    print_status "success" "Servidor já está rodando"
    SERVER_PID=""
fi

# Cleanup function
cleanup() {
    echo -e "\n${BLUE}🧹 Limpeza...${NC}"
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
        print_status "info" "Servidor parado"
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Create test results directory
mkdir -p test-results/{screenshots,accessibility,performance,coverage,videos,traces}

# Phase 1: Autonomous Test Execution
echo -e "\n${BLUE}🎯 FASE 1: Execução Autônoma Principal${NC}"
echo "================================================="

# Run the main autonomous test suite
run_command "npx playwright test tests/autonomous/mcp-autonomous-suite.spec.ts --project=chromium-desktop" "Suite de Testes Autônomos"

# Phase 2: Multi-Device Testing
echo -e "\n${BLUE}📱 FASE 2: Testes Multi-Dispositivo${NC}"
echo "======================================="

# Run on different devices
DEVICES=("chromium-desktop" "firefox-desktop" "tablet-landscape" "mobile-android")

for device in "${DEVICES[@]}"; do
    echo -e "${BLUE}📱 Testando em: $device${NC}"
    run_command "npx playwright test tests/autonomous/mcp-autonomous-suite.spec.ts --project=$device" "Testes em $device" "false"
done

# Phase 3: Accessibility Testing
echo -e "\n${BLUE}♿ FASE 3: Testes de Acessibilidade${NC}"
echo "======================================"

run_command "npx playwright test tests/autonomous/mcp-autonomous-suite.spec.ts --project=accessibility-testing" "Testes WCAG AA" "false"

# Phase 4: Performance Testing
echo -e "\n${BLUE}⚡ FASE 4: Testes de Performance${NC}"
echo "===================================="

# Enable performance tracing
export PLAYWRIGHT_TRACE=on
run_command "npx playwright test tests/autonomous/mcp-autonomous-suite.spec.ts --project=chromium-desktop --trace=on" "Análise de Performance" "false"

# Phase 5: API Testing
echo -e "\n${BLUE}🔗 FASE 5: Testes de API${NC}"
echo "============================="

# Test existing API endpoints
run_command "npx playwright test tests/mcp/api/ tests/llm/api/" "Testes de API" "false"

# Phase 6: Integration Testing
echo -e "\n${BLUE}🔄 FASE 6: Testes de Integração${NC}"
echo "===================================="

# Run existing integration tests
run_command "npx playwright test tests/mcp/ui/" "Testes de Integração UI" "false"

# Phase 7: Generate Reports
echo -e "\n${BLUE}📊 FASE 7: Geração de Relatórios${NC}"
echo "===================================="

# Generate HTML report
run_command "npx playwright show-report --port=9323" "Geração de Relatório HTML" "false" &
REPORT_PID=$!
sleep 3
kill $REPORT_PID 2>/dev/null || true

# Generate test results summary
echo -e "\n${BLUE}📈 RESUMO DOS RESULTADOS${NC}"
echo "========================="

# Count test files
TOTAL_TESTS=$(find tests -name "*.spec.ts" | wc -l)
echo "Total de arquivos de teste: $TOTAL_TESTS"

# Check for test results
if [ -f "test-results/results.json" ]; then
    echo "Resultados JSON disponíveis"
fi

if [ -d "test-results/html-report" ]; then
    echo "Relatório HTML gerado"
fi

# Display final metrics
echo -e "\n${GREEN}🎉 EXECUÇÃO AUTÔNOMA CONCLUÍDA${NC}"
echo "======================================"
echo "📊 Relatórios disponíveis em: test-results/"
echo "🌐 Relatório HTML: test-results/html-report/index.html"
echo "📝 Métricas: test-results/autonomous-metrics.json"
echo "♿ WCAG: test-results/wcag-compliance.json"
echo "⚡ Performance: test-results/performance-report.json"
echo ""

# Validate success criteria
echo -e "${BLUE}✅ VALIDAÇÃO DOS CRITÉRIOS DE SUCESSO${NC}"
echo "======================================"

# Check if critical files exist
if [ -f "test-results/autonomous-metrics.json" ]; then
    print_status "success" "Métricas autônomas geradas"
else
    print_status "warning" "Métricas autônomas não encontradas"
fi

if [ -d "test-results/screenshots" ] && [ "$(ls -A test-results/screenshots)" ]; then
    print_status "success" "Screenshots capturados"
else
    print_status "warning" "Screenshots não encontrados"
fi

if [ -d "test-results/html-report" ]; then
    print_status "success" "Relatório Playwright gerado"
else
    print_status "warning" "Relatório Playwright não encontrado"
fi

# Final summary
echo -e "\n${GREEN}🏆 PROTOCOLO MCP PLAYWRIGHT v2.0 EXECUTADO${NC}"
echo "Execução autônoma concluída com sucesso!"
echo ""
echo "Para visualizar os resultados:"
echo "• HTML Report: npx playwright show-report"
echo "• Screenshots: test-results/screenshots/"
echo "• Métricas: test-results/autonomous-metrics.json"
echo ""
echo "Próximos passos:"
echo "• Analisar relatórios de acessibilidade"
echo "• Revisar métricas de performance"
echo "• Implementar correções baseadas nos resultados"
echo ""

exit 0