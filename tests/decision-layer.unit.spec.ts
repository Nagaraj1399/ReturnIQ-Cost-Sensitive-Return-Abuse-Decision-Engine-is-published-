/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Unit Test: Decision Layer (HIGHEST PRIORITY)
 * 
 * Verifies:
 * - Pure decision function matches hand-derived mathematical reference values exactly (5 cases)
 * - Monotonicity property: Increasing cost_false_negative strictly increases or maintains action strictness (Approve -> Flag -> Deny)
 * - Independent recomputation of held-out backtest $ savings matches the number on /results exactly
 */

import { computeOptimalDecision, DEFAULT_COST_MATRIX } from '../src/lib/decisionEngine';
import { runBacktest, generateSyntheticTestSet } from '../src/lib/backtestCore';
import { HAND_DERIVED_REFERENCE_CASES, EXPECTED_BACKTEST_SIGNATURE } from './fixtures/test_fixtures';
import { BACKTEST_RESULTS } from '../src/data/backtestResults';
import { ActionRecommendation, CostMatrix } from '../src/types';

export function runDecisionLayerUnitTests(): { passed: boolean; message: string; assertions: number } {
  let assertions = 0;
  console.log('--- Running decision-layer.unit.spec [CRITICAL] ---');

  // 1. Hand-Derived Mathematical Oracles (5 Cases)
  for (const testCase of HAND_DERIVED_REFERENCE_CASES) {
    const decision = computeOptimalDecision(
      testCase.probabilities,
      testCase.costMatrix,
      testCase.orderValue
    );

    const expected = testCase.handCalculations;

    // Tolerance ±0.05 for minor floating point rounding
    const diffApprove = Math.abs(decision.actionCosts['Approve-Instantly'].totalCost - expected.expectedCostApprove);
    const diffFlag = Math.abs(decision.actionCosts['Flag-for-Review'].totalCost - expected.expectedCostFlag);
    const diffDeny = Math.abs(decision.actionCosts['Deny-and-Blacklist'].totalCost - expected.expectedCostDeny);

    assertions += 3;
    if (diffApprove > 0.05) {
      throw new Error(`[${testCase.name}] E[Approve] mismatch: got $${decision.actionCosts['Approve-Instantly'].totalCost}, hand oracle expected $${expected.expectedCostApprove}`);
    }
    if (diffFlag > 0.05) {
      throw new Error(`[${testCase.name}] E[Flag] mismatch: got $${decision.actionCosts['Flag-for-Review'].totalCost}, hand oracle expected $${expected.expectedCostFlag}`);
    }
    if (diffDeny > 0.05) {
      throw new Error(`[${testCase.name}] E[Deny] mismatch: got $${decision.actionCosts['Deny-and-Blacklist'].totalCost}, hand oracle expected $${expected.expectedCostDeny}`);
    }

    // Verify optimal action matches exactly
    assertions++;
    if (decision.recommendedAction !== expected.expectedOptimalAction) {
      throw new Error(`[${testCase.name}] Action mismatch: got ${decision.recommendedAction}, expected ${expected.expectedOptimalAction}`);
    }

    // Verify minCost equals the chosen action's total cost
    assertions++;
    if (decision.minCost !== decision.actionCosts[decision.recommendedAction].totalCost) {
      throw new Error(`[${testCase.name}] minCost $${decision.minCost} does not equal recommended action cost $${decision.actionCosts[decision.recommendedAction].totalCost}`);
    }
  }

  // 2. Monotonicity Property Testing
  // Property: For ANY fixed probability vector, if cost_false_negative increases,
  // strictness level must be non-decreasing: Approve (1) <= Flag (2) <= Deny (3).
  // Approve can NEVER become optimal if it wasn't optimal before fraud cost rose!
  const strictnessRank: Record<ActionRecommendation, number> = {
    'Approve-Instantly': 1,
    'Flag-for-Review': 2,
    'Deny-and-Blacklist': 3,
  };

  const testProbabilities = [
    { Legitimate: 0.85, 'Policy Abuser': 0.05, 'Fraudulent Return': 0.05, Wardrobing: 0.05 },
    { Legitimate: 0.60, 'Policy Abuser': 0.20, 'Fraudulent Return': 0.10, Wardrobing: 0.10 },
    { Legitimate: 0.45, 'Policy Abuser': 0.35, 'Fraudulent Return': 0.10, Wardrobing: 0.10 },
    { Legitimate: 0.20, 'Policy Abuser': 0.40, 'Fraudulent Return': 0.20, Wardrobing: 0.20 },
  ];

  for (const probs of testProbabilities) {
    let lastRank = 1;
    // Step CFN from $40 to $300 in $20 increments
    for (let cfn = 40; cfn <= 300; cfn += 20) {
      const matrix: CostMatrix = {
        cost_false_positive: 45,
        cost_false_negative: cfn,
        cost_manual_review: 18,
      };
      const res = computeOptimalDecision(probs, matrix, 110);
      const currentRank = strictnessRank[res.recommendedAction];

      assertions++;
      if (currentRank < lastRank) {
        throw new Error(
          `Monotonicity violation! At CFN=$${cfn}, action loosened from rank ${lastRank} to ${currentRank} (${res.recommendedAction}) for probs: ${JSON.stringify(probs)}`
        );
      }
      lastRank = currentRank;
    }
  }

  // 3. Independent Backtest Recomputation vs /results Rendered Page
  // Re-run the held-out test set generation from the same seed and assert the exact dollar figure
  const testSet = generateSyntheticTestSet(12000);
  const recomputedBacktest = runBacktest(testSet, DEFAULT_COST_MATRIX);

  assertions += 4;
  if (recomputedBacktest.netSavingsDollars !== BACKTEST_RESULTS.netSavingsDollars) {
    throw new Error(
      `Recomputed backtest savings ($${recomputedBacktest.netSavingsDollars}) does not match rendered /results ($${BACKTEST_RESULTS.netSavingsDollars})`
    );
  }
  if (recomputedBacktest.costReductionPercent !== BACKTEST_RESULTS.costReductionPercent) {
    throw new Error(
      `Recomputed cost reduction % (${recomputedBacktest.costReductionPercent}%) does not match rendered /results (${BACKTEST_RESULTS.costReductionPercent}%)`
    );
  }
  if (recomputedBacktest.savedOpsHours !== BACKTEST_RESULTS.savedOpsHours) {
    throw new Error(
      `Recomputed saved ops hours (${recomputedBacktest.savedOpsHours}h) does not match rendered /results (${BACKTEST_RESULTS.savedOpsHours}h)`
    );
  }
  if (recomputedBacktest.returnIqPolicy.fraudCatchRate !== BACKTEST_RESULTS.returnIqPolicy.fraudCatchRate) {
    throw new Error(
      `Recomputed abuse catch rate (${recomputedBacktest.returnIqPolicy.fraudCatchRate}%) does not match rendered /results (${BACKTEST_RESULTS.returnIqPolicy.fraudCatchRate}%)`
    );
  }

  console.log(`✓ decision-layer.unit.spec passed (${assertions} assertions checked)`);
  return { passed: true, message: 'All decision layer arithmetic, monotonicity, and backtest identity tests passed.', assertions };
}
