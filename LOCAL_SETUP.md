# 🚀 Guia de Configuração Local

Este guia explica como configurar e executar o projeto LangChain RAG Dev localmente.

## 📋 Pré-requisitos

- Node.js 18 ou superior
- Yarn package manager
- Chave da API OpenAI (opcional para modo demo)

## ⚙️ Configuração Inicial

### 1. Clone e Instale Dependências

```bash
git clone https://github.com/rpironato1/langchain-rag-dev.git
cd langchain-rag-dev
yarn install
```

### 2. Configuração do Ambiente

Copie o arquivo de exemplo e configure suas variáveis:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas configurações:

```env
# Configuração mínima para desenvolvimento local
OPENAI_API_KEY="sk-your-openai-api-key-here"
LANGCHAIN_CALLBACKS_BACKGROUND=false
DEFAULT_LLM_PROVIDER="openai"
NODE_ENV=development

# Modo demo (funciona sem API keys reais)
NEXT_PUBLIC_DEMO="true"
```

### 3. Instalar Browsers Playwright (Opcional)

Para testes completos, instale os browsers:

```bash
yarn test:install
# ou
npx playwright install
```

Se houver problemas com download, você pode usar apenas Chromium:

```bash
npx playwright install chromium
```

## 🚀 Executando o Projeto

### Servidor de Desenvolvimento

```bash
yarn dev
```

O projeto estará disponível em [http://localhost:3000](http://localhost:3000)

### Build de Produção

```bash
yarn build
yarn start
```

### Testes

```bash
# Testes básicos (sem Playwright)
yarn test

# Testes Playwright (requer browsers instalados)
yarn test:playwright

# Testes autônomos completos
yarn test:autonomous

# Validar configuração
yarn validate:autonomous
```

## 🔧 Funcionalidades Principais

### 🎯 Project Planning
- Navegue para `/project-planning`
- IA auxiliar para planejamento de projetos

### ⚛️ Next.js Development
- Acesse `/nextjs-dev`
- Assistente especializado em Next.js

### 💻 Terminal Interface
- Vá para `/terminal`
- Terminal seguro com comandos aprovados

### ✨ ReactBits
- Visite `/reactbits`
- Gerador de componentes React com IA

### 🛠️ MCP Tools
- Acesse `/mcp-tools`
- Ferramentas do Model Context Protocol

### 🤖 LLM Providers
- Configure em `/llm-providers`
- Suporte a múltiplos provedores de IA

## 🐛 Solução de Problemas

### Erro de Build
Se encontrar erros de TypeScript, execute:
```bash
yarn lint
```

### Erro de Dependências
Remova node_modules e reinstale:
```bash
rm -rf node_modules yarn.lock
yarn install
```

### Erro de Playwright
Se os browsers não instalarem, use:
```bash
# Linux/Ubuntu
sudo npx playwright install-deps
npx playwright install

# macOS
npx playwright install
```

### Modo Demo
Se não tiver API keys, ative o modo demo:
```env
NEXT_PUBLIC_DEMO="true"
```

## 📊 Scripts Disponíveis

```json
{
  "dev": "Servidor de desenvolvimento",
  "build": "Build de produção",
  "start": "Servidor de produção",
  "lint": "Verificar código",
  "test": "Testes básicos",
  "test:playwright": "Testes Playwright",
  "test:autonomous": "Testes autônomos completos",
  "validate:autonomous": "Validar configuração"
}
```

## 🔑 Configuração de API Keys

### OpenAI
1. Acesse [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crie uma nova API key
3. Adicione no `.env.local` como `OPENAI_API_KEY`

### Outros Provedores (Opcional)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com)
- **Google**: [makersuite.google.com](https://makersuite.google.com)
- **OpenRouter**: [openrouter.ai](https://openrouter.ai)

### Local LLMs (Opcional)
- **Ollama**: Instale localmente em `http://localhost:11434`
- **LM Studio**: Configure em `http://localhost:1234/v1`

## 📈 Próximos Passos

1. Explore todas as funcionalidades em desenvolvimento
2. Configure provedores LLM adicionais conforme necessário
3. Execute testes para verificar funcionalidade
4. Personalize componentes conforme suas necessidades

## 🆘 Suporte

- Issues no GitHub para problemas
- Documentação completa no README principal
- Exemplos de uso nos diretórios de teste