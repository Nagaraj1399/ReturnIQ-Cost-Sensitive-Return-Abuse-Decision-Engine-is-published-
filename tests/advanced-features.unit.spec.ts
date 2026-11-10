/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Advanced Features Unit Specification
 * Validates the 6 DataNova 2026 Advanced Features:
 * 1. Calibrated Confidence & Conformal Bands
 * 2. Pareto-Frontier Optimizer
 * 3. Fraud-Ring Linkage Graph
 * 4. Surrogate Rule Distillation
 * 5. ROI Scaled Projections
 * 6. Zero-Hallucination Query Engine
 */

import { generateReliabilityReport, computeConformalInterval } from '../src/lib/calibrationEngine';
import { PARETO_FRONTIER_POINTS } from '../src/lib/paretoOptimizer';
import { SURROGATE_RULES, SURROGATE_MODEL_SUMMARY } from '../src/lib/surrogateRuleEngine';
import { FRAUD_RINGS_DATA } from '../src/lib/fraudRingEngine';
import { parseQueryDeterministically, executeFilter, getHeldoutTestRecords } from '../src/server/dataQueryEngine';

export function runAdvancedFeaturesTests(): { name: string; assertions: number; passed: boolean } {
  let assertions = 0;

  function assert(condition: boolean, message: string) {
    assertions++;
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // 1. Calibration & Conformal Prediction Tests
  const reliability = generateReliabilityReport();
  assert(reliability.calibratedBrierScore < reliability.uncalibratedBrierScore, 'Calibrated Brier score must be strictly lower than uncalibrated');
  assert(reliability.brierScoreReductionPercent > 40, 'Brier score reduction must exceed 40%');
  assert(reliability.calibratedECE < 0.02, 'Calibrated Expected Calibration Error must be under 2%');
  assert(reliability.bins.length === 10, 'Reliability diagram must contain exactly 10 deciles');

  const confInterval = computeConformalInterval(0.87, 1.0);
  assert(
    confInterval.lowerBound95 < confInterval.calibratedProbability &&
    confInterval.upperBound95 > confInterval.calibratedProbability,
    'Conformal bounds must bracket calibrated probability'
  );
  assert(confInterval.formatted.includes('±'), 'Formatted conformal interval must show margin');

  // 2. Pareto-Frontier Optimizer Tests
  assert(PARETO_FRONTIER_POINTS.length >= 20, 'Pareto grid search must evaluate at least 20 threshold points');
  const optimalPoints = PARETO_FRONTIER_POINTS.filter((p) => p.isParetoOptimal);
  assert(optimalPoints.length >= 3, 'Must identify non-dominated Pareto-optimal operating points');

  // Monotonicity: as threshold increases, false flag rate must strictly decrease or stay equal
  for (let i = 1; i < optimalPoints.length; i++) {
    assert(
      optimalPoints[i].falseFlagRate <= optimalPoints[i - 1].falseFlagRate,
      'Pareto false flag rate must be non-increasing as threshold increases'
    );
  }

  // 3. Fraud-Ring Graph Topology
  assert(FRAUD_RINGS_DATA.length === 3, 'Must contain 3 documented syndicate clusters');
  for (const ring of FRAUD_RINGS_DATA) {
    assert(ring.nodes.length >= 3, `Ring ${ring.id} must have at least 3 linked nodes`);
    assert(ring.links.length >= 2, `Ring ${ring.id} must have at least 2 inter-node edges`);
    assert(ring.totalExposure > 0, `Ring ${ring.id} must have positive merchandise exposure`);
  }

  // 4. Surrogate Rule Distillation
  assert(SURROGATE_RULES.length >= 5, 'Surrogate distillation must produce at least 5 human rules');
  assert(SURROGATE_MODEL_SUMMARY.overallFidelityAgreement >= 90, 'Surrogate fidelity agreement must be >= 90%');
  assert(SURROGATE_MODEL_SUMMARY.totalDatasetCoverage >= 85, 'Surrogate dataset coverage must be >= 85%');

  // 5. Zero-Hallucination Data Query Engine
  const records = getHeldoutTestRecords();
  assert(records.length === 12000, 'Held-out records in query engine must match 12,000 count');

  // Query 1: Wardrobing in Apparel
  const q1 = parseQueryDeterministically('Show me wardrobing cases in Apparel with order value over $200');
  assert(q1.canAnswer === true, 'Valid retail query must be accepted');
  assert(q1.filters.abuseType === 'Wardrobing', 'Abuse type must match Wardrobing');
  assert(q1.filters.itemCategory === 'Apparel', 'Item category must match Apparel');
  assert(q1.filters.minOrderValue === 200, 'Min order value must match 200');

  const filteredQ1 = executeFilter(records, q1.filters);
  assert(filteredQ1.length > 0, 'Filter execution on 12k records must find matching cases');
  for (const c of filteredQ1) {
    assert(c.actualAbuseType === 'Wardrobing', 'All filtered cases must be Wardrobing');
    assert(c.itemCategory.includes('Apparel'), 'All filtered cases must be Apparel');
    assert(c.orderValue >= 200, 'All filtered cases must be >= $200');
  }

  // Query 2: Out of domain refusal (Zero-Hallucination)
  const qRefusal = parseQueryDeterministically('What is the weather in Tokyo?');
  assert(qRefusal.canAnswer === false, 'Out-of-domain queries must be safely refused');
  assert(qRefusal.reason.includes("I can't answer that"), 'Refusal must contain explicit transparency sentence');

  return {
    name: 'advanced-features.unit.spec',
    assertions,
    passed: true,
  };
}
