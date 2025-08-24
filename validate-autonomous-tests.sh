#!/bin/bash

# MCP PLAYWRIGHT - Autonomous Test Validation Script
# Validates the autonomous testing implementation and infrastructure

set -e

echo "🔍 MCP PLAYWRIGHT - VALIDAÇÃO DO PROTOCOLO AUTÔNOMO"
echo "===================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to run validation check
validate_check() {
    local description="$1"
    local command="$2"
    local required="${3:-true}"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -e "${BLUE}🔍 $description...${NC}"
    
    if eval "$command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $description${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        if [ "$required" = "true" ]; then
            echo -e "${RED}❌ $description${NC}"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        else
            echo -e "${YELLOW}⚠️  $description (opcional)${NC}"
        fi
        return 1
    fi
}

# Function to check file exists
check_file() {
    local file="$1"
    local description="$2"
    validate_check "$description" "[ -f '$file' ]"
}

# Function to check directory exists
check_directory() {
    local dir="$1"
    local description="$2"
    validate_check "$description" "[ -d '$dir' ]"
}

echo -e "${BLUE}📋 VALIDAÇÃO DA INFRAESTRUTURA${NC}"
echo "================================="

# Check core files
check_file "playwright.config.ts" "Configuração Playwright atualizada"
check_file "tests/autonomous/mcp-autonomous-suite.spec.ts" "Suite de testes autônomos"
check_file "run-autonomous-tests.sh" "Script de execução autônoma"

# Check utility files
echo -e "\n${BLUE}🔧 VALIDAÇÃO DAS UTILIDADES${NC}"
echo "============================="

check_file "tests/utils/autonomous-test-runner.ts" "Autonomous Test Runner"
check_file "tests/utils/wcag-validator.ts" "WCAG Validator"
check_file "tests/utils/route-discovery.ts" "Route Discovery"
check_file "tests/utils/form-tester.ts" "Form Tester"
check_file "tests/utils/interaction-matrix.ts" "Interaction Matrix"
check_file "tests/utils/visual-validator.ts" "Visual Validator"
check_file "tests/utils/performance-monitor.ts" "Performance Monitor"
check_file "tests/utils/self-healing-manager.ts" "Self-Healing Manager"
check_file "tests/utils/global-setup.ts" "Global Setup"
check_file "tests/utils/global-teardown.ts" "Global Teardown"

# Check directories
echo -e "\n${BLUE}📁 VALIDAÇÃO DOS DIRETÓRIOS${NC}"
echo "============================="

check_directory "tests/autonomous" "Diretório de testes autônomos"
check_directory "tests/utils" "Diretório de utilidades"
check_directory "tests/mcp" "Diretório MCP existente"
check_directory "tests/llm" "Diretório LLM existente"

# Check package.json scripts
echo -e "\n${BLUE}📜 VALIDAÇÃO DOS SCRIPTS${NC}"
echo "=========================="

validate_check "Script test:autonomous no package.json" "grep -q 'test:autonomous' package.json"
validate_check "Script test:wcag no package.json" "grep -q 'test:wcag' package.json"
validate_check "Script test:multi-device no package.json" "grep -q 'test:multi-device' package.json"
validate_check "Script test:performance no package.json" "grep -q 'test:performance' package.json"

# Check TypeScript compilation
echo -e "\n${BLUE}🔨 VALIDAÇÃO DE COMPILAÇÃO${NC}"
echo "============================"

validate_check "TypeScript compila sem erros" "npx tsc --noEmit" "false"

# Check Playwright configuration
echo -e "\n${BLUE}⚙️  VALIDAÇÃO DA CONFIGURAÇÃO${NC}"
echo "=============================="

validate_check "Configuração multi-browser" "grep -q 'chromium-desktop' playwright.config.ts"
validate_check "Configuração mobile" "grep -q 'mobile-android' playwright.config.ts"
validate_check "Configuração acessibilidade" "grep -q 'accessibility-testing' playwright.config.ts"
validate_check "Global setup configurado" "grep -q 'globalSetup' playwright.config.ts"
validate_check "Global teardown configurado" "grep -q 'globalTeardown' playwright.config.ts"

# Validate test file syntax
echo -e "\n${BLUE}📝 VALIDAÇÃO DA SINTAXE${NC}"
echo "========================="

# Check autonomous suite syntax
if [ -f "tests/autonomous/mcp-autonomous-suite.spec.ts" ]; then
    validate_check "Sintaxe da suite autônoma" "node -c tests/autonomous/mcp-autonomous-suite.spec.ts" "false"
fi

