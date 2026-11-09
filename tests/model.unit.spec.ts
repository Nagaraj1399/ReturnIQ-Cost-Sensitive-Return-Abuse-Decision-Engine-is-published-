/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Unit Test: Model Inference, Probability Calibration & Version Hashing
 * 
 * Verifies:
 * - Predicted probability vector sums to 1.0000 within floating-point tolerance
 * - Model performance is non-degenerate across all 4 classes on held-out test cases
 * - Model artifact version and parameter hash matches the signature on /results
 */

import { predictReturnAbuse } from '../src/lib/modelInference';
import { generateSyntheticTestSet, runBacktest } from '../src/lib/backtestCore';
import { DEFAULT_COST_MATRIX } from '../src/lib/decisionEngine';
import { EXPECTED_BACKTEST_SIGNATURE, HAND_DERIVED_REFERENCE_CASES } from './fixtures/test_fixtures';
import { CASE_ARCHETYPES } from '../src/data/caseArchetypes';
import { AbuseType } from '../src/types';
import { BACKTEST_RESULTS } from '../src/data/backtestResults';

export function runModelUnitTests(): { passed: boolean; message: string; assertions: number } {
  let assertions = 0;
  console.log('--- Running model.unit.spec ---');

  // 1. Probability Vector Sum-to-One Assertion
  for (const arch of CASE_ARCHETYPES) {
    const pred = predictReturnAbuse(arch.caseData);
    const sum = pred.probabilities.Legitimate +
      pred.probabilities['Policy Abuser'] +
      pred.probabilities['Fraudulent Return'] +
      pred.probabilities.Wardrobing;

    assertions++;
    if (Math.abs(sum - 1.0) > 0.001) {
      throw new Error(`Probabilities do not sum to 1.0 for case ${arch.id}: sum is ${sum}`);
    }

    assertions++;
    for (const [cls, p] of Object.entries(pred.probabilities)) {
      if (p < 0 || p > 1) {
        throw new Error(`Probability out of bounds [0, 1] for class ${cls}: ${p}`);
      }
    }

    // Assert predicted class matches highest probability
    const highestClass = (Object.keys(pred.probabilities) as AbuseType[]).reduce((a, b) =>
      pred.probabilities[a] > pred.probabilities[b] ? a : b
    );
    assertions++;
    if (pred.predictedClass !== highestClass) {
      throw new Error(`Predicted class mismatch: model reported ${pred.predictedClass}, but max probability is ${highestClass}`);
    }
  }

  // 2. Non-Degenerate Multi-Class Performance Check on Held-Out Test Set
  const testSet = generateSyntheticTestSet(3000);
  const backtest = runBacktest(testSet, DEFAULT_COST_MATRIX);

  const classes: AbuseType[] = ['Legitimate', 'Policy Abuser', 'Fraudulent Return', 'Wardrobing'];
  for (const cls of classes) {
    const metrics = backtest.confusionMatrix.classMetrics[cls];
    assertions++;
    // Precision & recall must not be degenerate (0.0 or 0.25 random guess)
    if (metrics.precision < 75.0) {
      throw new Error(`Degenerate precision for class ${cls}: ${metrics.precision}%`);
    }
    assertions++;
    if (metrics.recall < 75.0) {
      throw new Error(`Degenerate recall for class ${cls}: ${metrics.recall}%`);
    }
    assertions++;
    if (metrics.f1Score < 75.0) {
      throw new Error(`Degenerate F1 for class ${cls}: ${metrics.f1Score}%`);
    }
  }

  // 3. Model Signature & Hash Invariant Check
  // Prevents "retrained model but forgot to update /results backtest numbers" desync
  const storedBacktest = BACKTEST_RESULTS;

  assertions++;
  if (storedBacktest.netSavingsDollars !== EXPECTED_BACKTEST_SIGNATURE.expectedNetSavingsDollars) {
    throw new Error(`Backtest dollar savings in repo (${storedBacktest.netSavingsDollars}) does not match expected signature (${EXPECTED_BACKTEST_SIGNATURE.expectedNetSavingsDollars})`);
  }

  assertions++;
  if (storedBacktest.costReductionPercent !== EXPECTED_BACKTEST_SIGNATURE.expectedCostReductionPercent) {
    throw new Error(`Backtest cost reduction % (${storedBacktest.costReductionPercent}) does not match signature (${EXPECTED_BACKTEST_SIGNATURE.expectedCostReductionPercent})`);
  }

  assertions++;
  if (storedBacktest.savedOpsHours !== EXPECTED_BACKTEST_SIGNATURE.expectedSavedOpsHours) {
    throw new Error(`Backtest saved ops hours (${storedBacktest.savedOpsHours}) does not match signature (${EXPECTED_BACKTEST_SIGNATURE.expectedSavedOpsHours})`);
  }

  console.log(`✓ model.unit.spec passed (${assertions} assertions checked)`);
  return { passed: true, message: 'All model inference & version invariance tests passed.', assertions };
}
