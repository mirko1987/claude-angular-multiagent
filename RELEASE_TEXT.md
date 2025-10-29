# TESTO PER LA GITHUB RELEASE v1.0.0

Copia tutto il testo sotto quando crei la release!

---

# 🚀 Claude Angular Multi-Agent Review v1.0.0

AI-powered code review for Angular projects using Claude Sonnet 4 with specialized agents.

## ✨ Features

### 🤖 6 Specialized AI Agents
- 🛡️ **Security Agent** - XSS, CSRF, SQL injection, authentication, data exposure
- 🏗️ **Architecture Agent** - Module structure, DI, lazy loading, best practices
- ⚡ **Performance Agent** - Change detection, memory leaks, bundle size, rendering
- 🔄 **RxJS Agent** - Observable management, subscription handling, operators
- 🧪 **Testing Agent** - Test coverage, quality, mocking, assertions
- ♿ **Accessibility Agent** - ARIA, keyboard navigation, screen readers

### 🎯 Smart Features
- ✅ **Multiple Review Modes** - smart, security, cost, speed, critical, all
- ✅ **Cost Control** - Configurable budgets ($0.01-0.05 per PR)
- ✅ **Differential Analysis** - Only analyzes changed files
- ✅ **Automatic PR Comments** - Detailed findings posted automatically
- ✅ **Smart Agent Selection** - Intelligent selection based on file types
- ✅ **Performance Optimized** - Streaming, caching, connection pooling

## 🚀 Quick Start

### 1. Add API Key Secret
Go to your repository **Settings** → **Secrets and variables** → **Actions**
- Name: `ANTHROPIC_API_KEY`
- Value: Your API key from https://console.anthropic.com/

### 2. Create Workflow File
Create `.github/workflows/ai-review.yml`:

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

### 3. Create a PR
The AI will automatically analyze your code and post a comment!

## 📊 Review Modes

| Mode | Agents | Cost | Speed | Best For |
|------|--------|------|-------|----------|
| `smart` | 2-3 | 💰 Low | ⚡ Fast | **Recommended** - Intelligent selection |
| `security` | 1 | 💰 Very Low | ⚡ Very Fast | Security-critical projects |
| `critical` | 2 | 💰 Low | ⚡ Fast | Important PRs |
| `cost` | 2 | 💰 Very Low | 🐢 Medium | Large codebases |
| `speed` | 2 | 💰 Medium | ⚡ Very Fast | Quick feedback |
| `all` | 6 | 💰💰 High | 🐢 Slow | Comprehensive review |

## 💰 Pricing

Approximate costs (based on Claude Sonnet 4 pricing):
- **Smart mode**: ~$0.01-0.05 per PR
- **Security only**: ~$0.005-0.02 per PR
- **All agents**: ~$0.05-0.20 per PR

**Example:** 50 PRs/month in smart mode = ~$1.25/month

## 📖 Documentation

- **[Quick Start Guide](https://github.com/mirko1987/claude-angular-multiagent/blob/main/QUICK_START.md)** - Get started in 5 minutes
- **[Full Documentation](https://github.com/mirko1987/claude-angular-multiagent/blob/main/ACTION_README.md)** - Complete usage guide
- **[User Tutorial](https://github.com/mirko1987/claude-angular-multiagent/blob/main/TUTORIAL_UTENTE.md)** - Step-by-step tutorial (Italian)
- **[Publishing Guide](https://github.com/mirko1987/claude-angular-multiagent/blob/main/PUBLISHING.md)** - For contributors

## 🎯 What Gets Reviewed

The AI automatically checks for:
- ✅ Security vulnerabilities (XSS, CSRF, SQL injection, etc.)
- ✅ Architecture issues (module structure, DI, lazy loading)
- ✅ Performance problems (change detection, memory leaks)
- ✅ RxJS anti-patterns (subscription leaks, operator misuse)
- ✅ Testing gaps (coverage, quality, best practices)
- ✅ Accessibility issues (ARIA, keyboard navigation)

## 🔧 Advanced Configuration

### Fail on Critical Issues
```yaml
- uses: mirko1987/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    fail-on-critical: true  # Block PR merge
```

### Cost Control
```yaml
- uses: mirko1987/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    cost-budget: '0.10'      # Max $0.10
    max-concurrent: 1         # Sequential execution
```

### Custom File Pattern
```yaml
- uses: mirko1987/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    files-pattern: 'apps/**/src/**/*.ts'  # For monorepos
```

## 🐛 Troubleshooting

### "No API credits" error
Add credits at https://console.anthropic.com/settings/billing

### "No files found" error
Check that `files-pattern` matches your project structure

### Action times out
- Use `review-mode: 'cost'` or `'speed'`
- Reduce `cost-budget` and `time-budget`

## 🙏 Contributing

Contributions welcome! Please check the [issues](https://github.com/mirko1987/claude-angular-multiagent/issues) or open a new one.

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🎉 Credits

Built with Claude Sonnet 4 by Anthropic.
Created by [Mirko Vitale](https://github.com/mirko1987).

---

**Ready to improve your Angular code quality?** 🚀

Try it now: `uses: mirko1987/claude-angular-multiagent@v1`
