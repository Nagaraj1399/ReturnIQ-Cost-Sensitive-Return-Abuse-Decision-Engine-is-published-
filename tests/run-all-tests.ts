/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Master Automated Test Suite Runner
 * 
 * Executes:
 * 1. data-pipeline.unit.spec
 * 2. model.unit.spec
 * 3. decision-layer.unit.spec (CRITICAL)
 * 4. explanation-layer.spec
 * 5. fairness.spec
 * 6. Live API integration endpoint tests (/api/health, /api/score, /api/decision, /api/backtest, /api/fairness)
 */

import { runDataPipelineUnitTests } from './data-pipeline.unit.spec';
import { runModelUnitTests } from './model.unit.spec';
import { runDecisionLayerUnitTests } from './decision-layer.unit.spec';
import { runExplanationLayerTests } from './explanation-layer.spec';
import { runFairnessTests } from './fairness.spec';
import { runAdvancedFeaturesTests } from './advanced-features.unit.spec';

interface TestResult {
  suite: string;
  passed: boolean;
  assertions: number;
  durationMs: number;
  message?: string;
}

async function testLiveApiEndpoints(): Promise<{ passed: boolean; assertions: number; message: string }> {
  let assertions = 0;
  const baseUrl = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';

  // 1. Health Endpoint
  const healthRes = await fetch(`${baseUrl}/api/health`);
  assertions += 2;
  if (!healthRes.ok) throw new Error(`/api/health failed with status ${healthRes.status}`);
  const healthData = await healthRes.json();
  if (healthData.product !== 'ReturnIQ' || healthData.team !== 'GenOS Team') {
    throw new Error(`Unexpected /api/health response payload: ${JSON.stringify(healthData)}`);
  }

  // 2. Decision Endpoint
  const decisionRes = await fetch(`${baseUrl}/api/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      probabilities: { Legitimate: 0.95, 'Policy Abuser': 0.02, 'Fraudulent Return': 0.02, Wardrobing: 0.01 },
      costMatrix: { cost_false_positive: 45, cost_false_negative: 125, cost_manual_review: 18 },
      orderValue: 110,
    }),
  });
  assertions += 2;
  if (!decisionRes.ok) throw new Error(`/api/decision failed with status ${decisionRes.status}`);
  const decisionData = await decisionRes.json();
  if (decisionData.recommendedAction !== 'Approve-Instantly') {
    throw new Error(`Expected Approve-Instantly for 95% legit probability, got ${decisionData.recommendedAction}`);
  }

  // 3. Backtest Endpoint
  const backtestRes = await fetch(`${baseUrl}/api/backtest`);
  assertions += 2;
  if (!backtestRes.ok) throw new Error(`/api/backtest failed with status ${backtestRes.status}`);
  const backtestData = await backtestRes.json();
  if (backtestData.netSavingsDollars !== 199502) {
    throw new Error(`Expected $199,502 in /api/backtest, got $${backtestData.netSavingsDollars}`);
  }

  // 4. Fairness Endpoint
  const fairnessRes = await fetch(`${baseUrl}/api/fairness`);
  assertions += 2;
  if (!fairnessRes.ok) throw new Error(`/api/fairness failed with status ${fairnessRes.status}`);
  const fairnessData = await fairnessRes.json();
  if (!fairnessData.categories?.age || fairnessData.categories.age.length !== 5) {
    throw new Error('Expected 5 age subgroups in /api/fairness');
  }

  // 5. Ask Endpoint (Feature 6)
  const askRes = await fetch(`${baseUrl}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Show me wardrobing cases in Apparel' }),
  });
  assertions += 2;
  if (!askRes.ok) throw new Error(`/api/ask failed with status ${askRes.status}`);
  const askData = await askRes.json();
  if (askData.canAnswer !== true || !askData.sampleRecords) {
    throw new Error('Expected valid query response from /api/ask');
  }

  console.log(`✓ live-api-integration.spec passed (${assertions} assertions checked)`);
  return { passed: true, assertions, message: 'All live API integration routes verified.' };
}

async function main() {
  console.log('======================================================================');
  console.log('ReturnIQ End-to-End Automated Test Suite');
  console.log('DataNova 2026 Submission — GenOS Team');
  console.log('======================================================================\n');

  const startTime = Date.now();
  const results: TestResult[] = [];

  const suites: Array<{ name: string; runner: () => Promise<{ passed: boolean; assertions: number; message?: string }> | { passed: boolean; assertions: number; message?: string } }> = [
    { name: '1. data-pipeline.unit.spec', runner: runDataPipelineUnitTests },
    { name: '2. model.unit.spec', runner: runModelUnitTests },
    { name: '3. decision-layer.unit.spec [CRITICAL]', runner: runDecisionLayerUnitTests },
    { name: '4. explanation-layer.spec', runner: runExplanationLayerTests },
    { name: '5. fairness.spec', runner: runFairnessTests },
    { name: '6. advanced-features.unit.spec', runner: runAdvancedFeaturesTests },
    { name: '7. live-api-integration.spec', runner: testLiveApiEndpoints },
  ];

  for (const s of suites) {
    const sStart = Date.now();
    try {
      const res = await s.runner();
      results.push({
        suite: s.name,
        passed: res.passed,
        assertions: res.assertions,
        durationMs: Date.now() - sStart,
        message: res.message,
      });
    } catch (err: any) {
      results.push({
        suite: s.name,
        passed: false,
        assertions: 0,
        durationMs: Date.now() - sStart,
        message: err.message || String(err),
      });
      console.error(`✗ ${s.name} FAILED: ${err.message}\n`, err);
    }
  }

  const totalTime = Date.now() - startTime;
  const allPassed = results.every(r => r.passed);
  const totalAssertions = results.reduce((acc, r) => acc + r.assertions, 0);

  console.log('\n======================================================================');
  console.log('TEST EXECUTION SUMMARY');
  console.log('======================================================================');
  for (const r of results) {
    const status = r.passed ? 'PASS [✓]' : 'FAIL [✗]';
    console.log(`${status.padEnd(10)} | ${r.suite.padEnd(40)} | ${String(r.assertions).padStart(4)} assertions | ${r.durationMs}ms`);
  }
  console.log('----------------------------------------------------------------------');
  console.log(`Total Assertions: ${totalAssertions}`);
  console.log(`Total Runtime:    ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`Overall Result:   ${allPassed ? 'ALL TEST SUITES PASSED (100%)' : 'SOME TEST SUITES FAILED'}`);
  console.log('======================================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

main().catch(e => {
  console.error('Fatal test runner failure:', e);
  process.exit(1);
});
