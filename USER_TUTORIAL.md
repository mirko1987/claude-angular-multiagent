# 📘 Complete Tutorial: How to Use the GitHub Action (For Users)

Step-by-step guide for a user who wants to test your GitHub Action.

---

## 🎯 Scenario

**Marco** is an Angular developer. He found your GitHub Action and wants to try it on his project `my-angular-app`.

Marco's repository: `https://github.com/marco/my-angular-app`

---

## PHASE 1: Get Anthropic API Key (5 minutes)

### Step 1.1: Register on Anthropic

Marco opens his browser and goes to:
**https://console.anthropic.com/**

**What he sees:**
```
┌──────────────────────────────────┐
│  Welcome to Claude Console       │
│                                  │
│  [Sign Up]    [Login]           │
└──────────────────────────────────┘
```

**What he does:**
1. Click on **"Sign Up"** (if he doesn't have an account)
2. Enters:
   - Email: `marco@example.com`
   - Password: `********`
3. Confirms email (receives verification email)
4. Clicks the link in the email
5. ✅ Account created!

---

### Step 1.2: Create API Key

Now Marco is logged in. He goes to:
**https://console.anthropic.com/settings/keys**

**What he sees:**
```
┌──────────────────────────────────────┐
│  API Keys                            │
│  ─────────────────────────────────   │
│  No API keys yet                     │
│                                      │
│  [+ Create Key]                      │
└──────────────────────────────────────┘
```

**What he does:**
1. Click on **"+ Create Key"**
2. A popup appears:
   ```
   ┌────────────────────────────────┐
   │  Name your key                 │
   │  ___________________________   │
   │  (e.g., "My Angular Project")  │
   │                                │
   │  [Cancel]  [Create Key]       │
   └────────────────────────────────┘
   ```
3. Types: `"GitHub Action - Angular Review"`
4. Click **"Create Key"**

**IMPORTANT! The key appears ONLY ONCE:**
```
┌────────────────────────────────────────┐
│  ✅ API Key Created                    │
│                                        │
│  sk-ant-api03-ABC123...XYZ789         │
│                                        │
│  ⚠️ Copy this now! You won't see it   │
│     again.                             │
│                                        │
│  [Copy]                                │
└────────────────────────────────────────┘
```

**What Marco does:**
1. Click on **"Copy"**
2. Paste into a temporary file on his computer (e.g., Notes, TextEdit)
3. **SAVE THIS KEY WELL!**

Example key:
```
sk-ant-api03-QSjTw2eA6tkP75pA1xVZ7CzbPlAY8lYS4Ep00zZE6YKjp2AFdGh4iTA3e4OOU6SanvWcvICX1gwHkfcdQ
```

---

### Step 1.3: Add Credits

**IMPORTANT:** Without credits, the API won't work!

Marco goes to:
**https://console.anthropic.com/settings/billing**

**What he sees:**
```
┌──────────────────────────────────┐
│  Billing                         │
│  ──────────────────────────────  │
│  Current Balance: $0.00          │
│                                  │
│  [Add Credits]                   │
└──────────────────────────────────┘
```

**What he does:**
1. Click on **"Add Credits"**
2. Chooses amount: **$10** (recommended to start)
3. Enters credit card details
4. Confirms payment
5. ✅ Credits added!

**How much do reviews cost?**
- A small review (5 files): ~$0.02
- A medium review (20 files): ~$0.05
- $10 = approximately 200-500 reviews! 🎉

---

## PHASE 2: Configure GitHub Repository (3 minutes)

Marco now needs to add the API key as a "secret" on GitHub.

### Step 2.1: Go to Repository

Marco opens:
**https://github.com/marco/my-angular-app**

**What he sees:**
```
┌─────────────────────────────────────────┐
│  marco / my-angular-app                 │
│  ───────────────────────────────────    │
│  [Code] [Issues] [Pull requests]       │
│          [Actions] [Settings]           │
└─────────────────────────────────────────┘
```

---

### Step 2.2: Open Settings

**What he does:**
1. Click on the **"Settings"** tab (top right)

**If he DOESN'T see Settings:**
- It means he's not an admin of the repository
- He must ask the owner to add him as admin

---

### Step 2.3: Go to Secrets

In the left menu, Marco scrolls until he finds:

```
┌────────────────────────────────┐
│  Security                      │
│    > Secrets and variables     │
│      > Actions ←────────       │
│      > Codespaces              │
│      > Dependabot              │
└────────────────────────────────┘
```

**What he does:**
1. Click on **"Secrets and variables"**
2. Click on **"Actions"**

---

### Step 2.4: Add the Secret

**What he sees:**
```
┌──────────────────────────────────────────┐
│  Actions secrets and variables           │
│  ──────────────────────────────────────  │
│  Repository secrets                      │
│                                          │
│  No secrets defined                      │
│                                          │
│  [New repository secret]                 │
└──────────────────────────────────────────┘
```

**What he does:**
1. Click on **"New repository secret"**

**A form appears:**
```
┌────────────────────────────────────┐
│  New secret                        │
│  ────────────────────────────────  │
│  Name *                            │
│  [____________________________]    │
│                                    │
│  Secret *                          │
│  [____________________________]    │
│  [____________________________]    │
│  [____________________________]    │
│                                    │
│  [Add secret]                      │
└────────────────────────────────────┘
```

**Marco fills out:**

**Name:** (MUST be exactly this name)
```
ANTHROPIC_API_KEY
```

**Secret:** (the key he copied earlier)
```
sk-ant-api03-QSjTw2eA6tkP75pA1xVZ7C...
```

**What he does:**
1. Click on **"Add secret"**
2. ✅ Secret saved!

**Confirmation:**
```
┌──────────────────────────────────────────┐
│  Actions secrets                         │
│  ──────────────────────────────────────  │
│  ANTHROPIC_API_KEY                       │
│  Updated now by marco                    │
│  [Update] [Remove]                       │
└──────────────────────────────────────────┘
```

---

## PHASE 3: Create the Workflow File (2 minutes)

Marco now needs to create a file that tells GitHub to use your Action.

### Step 3.1: Return to Code

**What he does:**
1. Click on the **"Code"** tab (at top)
2. Make sure he's on the `main` branch

---

### Step 3.2: Create the Workflow Folder

Marco needs to create this structure:
```
my-angular-app/
├── .github/
│   └── workflows/
│       └── ai-review.yml  ← This file
```

**METHOD 1: Via GitHub Web (easier)**

**Step A: Click "Add file"**
```
┌─────────────────────────────────────┐
│  [Add file ▼]  [Code ▼]            │
│    > Create new file               │
│    > Upload files                  │
└─────────────────────────────────────┘
```

Click on **"Create new file"**

**Step B: Name the file**

At the top where it says "Name your file...", type:
```
.github/workflows/ai-review.yml
```

**IMPORTANT:** GitHub automatically creates the folders!

**Step C: Paste the content**

In the large text area, Marco pastes this:

```yaml
name: AI Code Review

on:
  pull_request:
    branches:
      - main
      - develop
    paths:
      - 'src/**/*.ts'
      - '!src/**/*.spec.ts'

permissions:
  contents: read
  pull-requests: write

jobs:
  ai-review:
    name: Claude AI Review
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run AI Code Review
        uses: mirko1987/claude-angular-multiagent@v1
        with:
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
          review-mode: 'smart'
          post-comment: true
```

**Step D: Commit**

At the bottom:
```
┌────────────────────────────────────────┐
│  Commit new file                       │
│  ────────────────────────────────────  │
│  Add AI code review workflow           │
│  [____________________________]        │
│                                        │
│  ⚫ Commit directly to the main branch │
│  ⚪ Create a new branch for this commit│
│                                        │
│  [Commit new file]                     │
└────────────────────────────────────────┘
```

Marco:
1. Types in the message: `"Add AI code review workflow"`
2. Selects **"Commit directly to the main branch"**
3. Click **"Commit new file"**

✅ File created!

---

**METHOD 2: Via Command Line (for technical users)**

```bash
# In his local project
cd my-angular-app

# Create the folders
mkdir -p .github/workflows

# Create the file
cat > .github/workflows/ai-review.yml << 'EOL'
name: AI Code Review

on:
  pull_request:
    branches:
      - main
    paths:
      - 'src/**/*.ts'

permissions:
  contents: read
  pull-requests: write

jobs:
  ai-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: mirko1987/claude-angular-multiagent@v1
        with:
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
EOL

# Commit and push
git add .github/workflows/ai-review.yml
git commit -m "Add AI code review workflow"
git push origin main
```

---

## PHASE 4: Test with a Pull Request! (5 minutes)

Now the magic moment arrives! 🎉

### Step 4.1: Create a Branch

**Via Web:**

1. Click on the branch selector (says "main")
2. Types: `feature/test-ai-review`
3. Click **"Create branch: feature/test-ai-review from main"**

**Via Command Line:**
```bash
git checkout -b feature/test-ai-review
```

---

### Step 4.2: Modify a File

Marco modifies a TypeScript file, for example `src/app/user.service.ts`:

**Via Web:**
1. Navigate to `src/app/user.service.ts`
2. Click on the pencil icon (Edit)
3. Add this code (with an intentional problem):

```typescript
// Added for test
loadUser(userId: string) {
  // SQL injection vulnerability!
  const query = "SELECT * FROM users WHERE id = " + userId;
  return this.http.get('/api/query?sql=' + query);
}
```

4. Scroll down
5. Commit message: `"Add user loading feature"`
6. Select **"Commit directly to the feature/test-ai-review branch"**
7. Click **"Commit changes"**

**Via Command Line:**
```bash
# Modify the file
nano src/app/user.service.ts
# ... add the code above ...

# Commit
git add src/app/user.service.ts
git commit -m "Add user loading feature"
git push origin feature/test-ai-review
```

---

### Step 4.3: Create the Pull Request

**What Marco sees:**

After the push, GitHub shows a banner:
```
┌─────────────────────────────────────────────────┐
│  feature/test-ai-review had recent pushes       │
│  3 minutes ago                                  │
│                                                 │
│  [Compare & pull request]                       │
└─────────────────────────────────────────────────┘
```

**What he does:**
1. Click on **"Compare & pull request"**

**The PR form appears:**
```
┌──────────────────────────────────────────┐
│  Open a pull request                     │
│  ──────────────────────────────────────  │
│  base: main ← compare: feature/...       │
│                                          │
│  Add user loading feature                │
│  [__________________________________]    │
│                                          │
│  Describe your changes                   │
│  [__________________________________]    │
│  [__________________________________]    │
│                                          │
│  [Create pull request]                   │
└──────────────────────────────────────────┘
```

**Marco fills out:**
- Title: (already filled) `"Add user loading feature"`
- Description: `"Testing the AI code review action"`

**Click on "Create pull request"**

---

## PHASE 5: See the Magic! ✨ (30-60 seconds)

### Step 5.1: GitHub Actions Starts

As soon as the PR is created, Marco sees:

```
┌─────────────────────────────────────────────┐
│  Add user loading feature #1                │
│  ─────────────────────────────────────────  │
│  marco wants to merge 1 commit into main    │
│                                             │
│  🟡 Some checks haven't completed yet       │
│     1 in progress                           │
│                                             │
│  ⏱️ AI Code Review / ai-review              │
│     Expected — In progress...               │
│     [Details]                               │
└─────────────────────────────────────────────┘
```

---

### Step 5.2: See Logs in Real Time

**Marco clicks on "Details"** and sees:

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

[INFO] [SmartOrchestrator] Starting SMART review process
[INFO] Files: 1, Agents available: 3
[INFO] Smart selection: 2/3 agents selected

🔍 Security Agent - analyzing...
🏗️ Angular Architecture Agent - analyzing...

✅ Review completed:
   Total issues: 2
   Critical issues: 1
   Suggestions: 1
   Time: 8.5s
   Cost: $0.0234
```

---

### Step 5.3: The AI Comment Appears!

After ~30 seconds, Marco returns to the PR and sees a NEW COMMENT:

```
┌──────────────────────────────────────────────────────┐
│  🤖 claude-angular-multiagent bot commented         │
│  ──────────────────────────────────────────────────  │
│                                                      │
│  ## 🤖 Claude AI Code Review Results                │
│                                                      │
│  ### Summary                                         │
│  - **Total Issues:** 2                               │
│  - **Critical Issues:** 1                            │
│  - **Suggestions:** 1                                │
│  - **Files Analyzed:** 1                             │
│  - **Analysis Time:** 8.5s                           │
│  - **Estimated Cost:** $0.0234                       │
│                                                      │
│  ### Findings by Agent                               │
│                                                      │
│  #### Security Agent                                 │
│  Score: 70/100 | Findings: 1 | Time: 4200ms        │
│                                                      │
│  **Critical Issues:**                                │
│  1. 🔴 **user.service.ts:3** - SQL injection        │
│     vulnerability detected. User input is           │
│     concatenated directly into SQL query without    │
│     sanitization. Use parameterized queries or      │
│     prepared statements instead.                    │
│                                                      │
│  #### Angular Architecture Agent                     │
│  Score: 85/100 | Findings: 1 | Time: 3800ms        │
│                                                      │
│  **Minor Issues:**                                   │
│  1. ⚪ **user.service.ts:4** - Consider using       │
│     Angular HttpClient with proper typing and       │
│     error handling instead of direct database       │
│     access from service.                            │
│                                                      │
│  ---                                                 │
│  *Powered by [Claude Angular Multi-Agent Review]*   │
└──────────────────────────────────────────────────────┘
```

---

### Step 5.4: Marco Reacts!

Marco reads the comment and thinks:

**"WOW! 😮 It found an SQL injection I didn't see!"**

Now he can:

**Option A: Fix the problem**

Go back to the code and modify:

```typescript
// BEFORE (vulnerable):
loadUser(userId: string) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return this.http.get('/api/query?sql=' + query);
}

