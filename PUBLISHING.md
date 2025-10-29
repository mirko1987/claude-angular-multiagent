# Publishing Guide

How to publish Claude Angular Multi-Agent Review as a GitHub Action.

## Prerequisites

- ✅ Repository is public on GitHub
- ✅ All code is tested and working
- ✅ Documentation is complete
- ✅ action.yml is configured

## Step 1: Prepare the Repository

### 1.1 Update References

Replace all `mirko1987` placeholders with your actual GitHub username:

```bash
# In action.yml
# In ACTION_README.md
# In example-usage.yml
# In QUICK_START.md
```

### 1.2 Create a LICENSE

If not already present, add a LICENSE file (MIT recommended):

```bash
# Add MIT License
cat > LICENSE << 'LICENSE_EOF'
MIT License

Copyright (c) 2025 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
LICENSE_EOF
```

### 1.3 Verify Build Works

```bash
npm install
npm run build
node test-compiled.js  # Should run (may fail on API credits, that's OK)
```

## Step 2: Create a Release

### 2.1 Commit All Changes

```bash
git add .
git commit -m "Prepare for v1.0.0 release"
git push origin main
```

### 2.2 Create a Git Tag

```bash
# Create v1.0.0 tag
git tag -a v1.0.0 -m "Release v1.0.0 - Initial public release"
git push origin v1.0.0

# Create v1 tag (recommended for GitHub Actions)
git tag -a v1 -m "Release v1 (points to v1.0.0)"
git push origin v1
```

### 2.3 Create GitHub Release

1. Go to your repository on GitHub
2. Click **Releases** → **Create a new release**
3. Choose tag: `v1.0.0`
4. Release title: `v1.0.0 - Initial Release`
5. Description:

```markdown
# Claude Angular Multi-Agent Review v1.0.0

AI-powered code review for Angular projects using Claude Sonnet 4.

## Features

- 🛡️ Security analysis (XSS, CSRF, authentication)
- 🏗️ Architecture review (modules, DI, best practices)
- ⚡ Performance optimization (change detection, memory)
- 🔄 RxJS patterns (observables, subscriptions)
- 🧪 Testing quality (coverage, best practices)
- ♿ Accessibility (ARIA, keyboard navigation)

## Quick Start

\`\`\`yaml
- uses: mirko1987/claude-angular-multiagent@v1
  with:
    anthropic-api-key: \${{ secrets.ANTHROPIC_API_KEY }}
\`\`\`

See [Quick Start Guide](QUICK_START.md) for details.

## What's New

- Initial public release
- 6 specialized AI agents
- Smart agent selection
- Cost and time budgets
- Differential analysis
- GitHub PR comments
- Multiple review modes

## Documentation

- [GitHub Action Documentation](ACTION_README.md)
- [Full Documentation](README.md)
- [Example Workflows](.github/workflows/example-usage.yml)

## Breaking Changes

None (initial release)
```

6. Click **Publish release**

## Step 3: Publish to GitHub Marketplace

### 3.1 Enable GitHub Marketplace

1. Go to your repository on GitHub
2. Click **Settings**
3. Scroll to **GitHub Marketplace**
4. Click **List this Action on GitHub Marketplace**

### 3.2 Complete Marketplace Listing

Fill in the required information:

**Primary Category:** Code Quality

**Listing Information:**
- **Name:** Claude Angular Multi-Agent Review
- **Description:** AI-powered code review for Angular projects using Claude Sonnet 4 with specialized agents
- **Icon:** shield (already set in action.yml)
- **Color:** blue (already set in action.yml)

**Support Resources:**
- **Documentation URL:** Link to your README.md or ACTION_README.md
- **Support URL:** Link to GitHub Issues

**Terms:**
- Accept GitHub Marketplace Developer Agreement
- Confirm you comply with GitHub's Terms of Service

### 3.3 Publish

Click **Publish this Action**

## Step 4: Test the Published Action

Create a test Angular project and add the workflow:

```yaml
name: Test Published Action
on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: mirko1987/claude-angular-multiagent@v1
        with:
          anthropic-api-key: \${{ secrets.ANTHROPIC_API_KEY }}
```

## Step 5: Promote Your Action

### Share on:
- GitHub Discussions
- Twitter/X
- Reddit (r/Angular, r/github)
- Dev.to
- Angular community forums

### Example Tweet:

```
🚀 Just published Claude Angular Multi-Agent Review on GitHub Marketplace!

AI-powered code review for Angular using Claude Sonnet 4:
✅ Security analysis
✅ Architecture review  
✅ Performance optimization
✅ RxJS patterns
✅ Testing & accessibility

Try it: https://github.com/mirko1987/claude-angular-multiagent

#Angular #AI #CodeReview
```

## Updating the Action

### For Bug Fixes (Patch Version)

```bash
# Make changes
git add .
git commit -m "Fix: description of fix"
git push

# Create new tag
git tag -a v1.0.1 -m "Fix: description"
git push origin v1.0.1

# Update v1 tag to point to latest
git tag -fa v1 -m "Update v1 to v1.0.1"
git push origin v1 --force
```

### For New Features (Minor Version)

```bash
git tag -a v1.1.0 -m "Add: new feature"
git push origin v1.1.0

# Update v1 tag
git tag -fa v1 -m "Update v1 to v1.1.0"
git push origin v1 --force
```

### For Breaking Changes (Major Version)

```bash
git tag -a v2.0.0 -m "Breaking: description"
git push origin v2.0.0

# Create new major version tag
git tag -a v2 -m "Release v2"
git push origin v2
```

## Best Practices

1. **Semantic Versioning:** Use vX.Y.Z format
2. **Keep v1 Tag Updated:** Point it to latest v1.x.x release
3. **Test Before Publishing:** Run tests locally first
4. **Document Breaking Changes:** Clearly note in release notes
5. **Respond to Issues:** Monitor and respond to user issues
6. **Keep Dependencies Updated:** Regular security updates

## Monitoring

After publishing, monitor:

- GitHub Stars and Forks
- GitHub Issues and Discussions  
- Marketplace downloads/installs
- User feedback and questions

## Troubleshooting

### Action Not Found

- Ensure repository is public
- Verify tag exists: `git tag -l`
- Check action.yml is at repository root

### Marketplace Listing Rejected

- Ensure icon and color are set in action.yml
- Verify all required fields are filled
- Check Terms of Service compliance

### Users Report Errors

- Check GitHub Actions logs
- Test with different Angular projects
- Document known issues in README

## Success Checklist

- [ ] Repository is public
- [ ] All mirko1987 replaced with actual username
- [ ] action.yml configured correctly
- [ ] Documentation complete
- [ ] Tests pass
- [ ] Git tag created (v1.0.0 and v1)
- [ ] GitHub Release created
- [ ] Marketplace listing approved
- [ ] Test workflow runs successfully
- [ ] README updated with installation instructions
- [ ] License added

---

🎉 **Congratulations!** Your GitHub Action is now published!

Users can now use it with:

\`\`\`yaml
- uses: mirko1987/claude-angular-multiagent@v1
\`\`\`

Happy publishing! 🚀
