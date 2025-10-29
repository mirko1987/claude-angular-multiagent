// examples/test-simple.ts - Test semplice degli agenti
import dotenv from 'dotenv';
dotenv.config();

import { SmartOrchestrator } from '../src/orchestrator/smart-orchestrator';
import { SecurityAgent } from '../src/agents/security-agent';
import { AngularArchitectureAgent } from '../src/agents/angular-architecture-agent';
import { PerformanceAgent } from '../src/agents/performance-agent';
import { BaseAgent } from '../src/agents/base-agent';
import { FileContext } from '../src/types';

async function testSimple() {
  console.log('\n🧪 TEST SEMPLICE DEGLI AGENTI\n');

  // Verifica API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY non trovata!');
    console.log('💡 Aggiungi la tua API key nel file .env');
    process.exit(1);
  }

  console.log('✅ API Key configurata');

  // Crea agenti
  const agents: BaseAgent[] = [
    new SecurityAgent(),
    new AngularArchitectureAgent(),
  ];

  console.log(`✅ Creati ${agents.length} agenti`);

  // Crea orchestrator
  const orchestrator = new SmartOrchestrator({
    costBudget: 0.15,
    timeBudget: 60000,
    maxConcurrent: 2,
  });

  // Registra agenti
  orchestrator.registerAgents(agents);
  console.log('✅ Orchestrator configurato');

  // File di test
  const testFile: FileContext = {
    path: 'test-component.ts',
    content: `
import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: '<div>{{ data }}</div>'
})
export class TestComponent {
  data: string;

  // Possible security issue
  loadUserData(userId: string) {
    const query = "SELECT * FROM users WHERE id = " + userId;
    return fetch('/api/query?sql=' + query);
  }
}
    `.trim(),
    language: 'typescript',
    size: 250
  };

  console.log('\n📝 File di test creato');
  console.log('🤖 Avvio analisi...\n');

  try {
    const result = await orchestrator.executeReview({
      files: [testFile],
      config: { parallel: true, caching: false }
    });

    console.log('\n' + '='.repeat(60));
    console.log('📊 RISULTATI');
    console.log('='.repeat(60));
    console.log(`Issues totali: ${result.summary.totalIssues}`);
    console.log(`Issues critiche: ${result.summary.criticalIssues}`);
    console.log(`Tempo: ${result.summary.analysisTime}ms`);
    console.log(`Costo: $${result.metrics.estimatedCost.toFixed(4)}`);
    console.log('='.repeat(60));

    // Mostra findings
    result.reviews.forEach(review => {
      if (review.findings.length > 0) {
        console.log(`\n${review.agentName}:`);
        review.findings.forEach(f => {
          console.log(`  [${f.severity}] ${f.message}`);
        });
      }
    });

    console.log('\n✅ TEST COMPLETATO!\n');
    console.log(`💰 Costo del test: $${result.metrics.estimatedCost.toFixed(4)}\n`);

  } catch (error) {
    console.error('\n❌ ERRORE:', error);
    process.exit(1);
  }
}

testSimple();