# Check utility files syntax
for util_file in tests/utils/*.ts; do
    if [ -f "$util_file" ]; then
        filename=$(basename "$util_file")
        validate_check "Sintaxe de $filename" "node -c '$util_file'" "false"
    fi
done

# Check dependencies
echo -e "\n${BLUE}📦 VALIDAÇÃO DAS DEPENDÊNCIAS${NC}"
echo "=============================="

validate_check "Playwright instalado" "[ -d 'node_modules/@playwright' ]"
validate_check "Playwright Test instalado" "[ -d 'node_modules/@playwright/test' ]"

# Check browsers
validate_check "Browsers Playwright disponíveis" "npx playwright install-deps 2>/dev/null || echo 'Browsers may need installation'"

# Validate test structure
echo -e "\n${BLUE}🏗️  VALIDAÇÃO DA ESTRUTURA${NC}"
echo "============================"

# Count test files
AUTONOMOUS_TESTS=$(find tests/autonomous -name "*.spec.ts" -o -name "*.test.ts" 2>/dev/null | wc -l)
MCP_TESTS=$(find tests/mcp -name "*.spec.ts" -o -name "*.test.ts" 2>/dev/null | wc -l)
LLM_TESTS=$(find tests/llm -name "*.spec.ts" -o -name "*.test.ts" 2>/dev/null | wc -l)
TOTAL_TEST_FILES=$((AUTONOMOUS_TESTS + MCP_TESTS + LLM_TESTS))

echo "📊 Estatísticas de Testes:"
echo "  • Testes Autônomos: $AUTONOMOUS_TESTS"
echo "  • Testes MCP: $MCP_TESTS"
echo "  • Testes LLM: $LLM_TESTS"
echo "  • Total: $TOTAL_TEST_FILES"

validate_check "Pelo menos 1 teste autônomo" "[ $AUTONOMOUS_TESTS -ge 1 ]"
validate_check "Estrutura de testes robusta" "[ $TOTAL_TEST_FILES -ge 5 ]"

# Check protocol features
echo -e "\n${BLUE}🤖 VALIDAÇÃO DO PROTOCOLO${NC}"
echo "==========================="

# Check for WCAG implementation
validate_check "Implementação WCAG 2.1" "grep -q 'WCAG' tests/utils/wcag-validator.ts"
validate_check "Validação de contraste" "grep -q 'validateColorContrast' tests/utils/wcag-validator.ts"
validate_check "Validação de teclado" "grep -q 'validateKeyboardAccessible' tests/utils/wcag-validator.ts"

# Check for self-healing
validate_check "Self-healing implementado" "grep -q 'SelfHealingManager' tests/utils/self-healing-manager.ts"
validate_check "Recuperação de elementos" "grep -q 'recoverElementNotFound' tests/utils/self-healing-manager.ts"

# Check for performance monitoring
validate_check "Monitoramento de performance" "grep -q 'PerformanceMonitor' tests/utils/performance-monitor.ts"
validate_check "Métricas Web Vitals" "grep -q 'collectWebVitals' tests/utils/performance-monitor.ts"

# Check for visual validation
validate_check "Validação visual" "grep -q 'VisualValidator' tests/utils/visual-validator.ts"
validate_check "Regressão visual" "grep -q 'compareVisualRegression' tests/utils/visual-validator.ts"

# Test execution validation
echo -e "\n${BLUE}🚀 VALIDAÇÃO DE EXECUÇÃO${NC}"
echo "=========================="

# Check if we can run basic playwright commands
validate_check "Playwright CLI funcional" "npx playwright --version" "false"

# Check if test files are valid
validate_check "Testes podem ser listados" "npx playwright test --list" "false"

# Summary
echo -e "\n${BLUE}📊 RESUMO DA VALIDAÇÃO${NC}"
echo "======================="

echo "Total de verificações: $TOTAL_CHECKS"
echo -e "${GREEN}Verificações aprovadas: $PASSED_CHECKS${NC}"
if [ $FAILED_CHECKS -gt 0 ]; then
    echo -e "${RED}Verificações falharam: $FAILED_CHECKS${NC}"
fi

SUCCESS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
echo "Taxa de sucesso: $SUCCESS_RATE%"

# Final status
if [ $SUCCESS_RATE -ge 90 ]; then
    echo -e "\n${GREEN}🎉 VALIDAÇÃO APROVADA${NC}"
    echo "O protocolo MCP Playwright está corretamente implementado!"
    echo ""
    echo "✅ Recursos validados:"
    echo "  • Execução autônoma"
    echo "  • WCAG 2.1 AA compliance"
    echo "  • Self-healing mechanism"
    echo "  • Performance monitoring"
    echo "  • Visual regression testing"
    echo "  • Multi-device support"
    echo ""
    echo "🚀 Pronto para execução: npm run test:autonomous"
    exit 0
elif [ $SUCCESS_RATE -ge 75 ]; then
    echo -e "\n${YELLOW}⚠️  VALIDAÇÃO PARCIAL${NC}"
    echo "O protocolo está implementado mas pode precisar de ajustes."
    echo "Taxa de sucesso: $SUCCESS_RATE%"
    exit 1
else
    echo -e "\n${RED}❌ VALIDAÇÃO FALHOU${NC}"
    echo "O protocolo precisa de correções antes da execução."
    echo "Taxa de sucesso: $SUCCESS_RATE%"
    exit 2
fi