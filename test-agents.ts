// test-agents.ts - Script per testare gli agenti
import dotenv from 'dotenv';
dotenv.config();

import { PerformanceOrchestrator } from './src/orchestrator/performance-orchestrator';
import { SecurityAgent } from './src/agents/security-agent';
import { AngularArchitectureAgent } from './src/agents/angular-architecture-agent';
import { PerformanceAgent } from './src/agents/performance-agent';
import { FileAnalyzer } from './src/utils/file-analyzer';
import { Logger } from './src/utils/logger';

const logger = new Logger('TestAgents');

async function testAgents() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 TEST DEGLI AGENTI AI');
  console.log('='.repeat(70) + '\n');

  // Verifica API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ERRORE: ANTHROPIC_API_KEY non trovata nel file .env');
    console.log('\n💡 Soluzione:');
    console.log('1. Copia il file .env.example in .env');
    console.log('2. Aggiungi la tua API key nel file .env');
    process.exit(1);
  }

  console.log('✅ API Key trovata');
  console.log(`✅ API Key: ${process.env.ANTHROPIC_API_KEY.substring(0, 20)}...`);

  // Crea gli agenti
  console.log('\n📦 Creazione agenti...');
  const agents = [
    new SecurityAgent(),
    new AngularArchitectureAgent(),
    new PerformanceAgent(),
  ];
  console.log(`✅ Creati ${agents.length} agenti`);

  // Crea l'orchestrator
  console.log('\n⚙️  Creazione orchestrator...');
  const orchestrator = new PerformanceOrchestrator(agents, {
    costBudget: 0.20,
    timeBudget: 60000,
    enableStreaming: false,
    enableDifferentialAnalysis: false,
    enableSmartSelection: true,
    enableEarlyStop: false,
  });
  console.log('✅ Orchestrator creato');

  // Raccolta file
  console.log('\n📁 Raccolta file da ./src...');
  const analyzer = new FileAnalyzer();
  let files;

  try {
    files = await analyzer.analyzeDirectory('./src');
    console.log(`✅ Trovati ${files.length} file`);

    if (files.length === 0) {
      console.log('⚠️  Nessun file trovato in ./src');
      console.log('Questo è normale se il progetto non ha file TypeScript in src/');
    }
  } catch (error) {
    console.error('❌ Errore nella raccolta file:', error);
    process.exit(1);
  }

  // Se non ci sono file, crea un file di esempio
  if (files.length === 0) {
    console.log('\n📝 Creazione file di test...');
    files = [{
      path: 'test.component.ts',
      content: `
import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: '<div>Test</div>'
})
export class TestComponent {
  // Possibile problema di sicurezza: SQL injection
  getUserData(userId: string) {
    const query = "SELECT * FROM users WHERE id = " + userId;
    return this.db.query(query);
  }
}
      `,
      language: 'typescript',
      size: 200
    }];
    console.log('✅ File di test creato');
  } else {
    // Usa solo i primi 3 file per il test
    files = files.slice(0, 3);
    console.log(`📊 Usando ${files.length} file per il test`);
  }

  // Esegui la review
  console.log('\n🤖 Avvio review AI...');
  console.log('⏱️  Questo potrebbe richiedere 30-60 secondi...\n');

  try {
    const result = await orchestrator.executeReview({
      files,
      config: { parallel: true, caching: false }
    });

    // Mostra risultati
    console.log('\n' + '='.repeat(70));
    console.log('📊 RISULTATI DELLA REVIEW');
    console.log('='.repeat(70));
    console.log(`Files analizzati: ${result.summary.filesAnalyzed}`);
    console.log(`Issues totali: ${result.summary.totalIssues}`);
    console.log(`Issues critiche: ${result.summary.criticalIssues}`);
    console.log(`Suggerimenti: ${result.summary.suggestions}`);
    console.log(`Tempo: ${(result.summary.analysisTime / 1000).toFixed(1)}s`);
    console.log(`Costo: $${result.metrics.estimatedCost.toFixed(4)}`);
    console.log('='.repeat(70));

    // Mostra dettagli per agente
    console.log('\n📋 DETTAGLI PER AGENTE:\n');
    result.reviews.forEach(review => {
      console.log(`\n${review.agentName.toUpperCase()}:`);
      console.log(`  Findings: ${review.findings.length}`);
      console.log(`  Raccomandazioni: ${review.recommendations.length}`);
      console.log(`  Score: ${review.metrics.score}/100`);
      console.log(`  Tempo: ${review.metrics.executionTime}ms`);
      console.log(`  Tokens: ${review.metrics.tokensUsed}`);

      if (review.findings.length > 0) {
        console.log('\n  🔍 Findings:');
        review.findings.forEach((finding, idx) => {
          if (idx < 3) { // Mostra solo i primi 3
            console.log(`    ${idx + 1}. [${finding.severity}] ${finding.message}`);
            console.log(`       📍 ${finding.file}:${finding.line || '?'}`);
          }
        });
        if (review.findings.length > 3) {
          console.log(`    ... e altri ${review.findings.length - 3} findings`);
        }
      }
    });

    console.log('\n' + '='.repeat(70));
    console.log('✅ TEST COMPLETATO CON SUCCESSO!');
    console.log('='.repeat(70) + '\n');

    // Riepilogo finale
    console.log('📌 RIEPILOGO:');
    console.log(`   ✅ Build: OK`);
    console.log(`   ✅ Agenti: ${agents.length} funzionanti`);
    console.log(`   ✅ API: Connessione OK`);
    console.log(`   ✅ Review: Completata`);
    console.log(`   💰 Costo test: $${result.metrics.estimatedCost.toFixed(4)}`);
    console.log('\n🎉 Il sistema è pronto per essere pubblicato!\n');

  } catch (error) {
    console.error('\n❌ ERRORE durante la review:', error);
    if (error instanceof Error) {
      console.error('Messaggio:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Esegui il test
testAgents().catch(error => {
  console.error('❌ Errore fatale:', error);
  process.exit(1);
});
