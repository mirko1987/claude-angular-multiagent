# Quick Start Guide

Get started with Claude Angular Multi-Agent Review in 3 simple steps!

## Option 1: GitHub Action (Easiest)

### Step 1: Add API Key to GitHub Secrets

1. Go to your Angular project repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `ANTHROPIC_API_KEY`
5. Value: Your API key from https://console.anthropic.com/

### Step 2: Create Workflow File

Create `.github/workflows/ai-review.yml` in your repository:

\`\`\`yaml
name: AI Code Review

on:
  pull_request:
    paths:
      - 'src/**/*.ts'

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: YOUR_USERNAME/claude-angular-multiagent@v1
        with:
          anthropic-api-key: \${{ secrets.ANTHROPIC_API_KEY }}
\`\`\`

### Step 3: Create a Pull Request

That's it! The AI review will automatically run on every pull request.

---

## Next Steps

- 📖 [Full GitHub Action Documentation](ACTION_README.md)
- 🔧 [Example Workflows](.github/workflows/example-usage.yml)
- 📋 [Complete Documentation](README.md)

Happy coding! 🚀
