/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Cost-Sensitive Decision Engine
 * Pure, deterministic mathematical optimization module.
 */

import { ActionRecommendation, CostMatrix, ExpectedCostResult, ActionCostBreakdown } from '../types';

export const DEFAULT_COST_MATRIX: CostMatrix = {
  cost_false_positive: 45, // $45: lost margin, customer churn, LTV impact of wrongly denying/flagging good buyer
  cost_false_negative: 125, // $125: direct merchandise loss, chargeback fees, un-resellable inventory
  cost_manual_review: 18,   // $18: ops analyst queue handling, inspection labor, return intake processing
};

/**
 * Pure decision function computing minimum expected cost across all actions.
 * 
 * @param probabilities Multi-class probability distribution across [Legitimate, Policy Abuser, Fraudulent Return, Wardrobing]
 * @param costMatrix Editable cost matrix parameters
 * @param orderValue Optional specific order value for adaptive scaling
 */
export function computeOptimalDecision(
  probabilities: {
    Legitimate: number;
    'Policy Abuser': number;
    'Fraudulent Return': number;
    Wardrobing: number;
  },
  costMatrix: CostMatrix,
  orderValue?: number
): ExpectedCostResult {
  const pL = Math.max(0, Math.min(1, probabilities.Legitimate));
  const pP = Math.max(0, Math.min(1, probabilities['Policy Abuser']));
  const pF = Math.max(0, Math.min(1, probabilities['Fraudulent Return']));
  const pW = Math.max(0, Math.min(1, probabilities.Wardrobing));

  // Dynamic order value scaling: if item is high value ($400+), missing fraud is proportionally costlier
  const valueMultiplier = orderValue ? Math.max(0.6, Math.min(3.0, orderValue / 110)) : 1.0;
  const cFN = costMatrix.cost_false_negative * valueMultiplier;
  const cFP = costMatrix.cost_false_positive;
  const cMR = costMatrix.cost_manual_review;

  // Expected direct merchandise/abuse loss weights
  const expectedAbuseDirectLoss = (pF * 1.0 + pW * 0.85 + pP * 0.50) * cFN;

  // 1. APPROVE-INSTANTLY:
  // - Legit: $0 loss
  // - Real abuse: Full loss of merchandise, return shipping, restocking
  const approveBreakdown: ActionCostBreakdown = {
    riskCost: expectedAbuseDirectLoss,
    reviewCost: 0,
    frictionCost: 0,
    totalCost: expectedAbuseDirectLoss,
  };

  // 2. FLAG-FOR-REVIEW:
  // - Ops inspection cost: cMR
  // - Friction on legit customer: small dispute/delay friction (~12% of CFP)
  // - Residual risk: Reviewer catches 90% of real abuse; 10% slips through
  const flagResidualRisk = expectedAbuseDirectLoss * 0.10;
  const flagLegitFriction = pL * (cFP * 0.12);
  const flagBreakdown: ActionCostBreakdown = {
    riskCost: flagResidualRisk,
    reviewCost: cMR,
    frictionCost: flagLegitFriction,
    totalCost: cMR + flagResidualRisk + flagLegitFriction,
  };

  // 3. DENY-AND-BLACKLIST:
  // - Legit: Severe customer churn, chargeback dispute, lost LTV (100% of CFP)
  // - Real abuse: Successfully stopped! Residual ticket friction (~5% of cMR)
  const denyLegitPenalty = pL * cFP;
  const denyAbuseFriction = (1 - pL) * (cMR * 0.08);
  const denyBreakdown: ActionCostBreakdown = {
    riskCost: 0,
    reviewCost: 0,
    frictionCost: denyLegitPenalty + denyAbuseFriction,
    totalCost: denyLegitPenalty + denyAbuseFriction,
  };

  const actionCosts: Record<ActionRecommendation, ActionCostBreakdown> = {
    'Approve-Instantly': {
      ...approveBreakdown,
      totalCost: Number(approveBreakdown.totalCost.toFixed(2)),
    },
    'Flag-for-Review': {
      ...flagBreakdown,
      totalCost: Number(flagBreakdown.totalCost.toFixed(2)),
    },
    'Deny-and-Blacklist': {
      ...denyBreakdown,
      totalCost: Number(denyBreakdown.totalCost.toFixed(2)),
    },
  };

  // Select action with minimum expected cost
  let recommendedAction: ActionRecommendation = 'Approve-Instantly';
  let minCost = actionCosts['Approve-Instantly'].totalCost;

  if (actionCosts['Flag-for-Review'].totalCost < minCost) {
    recommendedAction = 'Flag-for-Review';
    minCost = actionCosts['Flag-for-Review'].totalCost;
  }
  if (actionCosts['Deny-and-Blacklist'].totalCost < minCost) {
    recommendedAction = 'Deny-and-Blacklist';
    minCost = actionCosts['Deny-and-Blacklist'].totalCost;
  }

  const allCosts = [
    actionCosts['Approve-Instantly'].totalCost,
    actionCosts['Flag-for-Review'].totalCost,
    actionCosts['Deny-and-Blacklist'].totalCost,
  ];
  const maxCost = Math.max(...allCosts);
  const savingsVsWorst = Math.max(0, Number((maxCost - minCost).toFixed(2)));
  const savingsVsApprove = Math.max(0, Number((actionCosts['Approve-Instantly'].totalCost - minCost).toFixed(2)));
  const savingsVsNaiveReview = Math.max(0, Number((actionCosts['Flag-for-Review'].totalCost - minCost).toFixed(2)));

  // Sensitivity analysis: find which cost slider changes would flip the decision
  let sensitiveTo: 'FP' | 'FN' | 'Review' = 'Review';
  let distanceToFlipAction = 0;
  let explanation = '';

  const costDifferenceToNext = allCosts
    .filter((c) => c !== minCost)
    .sort((a, b) => a - b)[0] - minCost;

  distanceToFlipAction = Number(costDifferenceToNext.toFixed(2));

  if (recommendedAction === 'Approve-Instantly') {
    sensitiveTo = 'FN';
    explanation = `If False Negative penalty rises by $${(distanceToFlipAction * 1.5).toFixed(0)} or abuse probability increases by ${(distanceToFlipAction / (cFN || 1) * 100).toFixed(1)}%, action flips to Flag-for-Review.`;
  } else if (recommendedAction === 'Flag-for-Review') {
    sensitiveTo = cMR > 35 ? 'Review' : 'FP';
    explanation = `Decision balances $${cMR} review fee against $${cFP} churn risk. Adjusting review cost by $${distanceToFlipAction.toFixed(0)} will shift to ${actionCosts['Approve-Instantly'].totalCost < actionCosts['Deny-and-Blacklist'].totalCost ? 'Approve' : 'Deny'}.`;
  } else {
    sensitiveTo = 'FP';
    explanation = `High abuse confidence justifies immediate Denial. Increasing False Positive penalty by $${(distanceToFlipAction * 1.8).toFixed(0)} would flip this to Flag-for-Review.`;
  }

  return {
    actionCosts,
    recommendedAction,
    minCost: Number(minCost.toFixed(2)),
    savingsVsApprove,
    savingsVsNaiveReview,
    savingsVsWorst,
    sensitivityDeltas: {
      distanceToFlipAction,
      sensitiveTo,
      explanation,
    },
  };
}
