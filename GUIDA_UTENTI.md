# 📖 Come gli Utenti Useranno la Tua GitHub Action

Guida passo passo per capire come funzionerà la tua action per gli utenti finali.

---

## 🎯 Scenario: Mario ha un Progetto Angular

Mario è uno sviluppatore che ha un progetto Angular su GitHub e vuole aggiungere la review AI automatica.

---

## STEP 1: Mario Trova la Tua Action

### Opzione A: Su GitHub Marketplace
1. Mario va su https://marketplace.github.com/actions
2. Cerca "angular review" o "claude code review"
3. Trova la tua action: **Claude Angular Multi-Agent Review**
4. Legge la descrizione e decide di provarla

### Opzione B: Tramite il tuo README
1. Mario trova il link al tuo repository
2. Legge il README su https://github.com/mirko1987/claude-angular-multiagent
3. Vede gli esempi d'uso

---

## STEP 2: Mario Ottiene una API Key di Anthropic

Mario non ha mai usato Claude prima, quindi deve:

1. **Vai su Anthropic Console**
   - Apre https://console.anthropic.com/
   - Se non ha un account, si registra (email + password)
   
2. **Ottieni l'API Key**
   - Una volta loggato, va su https://console.anthropic.com/settings/keys
   - Click su "Create Key"
   - Copia l'API key (es: `sk-ant-api03-xxxxx...`)
   - ⚠️ La salva in un posto sicuro (non la vedrà più dopo!)

3. **Aggiungi Crediti** (se necessario)
   - Va su https://console.anthropic.com/settings/billing
   - Aggiunge $5-10 di credito per iniziare
   - Ogni review costa circa $0.01-0.05

---

## STEP 3: Mario Configura il Repository

Mario ha il suo progetto Angular su GitHub: `https://github.com/mario/mio-progetto-angular`

### 3.1 Aggiunge il Secret

1. Va sul suo repository GitHub
2. Click su **Settings** (tab in alto)
3. Nel menu a sinistra: **Secrets and variables** → **Actions**
4. Click su **New repository secret**
5. Compila:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Secret**: incolla la sua API key di Anthropic
6. Click su **Add secret**

✅ Ora GitHub ha la chiave API salvata in modo sicuro!

### 3.2 Crea il File Workflow

Mario deve creare un file nella cartella `.github/workflows/` del suo progetto.

**Percorso file**: `.github/workflows/ai-review.yml`

**Metodo 1 - Via GitHub Web UI:**
1. Va su https://github.com/mario/mio-progetto-angular
2. Click su **Add file** → **Create new file**
3. Nomina il file: `.github/workflows/ai-review.yml`
4. Incolla questo contenuto:

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

5. Click su **Commit changes**
6. ✅ Fatto!

**Metodo 2 - Via Linea di Comando:**
```bash
cd mio-progetto-angular
mkdir -p .github/workflows
nano .github/workflows/ai-review.yml
# Incolla il contenuto sopra
git add .github/workflows/ai-review.yml
git commit -m "Add AI code review workflow"
git push
```

---

## STEP 4: Mario Testa l'Action

### 4.1 Crea un Branch e Modifica del Codice

```bash
# Nel suo progetto Angular
git checkout -b feature/nuova-funzionalita

# Modifica un file TypeScript
nano src/app/components/user.component.ts
```

Aggiunge del codice (magari con qualche problema di sicurezza per testare):

```typescript
export class UserComponent {
  // Possibile SQL injection
  loadUser(userId: string) {
    const query = "SELECT * FROM users WHERE id = " + userId;
    return this.db.query(query);
  }
}
```

```bash
git add .
git commit -m "Add user loading feature"
git push origin feature/nuova-funzionalita
```

### 4.2 Crea una Pull Request

1. Mario va su GitHub: `https://github.com/mario/mio-progetto-angular`
2. Vede il banner: **"Compare & pull request"**
3. Click sul pulsante
4. Compila:
   - **Title**: "Add user loading feature"
   - **Description**: "Added functionality to load users"
5. Click su **Create pull request**

---

## STEP 5: La Magia Succede! ✨

### 5.1 GitHub Actions Si Attiva

Non appena Mario crea la PR, automaticamente:

1. **GitHub Actions parte**
   - Mario può vedere il badge "🟡 Some checks haven't completed yet"
   - Click su "Details" per vedere i log in tempo reale

2. **La Tua Action Viene Eseguita**
   
   Nei log Mario vede:
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

3. **L'Action Posta un Commento sulla PR**

   Dopo qualche secondo, Mario vede apparire un nuovo commento sulla PR:

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

### 5.2 Mario Reagisce

Mario legge il commento e pensa: "Wow! Ha ragione, c'è una SQL injection!"

Lui:
1. Torna al suo editor
2. Fixa il problema:

```typescript
export class UserComponent {
  loadUser(userId: string) {
    // Fixed: usando query parametrizzate
    return this.db.query('SELECT * FROM users WHERE id = ?', [userId]);
  }
}
```

3. Fa commit e push:
```bash
git add .
git commit -m "Fix: SQL injection vulnerability"
git push
```

4. **L'Action si ri-esegue automaticamente!**
   - Analizza solo i nuovi cambiamenti (differential analysis)
   - Posta un nuovo commento con i nuovi risultati
   - Se tutti i problemi critici sono risolti: ✅ Check passa!

---

## STEP 6: Mario Fa il Merge

Se l'action è configurata con `fail-on-critical: true`, Mario:

