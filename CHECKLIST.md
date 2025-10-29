# 📋 Publishing Checklist

Use this checklist when publishing your GitHub Action.

## Pre-Publishing Checklist

### Code & Build
- [ ] Run `npm install` - Dependencies installed
- [ ] Run `npm run build` - Build successful
- [ ] Run `node test-compiled.js` - Test runs (may fail on credits, that's OK)
- [ ] No TypeScript errors
- [ ] No console errors

### Documentation
- [ ] Replace all `mirko1987` with actual GitHub username in:
  - [ ] action.yml (line 3)
  - [ ] ACTION_README.md (all examples)
  - [ ] QUICK_START.md (workflow examples)
  - [ ] PUBLISHING.md (instructions)
  - [ ] example-usage.yml
  - [ ] SETUP_COMPLETE.md
  
- [ ] Add your name in action.yml author field
- [ ] Review README.md is accurate
- [ ] Review ACTION_README.md examples work
- [ ] Check all links are valid

### Repository Setup
- [ ] Repository is public on GitHub
- [ ] Add LICENSE file (MIT recommended)
- [ ] Add .gitignore (exists)
- [ ] Update package.json author/description
- [ ] Remove any sensitive data or API keys

### Git Preparation
- [ ] Commit all changes: `git add .`
- [ ] Push to main: `git push origin main`
- [ ] Repository is clean: `git status`

## Publishing Steps

### 1. Create Tags
- [ ] Create version tag:
  \`\`\`bash
  git tag -a v1.0.0 -m "Release v1.0.0 - Initial public release"
  git push origin v1.0.0
  \`\`\`

- [ ] Create major version tag:
  \`\`\`bash
  git tag -a v1 -m "Release v1 (points to v1.0.0)"
  git push origin v1
  \`\`\`

- [ ] Verify tags exist: `git tag -l`

### 2. GitHub Release
- [ ] Go to GitHub repository
- [ ] Click Releases → Create new release
- [ ] Choose tag: v1.0.0
- [ ] Title: "v1.0.0 - Initial Release"
- [ ] Add release description (see PUBLISHING.md)
- [ ] Click "Publish release"

### 3. GitHub Marketplace
- [ ] Go to Settings → GitHub Marketplace
- [ ] Click "List this Action on GitHub Marketplace"
- [ ] Fill in listing information:
  - [ ] Name: Claude Angular Multi-Agent Review
  - [ ] Primary Category: Code Quality
  - [ ] Description: (from action.yml)
  - [ ] Icon: shield (already set)
  - [ ] Color: blue (already set)
- [ ] Add support resources:
  - [ ] Documentation URL
  - [ ] Support URL (Issues page)
- [ ] Accept terms
- [ ] Click "Publish"

## Post-Publishing

### Testing
- [ ] Create test Angular project
- [ ] Add workflow using your published action
- [ ] Add ANTHROPIC_API_KEY secret
- [ ] Create test PR
- [ ] Verify action runs
- [ ] Check PR comment appears
- [ ] Verify outputs are correct

### Promotion
- [ ] Share on Twitter/X
- [ ] Post on Reddit (r/Angular, r/github)
- [ ] Write article on Dev.to
- [ ] Share in Angular communities
- [ ] Add to Awesome Angular lists

### Monitoring
- [ ] Watch GitHub Issues
- [ ] Monitor GitHub Discussions
- [ ] Check Marketplace downloads
- [ ] Respond to user questions
- [ ] Fix reported bugs

## Quick Reference

### Key Files
\`\`\`
action.yml              # Action definition - REPLACE mirko1987
run-action.js           # Runner script
ACTION_README.md        # User documentation - REPLACE mirko1987  
QUICK_START.md          # Getting started - REPLACE mirko1987
PUBLISHING.md           # Publishing guide
example-usage.yml       # Workflow template - REPLACE mirko1987
\`\`\`

### Key Commands
\`\`\`bash
# Build
npm install
npm run build

# Test
node test-compiled.js

# Tag and Release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
git tag -a v1 -m "Release v1"
git push origin v1

# Update v1 tag later
git tag -fa v1 -m "Update to v1.0.1"
git push origin v1 --force
\`\`\`

### Usage Example (After Publishing)
\`\`\`yaml
- uses: mirko1987/claude-angular-multiagent@v1
  with:
    anthropic-api-key: \${{ secrets.ANTHROPIC_API_KEY }}
\`\`\`

## Troubleshooting

### "Action not found" error
- [ ] Verify repository is public
- [ ] Check tag v1 exists: `git tag -l`
- [ ] Ensure action.yml is at root
- [ ] Wait 5-10 minutes after publishing

### "Invalid action" error
- [ ] Check action.yml syntax
- [ ] Verify all required fields present
- [ ] Validate runs.using is "composite"

### Tests fail with credits error
- [ ] This is expected if no Anthropic credits
- [ ] Code is working correctly
- [ ] Agents will work when users have credits

## Final Verification

Before marking as complete:
- [ ] Action appears in GitHub Marketplace
- [ ] Can search for it on marketplace.github.com
- [ ] Test workflow runs successfully
- [ ] PR comments are posted correctly
- [ ] Documentation is clear
- [ ] All examples work
- [ ] No broken links

## Success Criteria

✅ All items checked
✅ Action published to Marketplace
✅ Test run successful
✅ Documentation complete
✅ Ready for users

---

**When all items are checked, your action is ready! 🎉**

Share it with the community and help make Angular code reviews better!
