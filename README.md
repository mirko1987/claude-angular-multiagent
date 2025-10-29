# Angular Multi-Agent Code Review System

An intelligent, multi-agent system powered by Claude AI for comprehensive Angular code review and analysis.

## Features

- **6 Specialized AI Agents**:
  - 🏗️ Angular Architecture Agent - Component design, modules, dependency injection
  - 🔄 RxJS Reactive Agent - Observable patterns, memory leaks, reactive programming
  - ⚡ Performance Agent - Change detection, rendering optimization, bundle size
  - 🔒 Security Agent - XSS, authentication, API security
  - 🧪 Testing Agent - Test coverage, quality, best practices
  - ♿ Accessibility Agent - WCAG compliance, ARIA, keyboard navigation

- **Advanced Optimizations**:
  - Smart caching to reduce API calls
  - Intelligent agent selection based on file types
  - File chunking for large codebases
  - Rate limiting and cost optimization
  - Code deduplication

- **Multiple Output Formats**:
  - Markdown reports
  - GitHub PR comments
  - JSON export
  - HTML reports

## Installation

\`\`\`bash
npm install
\`\`\`

## Configuration

Copy the example environment file:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit \`.env\` and add your Anthropic API key:

\`\`\`env
ANTHROPIC_API_KEY=your_api_key_here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
\`\`\`

## Usage

### CLI Usage

Review a directory:

\`\`\`bash
npm run build
node dist/index.js /path/to/angular/project
\`\`\`

Review specific files:

\`\`\`bash
node dist/index.js review src/app/component.ts src/app/service.ts
\`\`\`

### Programmatic Usage

\`\`\`typescript
import { AngularMultiAgent } from './src';

const multiAgent = new AngularMultiAgent();

// Review directory
const report = await multiAgent.reviewDirectory('./src');
console.log(report);

// Review specific files
const files = ['src/app/component.ts', 'src/app/service.ts'];
const fileReport = await multiAgent.reviewFiles(files);

// Generate GitHub PR comment
const prComment = await multiAgent.reviewForGitHub(files);
\`\`\`

## GitHub Actions Integration

Add your Anthropic API key to GitHub Secrets:
- Go to Settings > Secrets > Actions
- Add \`ANTHROPIC_API_KEY\`

The workflow will automatically run on pull requests and post review comments.

## Docker Usage

Build and run with Docker:

\`\`\`bash
# Build image
docker build -t angular-multiagent .

# Run with docker-compose
docker-compose up -d

# Review files
docker-compose run angular-multiagent node dist/index.js /workspace
\`\`\`

## Architecture

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                   OptimizedOrchestrator                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Pre-Analysis → Agent Selection → Caching      │   │
│  │  → Chunking → Rate Limiting → Execution        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
      ┌────────────────────┼────────────────────┐
      ▼                    ▼                    ▼
┌──────────┐         ┌──────────┐         ┌──────────┐
│Architecture│       │   RxJS   │         │Performance│
│   Agent   │       │   Agent  │         │   Agent   │
└──────────┘         └──────────┘         └──────────┘
      ▼                    ▼                    ▼
┌──────────┐         ┌──────────┐         ┌──────────┐
│ Security │         │  Testing │         │Accessibility│
│   Agent  │         │   Agent  │         │   Agent   │
└──────────┘         └──────────┘         └──────────┘
      │                    │                    │
      └────────────────────┼────────────────────┘
                           ▼
                  ┌────────────────┐
                  │ Report Generator│
                  └────────────────┘
\`\`\`

## Cost Optimization

The system includes several cost-saving features:

1. **Caching**: Previously analyzed files are cached (1 hour TTL)
2. **Agent Selection**: Only relevant agents run based on file types
3. **Smart Chunking**: Large files are split intelligently
4. **Model Selection**: Uses Haiku for simple tasks, Sonnet for complex analysis
5. **Deduplication**: Identical code blocks are analyzed once

## Development

Build the project:

\`\`\`bash
npm run build
\`\`\`

Run in development mode:

\`\`\`bash
npm run dev
\`\`\`

Run tests:

\`\`\`bash
npm test
\`\`\`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
