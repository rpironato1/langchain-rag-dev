# 🚀 LangChain Development Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frpironato1%2Flangchain-rag-dev)

A comprehensive AI-powered development platform that transforms the standard LangChain + Next.js template into a full-featured development environment. This platform provides project planning, code generation, terminal access, and advanced tooling integration.

## 🌟 Features

### 🎯 **Project Planning Orchestrator**
AI-powered project planning with comprehensive task breakdown and strategic guidance:
- **Project Decomposition**: Break down complex projects into manageable tasks and milestones
- **Architecture Planning**: Get recommendations for technology stacks and system design
- **Timeline Estimation**: Realistic project timelines with dependency mapping
- **Risk Assessment**: Identify potential risks and mitigation strategies
- **Resource Planning**: Team size and skill requirements analysis
- **Milestone Tracking**: Create clear deliverables and success metrics

### ⚛️ **Next.js Development Orchestrator**
Specialized development assistance for modern React applications:
- **Next.js 15+ Expertise**: App Router architecture and best practices
- **TypeScript Integration**: Type-safe development patterns
- **Tailwind CSS**: Responsive design and utility-first styling
- **Shadcn UI**: Beautiful, accessible component library integration
- **Server Components**: RSC patterns and client/server boundaries
- **API Routes**: Server actions and route handlers
- **Database Integration**: Supabase, Prisma, and data fetching patterns
- **Performance Optimization**: SEO and Core Web Vitals

### 💻 **Terminal Interface**
Secure terminal command execution with comprehensive safety measures:
- **Whitelisted Commands**: Pre-approved command set for security
- **Real-time Output**: Live command output and error handling
- **Working Directory Management**: Context-aware execution
- **Security Restrictions**: No sudo, system modifications, or dangerous operations
- **Timeout Protection**: 30-second execution limits
- **Command History**: Track executed commands and results

### 🛠️ **MCP Tools Integration**
Model Context Protocol tools for system interaction:
- **File Operations**: Read, write, and list directory contents
- **Web Integration**: HTTP requests and API interactions
- **Security Boundaries**: Restricted to project directory
- **Parameter Validation**: Type-safe tool parameter handling
- **Error Handling**: Comprehensive error reporting and recovery

### ✨ **ReactBits Component Generator**
AI-powered React component generation with modern patterns:
- **TypeScript Components**: Fully typed component generation
- **Tailwind Styling**: Responsive design with utility classes
- **Shadcn UI Patterns**: Consistent design system integration
- **Template Library**: Pre-built components (Button, Card, Form)
- **Best Practices**: Accessibility, performance, and maintainability
- **Code Export**: Copy to clipboard or download as files

### 🐶 **Enhanced RAG System**
Improved retrieval-augmented generation with Supabase:
- **Document Ingestion**: Multi-format document processing
- **Vector Search**: Semantic similarity search capabilities
- **Supabase Integration**: Scalable vector storage
- **Conversation Context**: Maintained chat history
- **Source Attribution**: Cited references in responses

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Yarn package manager
- OpenAI API key (optional for demo mode)

### Quick Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/rpironato1/langchain-rag-dev.git
   cd langchain-rag-dev
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   For local development, you can use demo mode:
   ```env
   NEXT_PUBLIC_DEMO="true"
   LANGCHAIN_CALLBACKS_BACKGROUND=false
   ```
   
   Or add your API keys to `.env.local`:
   ```env
   OPENAI_API_KEY="your_openai_api_key"
   DEFAULT_LLM_PROVIDER="openai"
   ```

4. **Test local setup**
   ```bash
   yarn test:local-full
   ```

5. **Start development server**
   ```bash
   yarn dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Local Development Scripts

```bash
# Quick setup verification
yarn test:local

# Full local test suite (includes server test)
yarn test:local-full

# Development server
yarn dev

# Production build
yarn build

# Linting
yarn lint
```

For complete testing with Playwright:
```bash
# Install Playwright browsers (optional)
yarn test:install