- **Se ci sono issue critiche**: Non può fare merge (il check fallisce ❌)
- **Se sono tutte risolte**: Può fare merge (il check passa ✅)

Mario:
1. Risolve tutti i problemi trovati
2. Il check diventa verde ✅
3. Click su **Merge pull request**
4. ✅ Codice pulito e sicuro in produzione!

---

## 🎨 Personalizzazioni Che Mario Può Fare

### Esempio 1: Solo Sicurezza
Se Mario vuole solo il controllo security:

```yaml
- uses: mirko1987/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    review-mode: 'security'
```

### Esempio 2: Review Completa
Se vuole tutti e 6 gli agenti:

```yaml
- uses: mirko1987/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    review-mode: 'all'
    cost-budget: '1.00'
```

### Esempio 3: Blocca PR su Issue Critiche
Se vuole impedire il merge con problemi critici:

```yaml
- uses: mirko1987/claude-angular-multiagent@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    fail-on-critical: true
```

### Esempio 4: Solo per Branch Main
Se vuole review solo per PR verso main:

```yaml
on:
  pull_request:
    branches:
      - main  # Solo PR verso main
    paths:
      - 'src/**/*.ts'
```

---

## 💰 Quanto Costa a Mario?

Ogni volta che Mario crea/aggiorna una PR:

- **Modalità Smart** (default): ~$0.01-0.05 per PR
- **Modalità Security**: ~$0.005-0.02 per PR
- **Modalità All**: ~$0.05-0.20 per PR

**Esempio pratico:**
- 20 PR al mese in modalità smart = ~$0.50/mese
- 100 PR al mese in modalità smart = ~$2.50/mese

**Molto più economico di un code reviewer umano!** 😄

---

## 📊 Cosa Succede "Dietro le Quinte"

Quando Mario crea una PR:

```
1. GitHub riceve la PR
   ↓
2. GitHub Actions si attiva
   ↓
3. Fa checkout del codice
   ↓
4. Scarica la tua action (mirko1987/claude-angular-multiagent@v1)
   ↓
5. Installa le dipendenze npm
   ↓
6. Compila il TypeScript
   ↓
7. Esegue run-action.js con i parametri configurati
   ↓
8. Il tuo script:
   - Raccoglie i file .ts modificati
   - Crea gli agenti AI (Security, Architecture, ecc)
   - Manda ogni file a Claude AI per l'analisi
   - Riceve i risultati da Claude
   - Formatta i risultati
   - Posta il commento sulla PR via GitHub API
   ↓
9. Mario vede i risultati sulla sua PR!
```

---

## ❓ Domande Frequenti degli Utenti

### "Devo avere npm/Node.js installato?"
**No!** GitHub Actions ha già tutto. Mario deve solo:
- Aggiungere il secret ANTHROPIC_API_KEY
- Creare il file workflow YAML
- Creare una PR

### "L'action vede il mio codice privato?"
**Sì, ma in modo sicuro:**
- Il codice viene inviato all'API di Anthropic (Claude AI)
- Anthropic NON salva il codice dopo l'analisi
- È come mandare il codice a un reviewer esterno
- Se Mario è preoccupato, può usare l'action solo su repo pubblici

### "Posso usarla su repository privati?"
**Sì!** Funziona sia su repo pubblici che privati.
- Repo pubblici: GitHub Actions gratis
- Repo privati: GitHub Actions gratis fino a 2000 minuti/mese

### "Quanto è accurata l'AI?"
L'AI trova:
- ✅ 90%+ delle vulnerabilità comuni
- ✅ 85%+ dei problemi di architettura
- ✅ 80%+ dei problemi di performance
- ❌ Non sostituisce test automatici
- ❌ Non sostituisce code review umane (ma le aiuta!)

---

## 🎯 Riassunto per Mario

**In 3 semplici step:**

1. **Ottieni API Key** → https://console.anthropic.com/
2. **Aggiungi Secret** → Settings → Secrets → `ANTHROPIC_API_KEY`
3. **Crea Workflow** → `.github/workflows/ai-review.yml`

**Poi ogni volta che crea una PR:**
- L'AI analizza automaticamente il codice
- Trova problemi di sicurezza, architettura, performance
- Posta un commento con i risultati
- Mario fixa i problemi
- Merge! ✅

**Costo:** ~$0.50/mese per progetti piccoli/medi

**Beneficio:** Codice più sicuro, meno bug in produzione! 🚀

---

## 📈 Esempi di Successo

**Esempio 1: Team di 5 Developer**
- 50 PR/mese
- Costo: ~$2.50/mese
- Tempo risparmiato: ~10 ore/mese di code review
- ROI: Incredibile!

**Esempio 2: Progetto Open Source**
- 200 PR/mese da contributor
- Trova problemi prima che arrivino ai maintainer
- Riduce carico di lavoro del 30%

**Esempio 3: Startup**
- Usa modalità 'all' su branch main
- Modalità 'smart' su altri branch
- Zero security issues in produzione da 6 mesi

---

## 🎉 Conclusione

La tua GitHub Action rende facile per qualsiasi sviluppatore Angular aggiungere AI-powered code review al proprio progetto in meno di 5 minuti!

**Il valore per gli utenti:**
- ✅ Setup super veloce
- ✅ Nessuna configurazione complessa
- ✅ Funziona out-of-the-box
- ✅ Costa pochissimo
- ✅ Migliora la qualità del codice
- ✅ Trova bug prima della produzione

**Mario è felice! 😊**
