#!/bin/bash

# MCP PLAYWRIGHT - Local Development Test Script
# Simplified version for local development without browser dependencies

set -e

echo "🤖 MCP PLAYWRIGHT - TESTE LOCAL SIMPLIFICADO"
echo "=============================================="
echo "Execução básica para desenvolvimento local"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
export NODE_ENV=test
export HEADLESS=true

echo -e "${BLUE}📋 Configuração:${NC}"
echo "  • Modo: Local Development"
echo "  • Ambiente: $NODE_ENV"
echo "  • Headless: $HEADLESS"
echo ""

# Function to print status
print_status() {
    case $1 in
        "success") echo -e "${GREEN}✅ $2${NC}" ;;
        "error") echo -e "${RED}❌ $2${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $2${NC}" ;;
        "info") echo -e "${BLUE}ℹ️  $2${NC}" ;;
    esac
}

# Function to run command with status
run_command() {
    local cmd="$1"
    local description="$2"
    local optional="${3:-false}"
    
    echo -e "${BLUE}🔄 $description...${NC}"
    
    if eval "$cmd" > /dev/null 2>&1; then
        print_status "success" "$description"
        return 0
    else
        if [ "$optional" = "true" ]; then
            print_status "warning" "$description (opcional)"
            return 0
        else
            print_status "error" "$description"
            return 1
        fi
    fi
}

echo -e "${BLUE}🔍 FASE 1: Verificação de Dependências${NC}"
echo "============================================"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    print_status "error" "Dependências não instaladas"
    echo "Execute: yarn install"
    exit 1
fi

print_status "success" "Dependências instaladas"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_status "warning" "Arquivo .env.local não encontrado"
    echo "Criando arquivo .env.local básico..."
    cp .env.example .env.local
    echo 'NEXT_PUBLIC_DEMO="true"' >> .env.local
    print_status "success" "Arquivo .env.local criado com configurações básicas"
fi

echo -e "\n${BLUE}🏗️ FASE 2: Teste de Build${NC}"
echo "============================="

# Test TypeScript compilation
run_command "npx tsc --noEmit" "Compilação TypeScript"

# Test Next.js build (skip for speed in local testing)
run_command "yarn build" "Build Next.js" "true"

echo -e "\n${BLUE}🧪 FASE 3: Testes Básicos${NC}"
echo "============================="

# Run local setup test
run_command "node test-local-setup.js" "Teste de configuração local"

# Test linting
run_command "yarn lint" "Verificação de código (ESLint)" "true"

echo -e "\n${BLUE}⚙️ FASE 4: Verificação de Configuração${NC}"
echo "=========================================="

# Check if autonomous test files exist
if [ -f "tests/autonomous/mcp-autonomous-suite.spec.ts" ]; then
    print_status "success" "Suite de testes autônomos disponível"
else
    print_status "warning" "Suite de testes autônomos não encontrada"
fi

# Check if test utilities exist
if [ -d "tests/utils" ]; then
    util_count=$(ls tests/utils/*.ts 2>/dev/null | wc -l)
    if [ $util_count -gt 0 ]; then
        print_status "success" "Utilitários de teste disponíveis ($util_count arquivos)"
    else
        print_status "warning" "Utilitários de teste não encontrados"
    fi
else
    print_status "warning" "Diretório de utilitários de teste não encontrado"
fi

echo -e "\n${BLUE}🚀 FASE 5: Teste do Servidor${NC}"
echo "=============================="

# Start development server for a quick test
echo "Iniciando servidor de desenvolvimento para teste..."

if ! pgrep -f "next dev" > /dev/null; then
    echo "Iniciando servidor..."
    yarn dev &
    SERVER_PID=$!
    sleep 15
    
    # Test if server is running
    if curl -f -s http://localhost:3000 > /dev/null; then
        print_status "success" "Servidor funcionando em http://localhost:3000"
    else
        print_status "error" "Servidor não respondeu"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
    
    # Stop the server
    kill $SERVER_PID 2>/dev/null || true
    print_status "info" "Servidor parado"
else
    print_status "success" "Servidor já está rodando"
fi

# Final summary
echo -e "\n${GREEN}🏆 TESTE LOCAL CONCLUÍDO${NC}"
echo "========================="
echo "Configuração local verificada com sucesso!"
echo ""
echo "Para iniciar o desenvolvimento:"
echo "• Servidor: yarn dev"
echo "• Testes básicos: yarn test:local"
echo "• Build: yarn build"
echo ""
echo "Recursos disponíveis:"
echo "• 🎯 Project Planning: http://localhost:3000/project-planning"
echo "• ⚛️ Next.js Dev: http://localhost:3000/nextjs-dev"
echo "• 💻 Terminal: http://localhost:3000/terminal"
echo "• ✨ ReactBits: http://localhost:3000/reactbits"
echo "• 🛠️ MCP Tools: http://localhost:3000/mcp-tools"
echo "• 🤖 LLM Providers: http://localhost:3000/llm-providers"
echo ""
echo "Para testes completos com Playwright:"
echo "• Instalar browsers: yarn test:install"
echo "• Executar testes: yarn test:autonomous"
echo ""

exit 0