# Run autonomous tests (requires browsers)
yarn test:autonomous

# Validate test configuration
yarn validate:autonomous
```

> 📖 **Detailed Setup Guide**: See [LOCAL_SETUP.md](./LOCAL_SETUP.md) for comprehensive local development instructions.

## 📚 Usage Guide

### Project Planning
1. Navigate to **🎯 Project Planning** 
2. Describe your project goals and requirements
3. Get comprehensive planning with:
   - Task breakdown and timelines
   - Technology recommendations
   - Risk assessments
   - Resource requirements

### Next.js Development
1. Go to **⚛️ Next.js Dev**
2. Ask for development help:
   - Component architecture
   - API route implementation
   - Database integration
   - Performance optimization

### Terminal Operations
1. Open **💻 Terminal**
2. Execute allowed commands:
   - File operations (`ls`, `cat`, `mkdir`)
   - Git commands (`git status`, `git log`)
   - Package management (`npm`, `yarn`)
   - Project inspection (`find`, `grep`)

### Component Generation
1. Visit **✨ ReactBits**
2. Describe your component needs
3. Choose from templates or generate custom components
4. Copy or download the generated TypeScript code

### System Integration
1. Access **🛠️ MCP Tools**
2. Use file system tools:
   - Read project files
   - Write new components
   - List directories
   - Make web requests

## 🏗️ Architecture

### API Routes
- `/api/chat/project-planning` - Project planning orchestrator
- `/api/chat/nextjs-dev` - Development assistance
- `/api/terminal` - Secure command execution
- `/api/mcp` - MCP tools interface
- `/api/reactbits` - Component generation
- `/api/chat/retrieval` - RAG with vector search

### Security Features
- **Command Whitelisting**: Only approved commands allowed
- **Path Restrictions**: Operations limited to project directory
- **Timeout Limits**: Prevents long-running operations
- **Input Validation**: Sanitized user inputs
- **Error Boundaries**: Graceful error handling

### Technology Stack
- **Frontend**: Next.js 15+, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **AI**: LangChain.js, OpenAI GPT models
- **Database**: Supabase (for RAG)
- **Tools**: MCP, LangGraph

## 🔧 Configuration

### Environment Variables
```env
# Required
OPENAI_API_KEY=sk-...
LANGCHAIN_CALLBACKS_BACKGROUND=false

# Optional: Enhanced features
SUPABASE_PRIVATE_KEY=your_key
SUPABASE_URL=https://your-project.supabase.co
SERPAPI_API_KEY=your_key

# Optional: LangSmith tracing
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=ls_...
LANGCHAIN_PROJECT=nextjs-dev-platform
```

### Customization

#### Adding New MCP Tools
```typescript
// app/api/mcp/route.ts
const customTool: MCPTool = {
  name: "custom_operation",
  description: "Your custom tool description",
  parameters: {
    type: "object",
    properties: {
      input: { type: "string", description: "Input parameter" }
    }
  },
  handler: async (params) => {
    // Your implementation
    return { success: true, result: "output" };
  }
};
```

#### Adding New ReactBits Templates
```typescript
// app/api/reactbits/route.ts
const COMPONENT_TEMPLATES = {
  "your_template": {
    description: "Your template description",
    template: `// Your component template code`
  }
};
```

## 🧪 Testing

### Manual Testing
1. **Build Test**: `yarn build`
2. **Development Server**: `yarn dev`
3. **Feature Testing**: Navigate through all features
4. **API Testing**: Test individual API endpoints

### Security Testing
- Verify command restrictions in terminal
- Test file access boundaries in MCP tools
- Validate input sanitization

## 📦 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on [LangChain.js](https://js.langchain.com/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Next.js](https://nextjs.org/)

## 📞 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Check the documentation
- Review example implementations in the codebase

---

**Transform your development workflow with AI-powered assistance and comprehensive tooling integration!** 🚀
