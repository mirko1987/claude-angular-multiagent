# 📘 Tutorial Completo: Come Usare la GitHub Action (Per Utenti)

Guida passo-passo per un utente che vuole testare la tua GitHub Action.

---

## 🎯 Scenario

**Marco** è uno sviluppatore Angular. Ha trovato la tua GitHub Action e vuole provarla sul suo progetto `my-angular-app`.

Repository di Marco: `https://github.com/marco/my-angular-app`

---

## FASE 1: Ottenere l'API Key di Anthropic (5 minuti)

### Step 1.1: Registrarsi su Anthropic

Marco apre il browser e va su:
**https://console.anthropic.com/**

**Cosa vede:**
```
┌──────────────────────────────────┐
│  Welcome to Claude Console       │
│                                  │
│  [Sign Up]    [Login]           │
└──────────────────────────────────┘
```

**Cosa fa:**
1. Click su **"Sign Up"** (se non ha un account)
2. Inserisce:
   - Email: `marco@example.com`
   - Password: `********`
3. Conferma email (riceve email di verifica)
4. Click sul link nell'email
5. ✅ Account creato!

---

### Step 1.2: Creare l'API Key

Ora Marco è loggato. Va su:
**https://console.anthropic.com/settings/keys**

**Cosa vede:**
```
┌──────────────────────────────────────┐
│  API Keys                            │
│  ─────────────────────────────────   │
│  No API keys yet                     │
│                                      │
│  [+ Create Key]                      │
└──────────────────────────────────────┘
```

**Cosa fa:**
1. Click su **"+ Create Key"**
2. Gli appare un popup:
   ```
   ┌────────────────────────────────┐
   │  Name your key                 │
   │  ___________________________   │
   │  (e.g., "My Angular Project")  │
   │                                │
   │  [Cancel]  [Create Key]       │
   └────────────────────────────────┘
   ```
3. Scrive: `"GitHub Action - Angular Review"`
4. Click **"Create Key"**

**IMPORTANTE! Appare la chiave UNA SOLA VOLTA:**
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

**Cosa fa Marco:**
1. Click su **"Copy"** 
2. Incolla in un file temporaneo sul suo computer (es: Note, TextEdit)
3. **SALVA BENE QUESTA CHIAVE!**

Esempio di chiave:
```
sk-ant-api03-QSjTw2eA6tkP75pA1xVZ7CzbPlAY8lYS4Ep00zZE6YKjp2AFdGh4iTA3e4OOU6SanvWcvICX1gwHkfcdQ
```

---

### Step 1.3: Aggiungere Crediti

**IMPORTANTE:** Senza crediti, l'API non funziona!

Marco va su:
**https://console.anthropic.com/settings/billing**

**Cosa vede:**
```
┌──────────────────────────────────┐
│  Billing                         │
│  ──────────────────────────────  │
│  Current Balance: $0.00          │
│                                  │
│  [Add Credits]                   │
└──────────────────────────────────┘
```

**Cosa fa:**
1. Click su **"Add Credits"**
2. Sceglie importo: **$10** (raccomandato per iniziare)
3. Inserisce dati carta di credito
4. Conferma pagamento
5. ✅ Crediti aggiunti!

**Quanto costano le review?**
- Una review piccola (5 file): ~$0.02
- Una review media (20 file): ~$0.05
- $10 = circa 200-500 review! 🎉

---

## FASE 2: Configurare il Repository GitHub (3 minuti)

Marco ora deve aggiungere l'API key come "secret" su GitHub.

### Step 2.1: Andare sul Repository

Marco apre:
**https://github.com/marco/my-angular-app**

**Cosa vede:**
```
┌─────────────────────────────────────────┐
│  marco / my-angular-app                 │
│  ───────────────────────────────────    │
│  [Code] [Issues] [Pull requests]       │
│          [Actions] [Settings]           │
└─────────────────────────────────────────┘
```

---

### Step 2.2: Aprire Settings

**Cosa fa:**
1. Click sulla tab **"Settings"** (in alto a destra)

**Se NON vede Settings:**
- Significa che non è admin del repository
- Deve chiedere al proprietario di aggiungerlo come admin

---

### Step 2.3: Andare ai Secrets

Nel menu a sinistra, Marco scorre fino a trovare:

```
┌────────────────────────────────┐
│  Security                      │
│    > Secrets and variables     │
│      > Actions ←────────       │
│      > Codespaces              │
│      > Dependabot              │
└────────────────────────────────┘
```

