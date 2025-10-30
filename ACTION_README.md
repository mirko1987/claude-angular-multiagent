# Claude Angular Multi-Agent Review - GitHub Action

AI-powered code review for Angular projects using Claude Sonnet 4 with specialized agents for security, architecture, performance, RxJS patterns, testing, and accessibility.

## Features

- 🛡️ **Security Analysis** - XSS, CSRF, authentication, authorization, data exposure
- 🏗️ **Architecture Review** - Module structure, dependency injection, lazy loading, best practices
- ⚡ **Performance Optimization** - Change detection, memory leaks, bundle size, rendering
- 🔄 **RxJS Patterns** - Observable management, subscription handling, operators usage
- 🧪 **Testing Quality** - Test coverage, best practices, mocking, assertions
- ♿ **Accessibility** - ARIA, keyboard navigation, screen reader compatibility

## Quick Start

### 1. Add to Your Workflow

Create `.github/workflows/ai-review.yml` in your Angular project:

```yaml
name: AI Code Review

on:
  pull_request:
    paths:
      - 'src/**/*.ts'

jobs:
  review:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run AI Code Review
        uses: YOUR_USERNAME/claude-angular-multiagent@v1
        with:
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
          review-mode: 'smart'
          post-comment: true
```

### 2. Add API Key Secret

1. Go to your repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `ANTHROPIC_API_KEY`
4. Value: Your Anthropic API key from https://console.anthropic.com/

### 3. Create a Pull Request

The action will automatically run and post a review comment!

## Configuration

### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `anthropic-api-key` | Anthropic API key for Claude AI | ✅ Yes | - |
| `files-pattern` | Glob pattern for files to review | No | `src/**/*.ts` |
| `review-mode` | Review mode (see below) | No | `smart` |
| `cost-budget` | Maximum cost in dollars | No | `0.50` |
| `time-budget` | Maximum time in milliseconds | No | `90000` |
| `max-concurrent` | Concurrent agents (1-6) | No | `3` |
| `enable-caching` | Cache unchanged files | No | `true` |
| `enable-streaming` | Real-time streaming responses | No | `false` |
| `enable-differential` | Only analyze changed files | No | `true` |
| `post-comment` | Post results as PR comment | No | `true` |
| `fail-on-critical` | Fail if critical issues found | No | `false` |

### Review Modes

| Mode | Agents | Description | Cost | Speed |
|------|--------|-------------|------|-------|
| `smart` | 2-3 agents | Intelligent agent selection | 💰 Low | ⚡ Fast |
| `security` | Security only | Security-focused review | 💰 Very Low | ⚡ Very Fast |
| `critical` | Security + Architecture | Critical issues only | 💰 Low | ⚡ Fast |
| `cost` | Security + Architecture | Optimized for low cost | 💰 Very Low | 🐢 Medium |
| `speed` | Security + Performance | Optimized for speed | 💰 Medium | ⚡ Very Fast |
| `all` | All 6 agents | Comprehensive review | 💰💰 High | 🐢 Slow |

### Outputs

| Output | Description |
|--------|-------------|
| `total-issues` | Total number of issues found |
| `critical-issues` | Number of critical issues |
| `suggestions` | Number of suggestions |
| `analysis-time` | Analysis time in milliseconds |
| `estimated-cost` | Estimated cost in dollars |
| `review-passed` | Whether review passed (no critical issues) |

## Usage Examples

### Basic Usage

```yaml
- uses: YOUR_USERNAME/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

### Security-Focused Review

```yaml
- uses: YOUR_USERNAME/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    review-mode: 'security'
    fail-on-critical: true
```

### Cost-Optimized Review

```yaml
- uses: YOUR_USERNAME/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    review-mode: 'cost'
    cost-budget: '0.10'
    max-concurrent: 1
```

### Comprehensive Review

```yaml
- uses: YOUR_USERNAME/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    review-mode: 'all'
    cost-budget: '2.00'
    time-budget: 300000
```

### Custom File Pattern

```yaml
- uses: YOUR_USERNAME/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    files-pattern: 'apps/**/src/**/*.ts'
```

### Block PR on Critical Issues

```yaml
- uses: YOUR_USERNAME/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    fail-on-critical: true
```

### Use Outputs

```yaml
- name: Run AI Review
  id: review
  uses: YOUR_USERNAME/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}

- name: Check Results
  run: |
    echo "Total Issues: ${{ steps.review.outputs.total-issues }}"
    echo "Critical Issues: ${{ steps.review.outputs.critical-issues }}"
    echo "Cost: ${{ steps.review.outputs.estimated-cost }}"
```

## Advanced Workflows

### Run Only on Specific Branches

```yaml
on:
  pull_request:
    branches:
      - main
      - develop
    paths:
      - 'src/**/*.ts'
```

### Different Modes for Different Branches

```yaml
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Review (main branch)
        if: github.base_ref == 'main'
        uses: YOUR_USERNAME/claude-angular-multiagent@v1
        with:
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
          review-mode: 'all'
          fail-on-critical: true

      - name: Review (other branches)
        if: github.base_ref != 'main'
        uses: YOUR_USERNAME/claude-angular-multiagent@v1
        with:
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
          review-mode: 'smart'
```

### Scheduled Full Review

```yaml
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:      # Manual trigger

jobs:
  full-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: YOUR_USERNAME/claude-angular-multiagent@v1
        with:
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
          review-mode: 'all'
          enable-differential: false
          cost-budget: '5.00'
```

## Cost Estimation

Approximate costs per review (based on Claude Sonnet 4 pricing):

- **Smart mode**: $0.01 - $0.05 per PR
- **Security only**: $0.005 - $0.02 per PR
- **Critical mode**: $0.01 - $0.03 per PR
- **All agents**: $0.05 - $0.20 per PR

Actual costs depend on:
- Number of files changed
- File sizes
- Complexity of code
- Number of agents selected

## Troubleshooting

### No API Credits Error

```
Error: Your credit balance is too low to access the Anthropic API
```

**Solution**: Add credits to your Anthropic account at https://console.anthropic.com/settings/billing

### No Files Found

```
Error: No files found matching pattern
```

**Solution**: Check your `files-pattern` input matches your project structure

### Action Times Out

**Solution**:
- Reduce `time-budget`
- Use a faster `review-mode` like `cost` or `speed`
- Reduce number of files with a more specific `files-pattern`

### Too Expensive

**Solution**:
- Use `review-mode: 'cost'`
- Lower `cost-budget`
- Set `max-concurrent: 1`
- Use more specific `files-pattern` to review fewer files

## Security

- Your `ANTHROPIC_API_KEY` is stored as a GitHub secret and never exposed
- The action runs in an isolated GitHub Actions environment
- Code is analyzed by Claude AI via Anthropic's secure API
- No code is stored or retained after analysis

## Support

- 📖 [Full Documentation](https://github.com/mirko87/claude-angular-multiagent)
- 🐛 [Report Issues](https://github.com/mirko87/claude-angular-multiagent/issues)
- 💬 [Discussions](https://github.com/mirko87/claude-angular-multiagent/discussions)

## License

MIT License - See [LICENSE](LICENSE) file for details

## Credits

Built with Claude Sonnet 4 by Anthropic
