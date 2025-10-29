# Controllo di Concorrenza degli Agenti

## 📊 Come Funziona

Gli agenti **eseguono in parallelo** ma con un **limite di concorrenza** configurabile per:

✅ Evitare rate limiting API Anthropic
✅ Controllare i costi
✅ Ottimizzare le performance

## ⚙️ Configurazione

### Via Environment Variable (.env)

```env
MAX_CONCURRENT_AGENTS=3  # Default: 3 agenti contemporaneamente
```

### Via Codice

```typescript
// Usa default da .env (3 agenti)
const multiAgent = new AngularMultiAgent();

// Imposta manualmente
const multiAgent = new AngularMultiAgent(2);  // Max 2 agenti simultanei
```

## 🚀 Esempi di Concorrenza

### Con 6 Agenti Totali:

#### `MAX_CONCURRENT_AGENTS=1` (Sequenziale)
```
[Agent 1] ████████ → [Agent 2] ████████ → [Agent 3] ████████ → ...
Tempo: ~60 secondi (lento ma sicuro)
```

#### `MAX_CONCURRENT_AGENTS=3` (Bilanciato) ⭐ **CONSIGLIATO**
```
[Agent 1] ████████
[Agent 2] ████████  → [Agent 4] ████████
[Agent 3] ████████     [Agent 5] ████████
                       [Agent 6] ████████
Tempo: ~25 secondi (ottimale)
```

#### `MAX_CONCURRENT_AGENTS=6` (Tutti paralleli)
```
[Agent 1] ████████
[Agent 2] ████████
[Agent 3] ████████
[Agent 4] ████████
[Agent 5] ████████
[Agent 6] ████████
Tempo: ~12 secondi (veloce ma rischio rate limit)
```

## 📈 Raccomandazioni

| Scenario | Concurrency | Perché |
|----------|-------------|--------|
| **Produzione** | 2-3 | Balance perfetto costo/velocità |
| **Sviluppo** | 1-2 | Evita rate limits durante test |
| **CI/CD** | 3-4 | Velocità per pipeline |
| **File grandi** | 2 | Riduce carico API |
| **File piccoli** | 4-6 | Massima velocità |

## 🔧 Implementazione Tecnica

### p-limit

Utilizziamo [p-limit](https://github.com/sindresorhus/p-limit) per controllare la concorrenza:

```typescript
import pLimit from 'p-limit';

const limit = pLimit(3);  // Max 3 simultanei

const promises = agents.map(agent =>
  limit(() => agent.analyze(files))  // ← Wrapper con controllo
);

await Promise.allSettled(promises);
```

### Vantaggi

✅ **Garantisce** max N agenti simultanei
✅ **Coda automatica** per gli agenti in attesa
✅ **Promise.allSettled** cattura errori senza bloccare altri agenti
✅ **Configurabile** runtime senza ricompilare

## 💰 Impatto sui Costi

### Esempio con file da 10KB:

| Concurrency | Tempo | Costi API | Note |
|-------------|-------|-----------|------|
| 1 | 60s | $0.12 | Sicuro ma lento |
| 3 | 25s | $0.12 | ⭐ Stesso costo, 2.4x più veloce |
| 6 | 12s | $0.12 | Stesso costo, rischio rate limit |

**Costo identico**, solo tempo diverso!

## 🎯 Rate Limits Anthropic

### Claude API Limits (Tier 1):

- **Requests per minute**: 50
- **Tokens per minute**: 50,000
- **Tokens per day**: 1,000,000

### Calcolo Sicuro:

Con `MAX_CONCURRENT_AGENTS=3`:
- 3 richieste simultanee
- ~20 richieste al minuto
- ✅ Sotto il limite di 50 RPM

Con `MAX_CONCURRENT_AGENTS=6`:
- 6 richieste simultanee
- ~40 richieste al minuto
- ⚠️ Vicino al limite (rischio)

## 📊 Monitoring

I log mostrano la concorrenza:

```
[INFO] [AgentOrchestrator] Concurrency limit set to 3 agents
[INFO] [AgentOrchestrator] Starting review with 6 agents (max 3 concurrent)
[INFO] [AgentOrchestrator] Executing Angular Architecture Agent
[INFO] [AgentOrchestrator] Executing RxJS Reactive Agent
[INFO] [AgentOrchestrator] Executing Performance Agent
... (aspetta che finiscano)
[INFO] [AgentOrchestrator] Executing Security Agent
[INFO] [AgentOrchestrator] Executing Testing Agent
[INFO] [AgentOrchestrator] Executing Accessibility Agent
```

## 🔍 Debug

Per vedere esattamente quando parte ogni agente:

```typescript
// In agent-orchestrator.ts (già presente)
this.logger.info(`Executing ${agent.getName()}`);
this.logger.info(`${agent.getName()} completed: ${response.issues.length} issues`);
```

## 🚦 Best Practices

1. **Start con 3**: Ottimale per la maggior parte dei casi
2. **Monitor i log**: Verifica se vedi rate limit errors
3. **Scala gradualmente**: Aumenta se vedi che va bene
4. **File size matters**: File grandi = meno concorrenza
5. **API tier**: Tier più alti = più concorrenza possibile

## ⚡ Performance Tips

### Velocizzare senza aumentare concorrenza:

1. **Cache abilitata** → Evita chiamate duplicate
2. **Agent selection** → Esegui solo agenti rilevanti
3. **File chunking** → Processa file grandi a pezzi
4. **Model selection** → Usa Haiku per file semplici

### Trade-off:

```
Velocità ↑ = Concorrenza ↑ = Rischio Rate Limit ↑
          vs
Sicurezza ↑ = Concorrenza ↓ = Tempo ↑
```

## 📝 Esempio Completo

```typescript
import { AngularMultiAgent } from './src';

// Configurazione conservativa (produzione)
const multiAgent = new AngularMultiAgent(2);

// Configurazione bilanciata (consigliata)
const multiAgent = new AngularMultiAgent(3);

// Configurazione aggressiva (solo se hai tier alto)
const multiAgent = new AngularMultiAgent(5);

// Review
const report = await multiAgent.reviewDirectory('./src');
```

## 🎓 Conclusioni

**Concorrenza = 3** è il sweet spot:
- ✅ Veloce (2-3x più veloce del sequenziale)
- ✅ Sicuro (ben sotto i rate limits)
- ✅ Economico (stesso costo del sequenziale)
- ✅ Affidabile (no errors)

Per casi specifici, regola in base alle tue esigenze! 🚀