**Cosa fa:**
1. Click su **"Secrets and variables"**
2. Click su **"Actions"**

---

### Step 2.4: Aggiungere il Secret

**Cosa vede:**
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

**Cosa fa:**
1. Click su **"New repository secret"**

**Appare un form:**
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

**Marco compila:**

**Name:** (DEVE essere esattamente questo nome)
```
ANTHROPIC_API_KEY
```

**Secret:** (la chiave che ha copiato prima)
```
sk-ant-api03-QSjTw2eA6tkP75pA1xVZ7C...
```

**Cosa fa:**
1. Click su **"Add secret"**
2. ✅ Secret salvato!

**Conferma:**
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

## FASE 3: Creare il Workflow File (2 minuti)

Marco ora deve creare un file che dice a GitHub di usare la tua Action.

### Step 3.1: Tornare al Codice

**Cosa fa:**
1. Click sulla tab **"Code"** (in alto)
2. Assicurarsi di essere sul branch `main`

---

### Step 3.2: Creare la Cartella Workflow

Marco deve creare questa struttura:
```
my-angular-app/
├── .github/
│   └── workflows/
│       └── ai-review.yml  ← Questo file
```

**METODO 1: Via GitHub Web (più facile)**

**Passo A: Click "Add file"**
```
┌─────────────────────────────────────┐
│  [Add file ▼]  [Code ▼]            │
│    > Create new file               │
│    > Upload files                  │
└─────────────────────────────────────┘
```

Click su **"Create new file"**

**Passo B: Nomina il file**

In alto dove dice "Name your file...", scrive:
```
.github/workflows/ai-review.yml
```

**IMPORTANTE:** GitHub crea automaticamente le cartelle!

**Passo C: Incolla il contenuto**

Nella grande area di testo, Marco incolla questo:

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

**Passo D: Commit**

In basso:
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
1. Scrive nel messaggio: `"Add AI code review workflow"`
2. Seleziona **"Commit directly to the main branch"**
3. Click **"Commit new file"**

✅ File creato!

---

**METODO 2: Via Linea di Comando (per utenti tecnici)**

```bash
# Nel suo progetto locale
cd my-angular-app

# Crea le cartelle
mkdir -p .github/workflows

# Crea il file
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

# Commit e push
git add .github/workflows/ai-review.yml
git commit -m "Add AI code review workflow"
git push origin main
```

---

## FASE 4: Testare con una Pull Request! (5 minuti)

Ora arriva il momento magico! 🎉

### Step 4.1: Creare un Branch

**Via Web:**

1. Click sul selector del branch (dice "main")
2. Scrive: `feature/test-ai-review`
3. Click **"Create branch: feature/test-ai-review from main"**

**Via Command Line:**
```bash
git checkout -b feature/test-ai-review
```

---

### Step 4.2: Modificare un File

Marco modifica un file TypeScript, per esempio `src/app/user.service.ts`:

**Via Web:**
1. Naviga a `src/app/user.service.ts`
2. Click sull'icona matita (Edit)
3. Aggiunge questo codice (con un problema intenzionale):

```typescript
// Aggiunto per test
loadUser(userId: string) {
  // SQL injection vulnerability!
  const query = "SELECT * FROM users WHERE id = " + userId;
  return this.http.get('/api/query?sql=' + query);
}
```

4. Scroll in basso
5. Commit message: `"Add user loading feature"`
6. Seleziona **"Commit directly to the feature/test-ai-review branch"**
7. Click **"Commit changes"**

**Via Command Line:**
```bash
# Modifica il file
nano src/app/user.service.ts
# ... aggiungi il codice sopra ...

# Commit
git add src/app/user.service.ts
git commit -m "Add user loading feature"
git push origin feature/test-ai-review
```

---

### Step 4.3: Creare la Pull Request

**Cosa vede Marco:**

Dopo il push, GitHub mostra un banner:
```
┌─────────────────────────────────────────────────┐
│  feature/test-ai-review had recent pushes       │
│  3 minutes ago                                  │
│                                                 │
│  [Compare & pull request]                       │
└─────────────────────────────────────────────────┘
```

**Cosa fa:**
1. Click su **"Compare & pull request"**

**Appare il form della PR:**
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

**Marco compila:**
- Title: (già compilato) `"Add user loading feature"`
- Description: `"Testing the AI code review action"`

**Click su "Create pull request"**

---

## FASE 5: Vedere la Magia! ✨ (30-60 secondi)

### Step 5.1: GitHub Actions Parte

Appena creata la PR, Marco vede:

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

