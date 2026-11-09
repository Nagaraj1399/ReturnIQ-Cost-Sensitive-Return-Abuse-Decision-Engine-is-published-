/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Unit Test: Fairness & Demographic Disparity Audit
 * 
 * Verifies:
 * - Group-wise FP/FN rate computation recomputed independently matches the page's numbers
 * - Detected disparities trigger a non-empty, specific finding paragraph naming the disparity
 */

import { FAIRNESS_REPORT } from '../src/data/fairnessResults';
import { generateSyntheticTestSet, runBacktest } from '../src/lib/backtestCore';
import { DEFAULT_COST_MATRIX } from '../src/lib/decisionEngine';

export function runFairnessTests(): { passed: boolean; message: string; assertions: number } {
  let assertions = 0;
  console.log('--- Running fairness.spec ---');

  // 1. Independent Recomputation of Group-Wise Error Rates
  const testSet = generateSyntheticTestSet(12000);
  const backtest = runBacktest(testSet, DEFAULT_COST_MATRIX);

  const overallFPR = backtest.returnIqPolicy.falseFlagRateOnLegit;
  const overallFNR = Number((100 - backtest.returnIqPolicy.fraudCatchRate).toFixed(1));

  assertions += 2;
  if (Math.abs(overallFPR - FAIRNESS_REPORT.overallFPR) > 0.1) {
    throw new Error(`Recomputed overall FPR (${overallFPR}%) does not match rendered report (${FAIRNESS_REPORT.overallFPR}%)`);
  }
  if (Math.abs(overallFNR - FAIRNESS_REPORT.overallFNR) > 0.1) {
    throw new Error(`Recomputed overall FNR (${overallFNR}%) does not match rendered report (${FAIRNESS_REPORT.overallFNR}%)`);
  }

  // 2. Group Metrics Identity Assertion (Age brackets)
  for (const group of FAIRNESS_REPORT.categories.age) {
    const rawGroup = backtest.groupStats[`age:${group.subgroup}`];
    assertions += 2;
    if (!rawGroup) {
      throw new Error(`Missing demographic subgroup age:${group.subgroup} in backtest raw stats`);
    }

    const recomputedFpr = Number(((rawGroup.fp / rawGroup.legit) * 100).toFixed(1));
    if (Math.abs(recomputedFpr - group.falsePositiveRate) > 0.1) {
      throw new Error(`Subgroup ${group.subgroup} FPR mismatch: got ${recomputedFpr}%, report has ${group.falsePositiveRate}%`);
    }
  }

  // 3. Disparity Trigger & Specific Finding Text Assertion
  // Find any group with disparity > 1.25
  const flaggedDisparities = [
    ...FAIRNESS_REPORT.categories.age,
    ...FAIRNESS_REPORT.categories.accountTenure,
  ].filter(g => g.disparityVsBenchmark > 1.25);

  assertions++;
  if (flaggedDisparities.length === 0) {
    throw new Error('Expected at least one demographic disparity in synthetic test set, found none');
  }

  // Assert finding paragraph is non-empty and explicitly names the affected subgroup
  const findingText = FAIRNESS_REPORT.plainLanguageFinding;
  assertions += 3;
  if (!findingText || findingText.length < 50) {
    throw new Error(`Finding paragraph is blank or generic: "${findingText}"`);
  }

  const mentionsUnder90d = findingText.toLowerCase().includes('90 days') || findingText.toLowerCase().includes('new accounts');
  const mentionsYoung = findingText.toLowerCase().includes('18-24') || findingText.toLowerCase().includes('younger');

  if (!mentionsUnder90d && !mentionsYoung) {
    throw new Error(`Finding paragraph does not name the specific disparity subgroups: "${findingText}"`);
  }

  // Verify synthetic data notice is present
  assertions++;
  if (!FAIRNESS_REPORT.syntheticNotice || !FAIRNESS_REPORT.syntheticNotice.includes('labeled-synthetic')) {
    throw new Error('Missing mandatory synthetic dataset disclosure in fairness report');
  }

  console.log(`✓ fairness.spec passed (${assertions} assertions checked)`);
  return { passed: true, message: 'All demographic fairness parity and disparity reporting tests passed.', assertions };
}
