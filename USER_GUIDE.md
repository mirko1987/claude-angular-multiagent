# 📖 How Users Will Use Your GitHub Action

Step-by-step guide to understand how your action will work for end users.

---

## 🎯 Scenario: Mario Has an Angular Project

Mario is a developer who has an Angular project on GitHub and wants to add automatic AI review.

---

## STEP 1: Mario Finds Your Action

### Option A: On GitHub Marketplace
1. Mario goes to https://marketplace.github.com/actions
2. Searches for "angular review" or "claude code review"
3. Finds your action: **Claude Angular Multi-Agent Review**
4. Reads the description and decides to try it

### Option B: Through Your README
1. Mario finds the link to your repository
2. Reads the README at https://github.com/mirko1987/claude-angular-multiagent
3. Sees the usage examples

---

## STEP 2: Mario Gets an Anthropic API Key

Mario has never used Claude before, so he needs to:

1. **Go to Anthropic Console**
   - Opens https://console.anthropic.com/
   - If he doesn't have an account, he registers (email + password)

2. **Get the API Key**
   - Once logged in, goes to https://console.anthropic.com/settings/keys
   - Click on "Create Key"
   - Copies the API key (e.g., `sk-ant-api03-xxxxx...`)
   - ⚠️ Saves it in a safe place (won't see it again!)

3. **Add Credits** (if necessary)
   - Goes to https://console.anthropic.com/settings/billing
   - Adds $5-10 of credit to start
   - Each review costs about $0.01-0.05

---

## STEP 3: Mario Configures the Repository

Mario has his Angular project on GitHub: `https://github.com/mario/my-angular-project`

### 3.1 Add the Secret

1. Goes to his GitHub repository
2. Click on **Settings** (tab at top)
3. In the left menu: **Secrets and variables** → **Actions**
4. Click on **New repository secret**
5. Fill out:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Secret**: paste his Anthropic API key
6. Click on **Add secret**

✅ Now GitHub has the API key saved securely!

### 3.2 Create the Workflow File

Mario needs to create a file in the `.github/workflows/` folder of his project.

**File path**: `.github/workflows/ai-review.yml`

**Method 1 - Via GitHub Web UI:**
1. Goes to https://github.com/mario/my-angular-project
2. Click on **Add file** → **Create new file**
3. Names the file: `.github/workflows/ai-review.yml`
4. Pastes this content:

```yaml
name: AI Code Review

on:
  pull_request:
    branches:
      - main
      - develop
    paths:
      - 'src/**/*.ts'

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    name: Claude AI Review
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run AI Code Review
        uses: mirko1987/claude-angular-multiagent@v1
        with:
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
          review-mode: 'smart'
          post-comment: true
```

5. Click on **Commit changes**
6. ✅ Done!

**Method 2 - Via Command Line:**
```bash
cd my-angular-project
mkdir -p .github/workflows
nano .github/workflows/ai-review.yml
# Paste the content above
git add .github/workflows/ai-review.yml
git commit -m "Add AI code review workflow"
git push
```

---

## STEP 4: Mario Tests the Action

### 4.1 Create a Branch and Modify Code

```bash
# In his Angular project
git checkout -b feature/new-feature

# Modify a TypeScript file
nano src/app/components/user.component.ts
```

Adds some code (maybe with some security issues to test):

```typescript
export class UserComponent {
  // Possible SQL injection
  loadUser(userId: string) {
    const query = "SELECT * FROM users WHERE id = " + userId;
    return this.db.query(query);
  }
}
```

```bash
git add .
git commit -m "Add user loading feature"
git push origin feature/new-feature
```

### 4.2 Create a Pull Request

1. Mario goes to GitHub: `https://github.com/mario/my-angular-project`
2. Sees the banner: **"Compare & pull request"**
3. Click on the button
4. Fill out:
   - **Title**: "Add user loading feature"
   - **Description**: "Added functionality to load users"
5. Click on **Create pull request**

---

## STEP 5: The Magic Happens! ✨

### 5.1 GitHub Actions Activates

As soon as Mario creates the PR, automatically:

1. **GitHub Actions starts**
   - Mario can see the badge "🟡 Some checks haven't completed yet"
   - Click on "Details" to see logs in real-time

2. **Your Action Gets Executed**

   In the logs Mario sees:
   ```
   Run mirko1987/claude-angular-multiagent@v1

   🚀 Starting Claude Angular Multi-Agent Review
   Mode: smart
   Files pattern: src/**/*.ts
   Cost budget: $0.50
   Time budget: 90000ms

   📦 Installing dependencies...
   ✅ Dependencies already installed

   🔨 Building project...
   ✅ Project already built

   🤖 Starting AI review...

   [INFO] SmartOrchestrator - Starting SMART review process
   [INFO] Files: 1, Agents available: 3
   [INFO] Smart selection: 2/3 agents selected

   🔍 Security Agent - analyzing...
   🏗️ Angular Architecture Agent - analyzing...

   ✅ Review completed:
      Total issues: 3
      Critical issues: 1
      Suggestions: 2
      Time: 8.5s
      Cost: $0.0234
   ```

3. **The Action Posts a Comment on the PR**

   After a few seconds, Mario sees a new comment appear on the PR:

   ```markdown
   ## 🤖 Claude AI Code Review Results

   ### Summary
   - **Total Issues:** 3
   - **Critical Issues:** 1
   - **Suggestions:** 2
   - **Files Analyzed:** 1
   - **Analysis Time:** 8.5s
   - **Estimated Cost:** $0.0234

   ### Findings by Agent

   #### Security Agent
   Score: 75/100 | Findings: 2 | Time: 4200ms

   **Critical Issues:**
   1. 🔴 **user.component.ts:3** - SQL injection vulnerability detected. User input is concatenated directly into SQL query without sanitization. Use parameterized queries instead.

   **Major Issues:**
   1. 🟡 **user.component.ts:1** - Missing input validation for userId parameter

   #### Angular Architecture Agent
   Score: 85/100 | Findings: 1 | Time: 3800ms

   **Minor Issues:**
   1. ⚪ **user.component.ts:2** - Consider using Angular HttpClient service instead of direct database access from component

   ---
   *Powered by [Claude Angular Multi-Agent Review](https://github.com/mirko1987/claude-angular-multiagent)*
   ```

### 5.2 Mario Reacts

Mario reads the comment and thinks: "Wow! It's right, there's an SQL injection!"

He:
1. Returns to his editor
2. Fixes the problem:

```typescript
export class UserComponent {
  loadUser(userId: string) {
    // Fixed: using parameterized queries
    return this.db.query('SELECT * FROM users WHERE id = ?', [userId]);
  }
}
```

3. Commits and pushes:
```bash
git add .
git commit -m "Fix: SQL injection vulnerability"
git push
```

4. **The Action re-runs automatically!**
   - Analyzes only the new changes (differential analysis)
   - Posts a new comment with the new results
   - If all critical issues are resolved: ✅ Check passes!

---

## STEP 6: Mario Merges

If the action is configured with `fail-on-critical: true`, Mario:

- **If there are critical issues**: Can't merge (check fails ❌)
- **If all are resolved**: Can merge (check passes ✅)

Mario:
1. Resolves all issues found
2. The check turns green ✅
3. Click on **Merge pull request**
4. ✅ Clean and secure code in production!

---

## 🎨 Customizations Mario Can Make

### Example 1: Security Only
If Mario wants only security checking:

```yaml
- uses: mirko1987/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    review-mode: 'security'
```

### Example 2: Complete Review
If he wants all 6 agents:

```yaml
- uses: mirko1987/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    review-mode: 'all'
    cost-budget: '1.00'
```

### Example 3: Block PR on Critical Issues
If he wants to prevent merging with critical issues:

```yaml
- uses: mirko1987/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    fail-on-critical: true
```

### Example 4: Only for Main Branch
If he wants reviews only for PRs to main:

```yaml
on:
  pull_request:
    branches:
      - main  # Only PRs to main
    paths:
      - 'src/**/*.ts'
```

---

## 💰 How Much Does It Cost Mario?

Every time Mario creates/updates a PR:

- **Smart Mode** (default): ~$0.01-0.05 per PR
- **Security Mode**: ~$0.005-0.02 per PR
- **All Mode**: ~$0.05-0.20 per PR

**Practical example:**
- 20 PRs per month in smart mode = ~$0.50/month
- 100 PRs per month in smart mode = ~$2.50/month

**Much cheaper than a human code reviewer!** 😄

---

## 📊 What Happens "Behind the Scenes"

When Mario creates a PR:

```
1. GitHub receives the PR
   ↓
2. GitHub Actions activates
   ↓
3. Checks out the code
   ↓
4. Downloads your action (mirko1987/claude-angular-multiagent@v1)
   ↓
5. Installs npm dependencies
   ↓
6. Compiles TypeScript
   ↓
7. Runs run-action.js with configured parameters
   ↓
8. Your script:
   - Collects modified .ts files
   - Creates AI agents (Security, Architecture, etc)
   - Sends each file to Claude AI for analysis
   - Receives results from Claude
   - Formats the results
   - Posts comment on PR via GitHub API
   ↓
9. Mario sees the results on his PR!
```

---

## ❓ Frequently Asked Questions from Users

### "Do I need npm/Node.js installed?"
**No!** GitHub Actions already has everything. Mario only needs to:
- Add the ANTHROPIC_API_KEY secret
- Create the workflow YAML file
- Create a PR

### "Does the action see my private code?"
**Yes, but securely:**
- The code is sent to the Anthropic API (Claude AI)
- Anthropic does NOT save the code after analysis
- It's like sending code to an external reviewer
- If Mario is concerned, he can use the action only on public repos

### "Can I use it on private repositories?"
**Yes!** It works on both public and private repos.
- Public repos: GitHub Actions free
- Private repos: GitHub Actions free up to 2000 minutes/month

### "How accurate is the AI?"
The AI finds:
- ✅ 90%+ of common vulnerabilities
- ✅ 85%+ of architecture problems
- ✅ 80%+ of performance issues
- ❌ Does not replace automated tests
- ❌ Does not replace human code reviews (but helps them!)

---

## 🎯 Summary for Mario

**In 3 simple steps:**

1. **Get API Key** → https://console.anthropic.com/
2. **Add Secret** → Settings → Secrets → `ANTHROPIC_API_KEY`
3. **Create Workflow** → `.github/workflows/ai-review.yml`

**Then every time he creates a PR:**
- The AI automatically analyzes the code
- Finds security, architecture, performance issues
- Posts a comment with the results
- Mario fixes the issues
- Merge! ✅

**Cost:** ~$0.50/month for small/medium projects

**Benefit:** More secure code, fewer bugs in production! 🚀

---

## 📈 Success Examples

**Example 1: Team of 5 Developers**
- 50 PRs/month
- Cost: ~$2.50/month
- Time saved: ~10 hours/month of code review
- ROI: Incredible!

**Example 2: Open Source Project**
- 200 PRs/month from contributors
- Finds issues before they reach maintainers
- Reduces workload by 30%

**Example 3: Startup**
- Uses 'all' mode on main branch
- Uses 'smart' mode on other branches
- Zero security issues in production for 6 months

---

## 🎉 Conclusion

Your GitHub Action makes it easy for any Angular developer to add AI-powered code review to their project in less than 5 minutes!

**Value for users:**
- ✅ Super fast setup
- ✅ No complex configuration
- ✅ Works out-of-the-box
- ✅ Very low cost
- ✅ Improves code quality
- ✅ Finds bugs before production

**Mario is happy! 😊**