### Step 5.2: Vedere i Log in Tempo Reale

**Marco click su "Details"** e vede:

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

🤖 Avvio review AI...

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

### Step 5.3: Il Commento dell'AI Appare!

Dopo ~30 secondi, Marco torna sulla PR e vede un NUOVO COMMENTO:

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

### Step 5.4: Marco Reagisce!

Marco legge il commento e pensa:

**"WOW! 😮 Ha trovato un SQL injection che non avevo visto!"**

Ora può:

**Opzione A: Fixare il problema**

Torna al codice e modifica:

```typescript
// PRIMA (vulnerabile):
loadUser(userId: string) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return this.http.get('/api/query?sql=' + query);
}

// DOPO (sicuro):
loadUser(userId: string) {
  return this.http.get(`/api/users/${userId}`);
  // Backend usa query parametrizzate
}
```

Commit, push → **L'AI ri-analizza automaticamente!**

**Opzione B: Chiedere chiarimenti**

Risponde al commento dell'AI:
```
"Grazie per il suggerimento! Potresti darmi un esempio
di come implementare query parametrizzate in questo caso?"
```

---

## FASE 6: Merge della PR ✅

Dopo aver fixato i problemi:

1. **Push delle modifiche**
   ```bash
   git add .
   git commit -m "Fix: SQL injection vulnerability"
   git push
   ```

2. **L'AI ri-esegue** e posta nuovo commento:
   ```
   ## 🤖 Claude AI Code Review Results
   
   ### Summary
   - **Total Issues:** 0
   - **Critical Issues:** 0 ✅
   
   All critical issues have been resolved!
   ```

3. **Il check diventa verde** ✅

4. **Marco può fare merge:**
   ```
   ┌────────────────────────────────────┐
   │  ✅ All checks have passed         │
   │                                    │
   │  [Merge pull request ▼]           │
   └────────────────────────────────────┘
   ```

5. Click **"Merge pull request"**

6. Click **"Confirm merge"**

7. ✅ **DONE! Codice pulito e sicuro in production!**

---

## 📊 Costi per Marco

Marco apre Anthropic Console e vede:
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

**1 PR analizzata = 2 centesimi!** 💰

Con $10 può fare ~400-500 PR! 🎉

---

## 🎯 Riassunto per Marco

**Cosa ha fatto:**
1. ✅ Creato account Anthropic
2. ✅ Ottenuto API key
3. ✅ Aggiunto crediti ($10)
4. ✅ Configurato secret su GitHub
5. ✅ Creato file workflow
6. ✅ Creato PR di test
7. ✅ Visto l'AI trovare problemi
8. ✅ Fixato e fatto merge

**Tempo totale:** ~15 minuti per setup iniziale
**Tempo per ogni PR dopo:** 0 minuti (automatico!)

---

## ❓ Domande Frequenti di Marco

### "Devo pagare ogni volta?"
No! I $10 iniziali durano per centinaia di PR.

### "Funziona su repository privati?"
Sì! Funziona su repo pubblici e privati.

### "Devo avere Node.js/npm installato?"
No! GitHub Actions fa tutto nel cloud.

### "L'AI vede tutto il mio codice?"
Sì, ma solo per l'analisi. Anthropic non salva il codice.

### "Posso disabilitare l'AI per alcune PR?"
Sì! Aggiungi `[skip ai]` nel titolo della PR.

### "Quanto è accurata?"
Trova ~90% delle vulnerabilità comuni e suggerisce best practices.

### "Sostituisce i code review umani?"
No, li **aiuta**! Trova problemi comuni, i reviewer umani si concentrano su logica business.

---

## 🎉 Marco è Felice!

Da ora in poi, ogni PR che Marco crea:
- ✅ Viene analizzata automaticamente
- ✅ Problemi trovati prima del merge
- ✅ Codice più sicuro
- ✅ Team più produttivo
- ✅ Meno bug in produzione

**E tutto questo costa meno di un caffè al mese! ☕**

---

## 📞 Supporto per Marco

Se Marco ha problemi:

1. **Legge la documentazione:**
   - https://github.com/mirko1987/claude-angular-multiagent/blob/main/ACTION_README.md
   - https://github.com/mirko1987/claude-angular-multiagent/blob/main/QUICK_START.md

2. **Apre un issue:**
   - https://github.com/mirko1987/claude-angular-multiagent/issues

3. **Controlla i log:**
   - Click su "Details" nel check della PR
   - Vede esattamente cosa è successo

---

**Fine del Tutorial! Marco ora è un esperto! 🚀**
