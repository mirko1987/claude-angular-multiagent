# 🤖 Claude Angular Multi-Agent Review

AI-powered code review for Angular projects using Claude Sonnet 4 with 6 specialized agents running in parallel.

[![GitHub Release](https://img.shields.io/github/v/release/mirko1987/claude-angular-multiagent)](https://github.com/mirko1987/claude-angular-multiagent/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **⚡ Performance:** All 6 agents run in parallel for 66% faster reviews (~10s vs ~30s)

## Features

- **6 Specialized AI Agents**:
  - 🏗️ Angular Architecture Agent - Component design, modules, dependency injection
  - 🔄 RxJS Reactive Agent - Observable patterns, memory leaks, reactive programming
  - ⚡ Performance Agent - Change detection, rendering optimization, bundle size
  - 🔒 Security Agent - XSS, authentication, API security
  - 🧪 Testing Agent - Test coverage, quality, best practices
  - ♿ Accessibility Agent - WCAG compliance, ARIA, keyboard navigation

- **Advanced Optimizations**:
  - ⚡ **Parallel Execution**: 6 agents run concurrently (configurable 1-6)
  - 🚀 **66% Faster**: ~10s total vs ~30s sequential execution
  - 💾 Smart caching to reduce API calls
  - 🎯 Intelligent agent selection based on file types
  - 📦 File chunking for large codebases
  - 💰 Rate limiting and cost optimization
  - 🔄 Code deduplication
  - 📊 Differential analysis (only changed files)

- **Multiple Output Formats**:
  - Markdown reports
  - GitHub PR comments
  - JSON export
  - HTML reports

## 🚀 Quick Start (GitHub Action)

Add to your Angular project in `.github/workflows/ai-review.yml`:

```yaml
name: AI Code Review

on:
  pull_request:
    paths: ['src/**/*.ts']

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - uses: actions/checkout@v4
      - uses: mirko1987/claude-angular-multiagent@v1
        with:
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

Add your Anthropic API key to repository secrets:
- Go to **Settings** → **Secrets and variables** → **Actions**
- Add `ANTHROPIC_API_KEY` with your key from https://console.anthropic.com/

**Done!** Every PR will now get automatic AI code review in ~10 seconds.

## ⚡ Performance

### Execution Speed

| Mode | Agents | Execution Time | Cost per PR |
|------|--------|----------------|-------------|
| `security` | 1 | ~5s | $0.005-0.02 |
| `smart` | 2-3 | ~8-10s | $0.01-0.05 |
| `critical` | 2 | ~6-8s | $0.01-0.03 |
| `all` | 6 | ~10-12s | $0.05-0.20 |

**All agents run in parallel** (configurable via `max-concurrent: 1-6`):

```
T0:  🛡️ Security       ├──────────┤ [10s]
T0:  🏗️ Architecture   ├──────────┤ [10s]
T0:  ⚡ Performance    ├──────────┤ [10s]  ← All 6 run together!
T0:  🔄 RxJS           ├──────────┤ [10s]
T0:  🧪 Testing        ├──────────┤ [10s]
T0:  ♿ Accessibility  ├──────────┤ [10s]

Total: ~10 seconds (vs ~30s sequential)
```

### Cost Optimization

- **Smart mode** (default): ~$0.01-0.05 per PR
- **50 PRs/month**: ~$1.25/month
- Cheaper than a coffee! ☕

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

## 🎯 Configuration Options

### Review Modes

```yaml
- uses: mirko1987/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    review-mode: 'smart'  # smart, security, cost, speed, critical, all
```

| Mode | Description | Agents | Speed | Cost |
|------|-------------|--------|-------|------|
| `smart` | **Recommended** - Intelligent agent selection | 2-3 | ⚡ Fast | 💰 Low |
| `security` | Security-critical projects only | 1 | ⚡⚡ Very Fast | 💰 Very Low |
| `critical` | Important PRs (security + architecture) | 2 | ⚡ Fast | 💰 Low |
| `cost` | Budget-conscious (optimized for cost) | 2 | 🐢 Medium | 💰 Very Low |
| `speed` | Quick feedback (security + performance) | 2 | ⚡⚡ Very Fast | 💰 Medium |
| `all` | Comprehensive review (all 6 agents) | 6 | 🐢 Slower | 💰💰 High |

### Advanced Configuration

```yaml
- uses: mirko1987/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    review-mode: 'smart'
    max-concurrent: '6'           # Concurrent agents (1-6, default: 6)
    cost-budget: '0.50'           # Max cost per PR (default: $0.50)
    time-budget: '90000'          # Max time in ms (default: 90000)
    fail-on-critical: 'true'      # Block PR merge if critical issues found
    post-comment: 'true'          # Post results as PR comment
    enable-caching: 'true'        # Cache unchanged files
    enable-differential: 'true'   # Only analyze changed files
    files-pattern: 'src/**/*.ts'  # Files to review
```

### Example: Fail on Critical Issues

```yaml
- uses: mirko1987/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    fail-on-critical: true  # ❌ Blocks merge if critical issues found
```

### Example: Monorepo Support

```yaml
- uses: mirko1987/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    files-pattern: 'apps/my-app/src/**/*.ts'  # Specific app in monorepo
```

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

## 🏗️ Architecture

### Parallel Execution Flow

```
┌─────────────────────────────────────────────────────────┐
│           PerformanceOrchestrator (Smart Mode)          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Differential → Pre-Analysis → Agent Selection  │   │
│  │  → Priority Waves → Parallel Execution          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │   Wave 1-4 (Priority-based)       │
         │   Max 6 agents run in parallel    │
         └─────────────────┬─────────────────┘
                           │
      ┌────────┬──────┬────┴────┬──────┬────────┐
      │        │      │         │      │        │
      ▼        ▼      ▼         ▼      ▼        ▼
┌──────────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌──────────┐
│🛡️Security│ │🏗️  │ │⚡  │ │🔄  │ │🧪  │ │♿        │
│  Agent   │ │Arch│ │Perf│ │RxJS│ │Test│ │Access    │
│ Priority │ │ 80 │ │ 70 │ │ 60 │ │ 50 │ │ 40       │
│   100    │ │    │ │    │ │    │ │    │ │          │
└──────────┘ └────┘ └────┘ └────┘ └────┘ └──────────┘
      │        │      │         │      │        │
      └────────┴──────┴─────────┴──────┴────────┘
                           │
                  ┌────────▼────────┐
                  │  Result Merger  │
                  │  & Formatter    │
                  └────────┬────────┘
                           │
                  ┌────────▼────────┐
                  │   PR Comment    │
                  │   Generator     │
                  └─────────────────┘
```

### Key Features

1. **Smart Priority Waves**: Agents execute in priority order (Security first, then Architecture, etc.)
2. **Parallel Execution**: Up to 6 agents run simultaneously using `p-limit`
3. **Adaptive Concurrency**: Automatically adjusts based on cost budget
4. **Early Stop**: Halts execution if ≥3 critical issues found
5. **Differential Analysis**: Only analyzes changed files between commits

## 🎯 What Gets Reviewed

The AI automatically checks for:

### 🛡️ Security Agent
- XSS vulnerabilities (innerHTML, DOM manipulation)
- SQL injection risks
- CSRF protection
- Authentication & authorization issues
- Sensitive data exposure
- API security best practices

### 🏗️ Architecture Agent
- Component structure & organization
- Module design & lazy loading
- Dependency injection patterns
- Service architecture
- State management
- Code organization & naming

### ⚡ Performance Agent
- Change detection strategies
- Memory leaks (subscriptions, timers)
- Bundle size optimization
- Rendering performance
- Image & asset optimization
- Network request optimization

### 🔄 RxJS Agent
- Observable patterns & best practices
- Subscription management
- Operator usage & optimization
- Memory leak prevention
- Subject/BehaviorSubject patterns
- Error handling in streams

### 🧪 Testing Agent
- Test coverage gaps
- Test quality & assertions
- Mocking & stubbing practices
- Integration test patterns
- E2E test coverage
- Test organization

### ♿ Accessibility Agent
- ARIA attributes & roles
- Keyboard navigation
- Screen reader compatibility
- Color contrast & readability
- Focus management
- WCAG 2.1 compliance

## 💰 Cost Optimization

The system includes several cost-saving features:

1. **Parallel Execution**: All agents run simultaneously (no sequential overhead)
2. **Differential Analysis**: Only analyze changed files
3. **Caching**: Previously analyzed files are cached (1 hour TTL)
4. **Smart Selection**: Only relevant agents run based on file types
5. **Adaptive Concurrency**: Adjusts parallelism based on budget
6. **Early Stop**: Halts if critical issues found (saves API calls)
7. **Model Selection**: Uses optimal model for each task
8. **Deduplication**: Identical code blocks analyzed once

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

## 📚 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get started in 5 minutes
- **[Action Documentation](ACTION_README.md)** - Complete GitHub Action usage guide
- **[User Tutorial](USER_TUTORIAL.md)** - Step-by-step tutorial with examples
- **[Publishing Guide](PUBLISHING.md)** - For contributors

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details.

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/mirko1987/claude-angular-multiagent/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mirko1987/claude-angular-multiagent/discussions)
- **Documentation**: [Full Docs](https://github.com/mirko1987/claude-angular-multiagent/blob/main/ACTION_README.md)

## 🌟 Show Your Support

If you find this action helpful:
- ⭐ Star the repository
- 🐛 Report bugs or request features
- 📢 Share with your team
- 💡 Contribute improvements

## 📊 Project Stats

- **Model**: Claude Sonnet 4 (claude-sonnet-4-20250514)
- **Agents**: 6 specialized AI agents
- **Execution**: Parallel (up to 6 concurrent)
- **Performance**: ~10s for comprehensive review
- **Cost**: ~$0.01-0.05 per PR (smart mode)

---

**Built with ❤️ using Claude Sonnet 4 by [Mirko Vitale](https://github.com/mirko1987)**
