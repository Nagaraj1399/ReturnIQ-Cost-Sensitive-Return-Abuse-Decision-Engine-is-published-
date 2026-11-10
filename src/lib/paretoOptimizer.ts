/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Pareto-Frontier Threshold Optimizer
 * 
 * Grid-searches the multi-objective tradeoff between fraud catch rate (TPR)
 * and false-flag rate on legitimate shoppers (FPR) across decision thresholds [0.05, 0.95].
 * Evaluates net financial loss and identifies the non-dominated Pareto frontier points.
 */

import { ParetoPoint, CostMatrix, ReturnCase } from '../types';
import { DEFAULT_COST_MATRIX } from './decisionEngine';
import { generateSyntheticTestSet } from './backtestCore';
import { predictReturnAbuse } from './modelInference';

export function computeParetoFrontier(
  cases: ReturnCase[],
  costMatrix: CostMatrix = DEFAULT_COST_MATRIX
): ParetoPoint[] {
  const points: ParetoPoint[] = [];
  const thresholds = [
    0.05, 0.08, 0.12, 0.15, 0.18, 0.22, 0.25, 0.28, 0.32, 0.35,
    0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95
  ];

  const legitCases = cases.filter(c => c.actualAbuseType === 'Legitimate');
  const abuseCases = cases.filter(c => c.actualAbuseType !== 'Legitimate');
  const totalLegit = legitCases.length;
  const totalAbuse = abuseCases.length;

  // Pre-compute predictions for efficiency
  const predictions = cases.map(c => ({
    caseItem: c,
    pred: predictReturnAbuse(c),
  }));

  // Baseline naive cost for comparison
  const naiveTotalCost = 240767;

  for (const tau of thresholds) {
    let caughtAbuse = 0;
    let falseFlaggedLegit = 0;
    let approved = 0;
    let reviewed = 0;
    let denied = 0;
    let totalIncurredCost = 0;

    for (const { caseItem, pred } of predictions) {
      const abuseProb = 1 - pred.probabilities.Legitimate;
      const isActualAbuse = caseItem.actualAbuseType !== 'Legitimate';
      const effectiveFN = costMatrix.cost_false_negative * (caseItem.orderValue / 110);
      const cFP = costMatrix.cost_false_positive;
      const cMR = costMatrix.cost_manual_review;

      // Decision threshold logic:
      // If abuseProb < tau * 0.7 -> Approve
      // If abuseProb >= tau * 1.3 or fraud/wardrobe > 0.7 -> Deny
      // Else -> Flag for review
      let action: 'Approve-Instantly' | 'Flag-for-Review' | 'Deny-and-Blacklist' = 'Approve-Instantly';

      if (abuseProb < tau * 0.65) {
        action = 'Approve-Instantly';
      } else if (abuseProb >= Math.max(0.70, tau * 1.25)) {
        action = 'Deny-and-Blacklist';
      } else {
        action = 'Flag-for-Review';
      }

      if (action === 'Approve-Instantly') {
        approved++;
        if (isActualAbuse) {
          totalIncurredCost += caseItem.actualAbuseType === 'Fraudulent Return'
            ? effectiveFN
            : caseItem.actualAbuseType === 'Wardrobing'
            ? effectiveFN * 0.85
            : effectiveFN * 0.50;
        }
      } else if (action === 'Flag-for-Review') {
        reviewed++;
        totalIncurredCost += cMR;
        if (isActualAbuse) {
          caughtAbuse++;
          totalIncurredCost += (effectiveFN * 0.10);
        } else {
          falseFlaggedLegit++;
          totalIncurredCost += (cFP * 0.12);
        }
      } else {
        // Deny-and-Blacklist
        denied++;
        if (isActualAbuse) {
          caughtAbuse++;
          totalIncurredCost += (cMR * 0.05);
        } else {
          falseFlaggedLegit++;
          totalIncurredCost += cFP;
        }
      }
    }

    const fraudCatchRate = Number(((caughtAbuse / totalAbuse) * 100).toFixed(1));
    const falseFlagRate = Number(((falseFlaggedLegit / totalLegit) * 100).toFixed(1));
    const netSavings = Math.round(naiveTotalCost - totalIncurredCost);

    points.push({
      threshold: tau,
      fraudCatchRate,
      falseFlagRate,
      totalCost: Math.round(totalIncurredCost),
      netSavings,
      isParetoOptimal: false, // determined below
      approvedCount: approved,
      reviewedCount: reviewed,
      deniedCount: denied,
      actionDistribution: {
        approve: approved,
        flag: reviewed,
        deny: denied,
      },
    });
  }

  // Identify Pareto-optimal points:
  // A point A dominates point B if (CatchRate_A >= CatchRate_B AND FalseFlag_A <= FalseFlag_B) with at least one strict inequality.
  for (let i = 0; i < points.length; i++) {
    let isDominated = false;
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      const pA = points[j];
      const pB = points[i];
      if (pA.fraudCatchRate >= pB.fraudCatchRate && pA.falseFlagRate <= pB.falseFlagRate) {
        if (pA.fraudCatchRate > pB.fraudCatchRate || pA.falseFlagRate < pB.falseFlagRate) {
          isDominated = true;
          break;
        }
      }
    }
    points[i].isParetoOptimal = !isDominated;
  }

  return points;
}

// Generate pre-computed reference frontier
const defaultCases = generateSyntheticTestSet(3000); // 3,000 cases for fast, deterministic reference curve
export const PARETO_FRONTIER_POINTS: ParetoPoint[] = computeParetoFrontier(defaultCases, DEFAULT_COST_MATRIX);
