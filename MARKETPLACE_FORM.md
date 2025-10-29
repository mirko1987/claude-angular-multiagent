# TESTO PER IL MARKETPLACE LISTING

Copia questi testi quando compili il form del Marketplace!

---

## PRIMARY CATEGORY
```
Code quality
```

## ADDITIONAL CATEGORIES (opzionali)
```
Security
Continuous integration
```

---

## LISTING NAME
```
Claude Angular Multi-Agent Review
```

---

## TAGLINE (max 120 caratteri)
```
AI-powered code review for Angular using Claude Sonnet 4 with 6 specialized agents
```

---

## DESCRIPTION (copia tutto sotto)

```markdown
Automated code review for Angular projects powered by Claude AI with 6 specialized agents.

## 🎯 Features

### 6 Specialized AI Agents
- 🛡️ **Security** - XSS, CSRF, SQL injection, authentication issues
- 🏗️ **Architecture** - Module structure, DI, lazy loading, best practices  
- ⚡ **Performance** - Change detection, memory leaks, bundle optimization
- 🔄 **RxJS** - Observable management, subscription leaks
- 🧪 **Testing** - Coverage, quality, best practices
- ♿ **Accessibility** - ARIA, keyboard navigation, WCAG compliance

### Smart Features
- ✅ Multiple review modes (smart, security, cost, speed, all)
- ✅ Configurable cost budgets ($0.01-0.05 per PR)
- ✅ Differential analysis (only changed files)
- ✅ Automatic PR comments with detailed findings
- ✅ Smart agent selection based on file types

## 🚀 How It Works

1. Add your Anthropic API key as a GitHub secret
2. Create a workflow file with this action
3. Every PR gets automatically reviewed by AI
4. Receive detailed feedback in PR comments

## 💰 Pricing

Extremely cost-effective:
- Smart mode: ~$0.01-0.05 per PR
- 50 PRs/month = ~$1.25/month
- Cheaper than a coffee! ☕

## 📖 Quick Start

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

## 🎯 Perfect For

- Teams wanting to improve code quality
- Projects needing security checks
- Catching bugs before production
- Learning Angular best practices
- Reducing code review time

## 📊 What Gets Analyzed

- Security vulnerabilities (XSS, CSRF, SQL injection)
- Architecture issues (module structure, DI patterns)
- Performance problems (change detection, memory leaks)
- RxJS anti-patterns (subscription management)
- Testing gaps (coverage, quality)
- Accessibility issues (ARIA, keyboard navigation)

Get started in 2 minutes! 🚀
```

---

## HOMEPAGE URL
```
https://github.com/mirko1987/claude-angular-multiagent
```

---

## SUPPORT URL
```
https://github.com/mirko1987/claude-angular-multiagent/issues
```

---

## DOCUMENTATION URL
```
https://github.com/mirko1987/claude-angular-multiagent/blob/main/ACTION_README.md
```

---

## ICON (già configurato in action.yml)
```
shield ✅
```

## COLOR (già configurato in action.yml)
```
blue ✅
```

---

## TERMS & CONDITIONS

✅ Accetta entrambi:
- I agree to the GitHub Marketplace Developer Agreement
- I certify that this listing complies with GitHub's Terms of Service