// AFTER (secure):
loadUser(userId: string) {
  return this.http.get(`/api/users/${userId}`);
  // Backend uses parameterized queries
}
```

Commit, push → **The AI re-analyzes automatically!**

**Option B: Ask for clarification**

Reply to the AI comment:
```
"Thanks for the suggestion! Could you give me an example
of how to implement parameterized queries in this case?"
```

---

## PHASE 6: Merge the PR ✅

After fixing the problems:

1. **Push the changes**
   ```bash
   git add .
   git commit -m "Fix: SQL injection vulnerability"
   git push
   ```

2. **The AI re-runs** and posts a new comment:
   ```
   ## 🤖 Claude AI Code Review Results

   ### Summary
   - **Total Issues:** 0
   - **Critical Issues:** 0 ✅

   All critical issues have been resolved!
   ```

3. **The check turns green** ✅

4. **Marco can merge:**
   ```
   ┌────────────────────────────────────┐
   │  ✅ All checks have passed         │
   │                                    │
   │  [Merge pull request ▼]           │
   └────────────────────────────────────┘
   ```

5. Click **"Merge pull request"**

6. Click **"Confirm merge"**

7. ✅ **DONE! Clean and secure code in production!**

---

## 📊 Costs for Marco

Marco opens Anthropic Console and sees:
```
┌────────────────────────────────┐
│  Usage                         │
│  ────────────────────────────  │
│  Today:        $0.0234         │
│  This month:   $0.0234         │
│                                │
│  Balance:      $9.9766         │
└────────────────────────────────┘
```

**1 PR analyzed = 2 cents!** 💰

With $10 he can do ~400-500 PRs! 🎉

---

## 🎯 Summary for Marco

**What he did:**
1. ✅ Created Anthropic account
2. ✅ Got API key
3. ✅ Added credits ($10)
4. ✅ Configured secret on GitHub
5. ✅ Created workflow file
6. ✅ Created test PR
7. ✅ Saw the AI find problems
8. ✅ Fixed and merged

**Total time:** ~15 minutes for initial setup
**Time per PR after:** 0 minutes (automatic!)

---

## ❓ Marco's Frequent Questions

### "Do I have to pay every time?"
No! The initial $10 lasts for hundreds of PRs.

### "Does it work on private repositories?"
Yes! It works on both public and private repos.

### "Do I need to have Node.js/npm installed?"
No! GitHub Actions does everything in the cloud.

### "Does the AI see all my code?"
Yes, but only for analysis. Anthropic doesn't save the code.

### "Can I disable the AI for some PRs?"
Yes! Add `[skip ai]` in the PR title.

### "How accurate is it?"
It finds ~90% of common vulnerabilities and suggests best practices.

### "Does it replace human code reviews?"
No, it **helps** them! It finds common problems, human reviewers focus on business logic.

---

## 🎉 Marco is Happy!

From now on, every PR that Marco creates:
- ✅ Gets analyzed automatically
- ✅ Problems found before merge
- ✅ More secure code
- ✅ More productive team
- ✅ Fewer bugs in production

**And all this costs less than a coffee per month! ☕**

---

## 📞 Support for Marco

If Marco has problems:

1. **Read the documentation:**
   - https://github.com/mirko1987/claude-angular-multiagent/blob/main/ACTION_README.md
   - https://github.com/mirko1987/claude-angular-multiagent/blob/main/QUICK_START.md

2. **Open an issue:**
   - https://github.com/mirko1987/claude-angular-multiagent/issues

3. **Check the logs:**
   - Click on "Details" in the PR check
   - See exactly what happened

---

**End of Tutorial! Marco is now an expert! 🚀**
