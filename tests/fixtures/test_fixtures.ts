/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Test Automation Fixtures & Test Oracles
 * 
 * Includes deterministic fixture cases and hand-computed mathematical oracle
 * reference values with step-by-step arithmetic shown for full reproducibility.
 */

import { ReturnCase, CostMatrix, ExpectedCostResult, AbuseType } from '../../src/types';

export const DATASET_SPECIFICATION = {
  totalRows: 60000,
  testSplitSize: 12000, // 20% held-out test split
  classPriors: {
    Legitimate: 0.701,
    'Policy Abuser': 0.119,
    'Fraudulent Return': 0.102,
    Wardrobing: 0.077,
  } as Record<AbuseType, number>,
  tolerance: 0.015, // ±1.5% tolerance for empirical split sampling
};

// Model artifact fingerprint hash matching the backtest numbers in /results
export const EXPECTED_BACKTEST_SIGNATURE = {
  modelArtifactVersion: 'returniq-ensemble-v2026.04',
  expectedNetSavingsDollars: 199502,
  expectedCostReductionPercent: 82.9,
  expectedSavedOpsHours: 588,
  expectedAbuseCatchRate: 98.3,
  expectedFalseFlagRateOnLegit: 5.6,
  expectedOverallAccuracy: 98.6,
  expectedMacroF1: 97.4,
};

/**
 * 5 Hand-derived mathematical reference cases.
 * Arithmetic shown in comments for manual audit verification.
 */
export interface HandDerivedTestCase {
  name: string;
  probabilities: Record<AbuseType, number>;
  costMatrix: CostMatrix;
  orderValue: number;
  handCalculations: {
    expectedCostApprove: number;
    expectedCostFlag: number;
    expectedCostDeny: number;
    expectedOptimalAction: 'Approve-Instantly' | 'Flag-for-Review' | 'Deny-and-Blacklist';
    expectedMinCost: number;
  };
}

export const HAND_DERIVED_REFERENCE_CASES: HandDerivedTestCase[] = [
  // CASE 1: Clearly Legitimate Shopper
  // pL=0.96, pP=0.02, pF=0.01, pW=0.01, CFP=45, CFN=125, CMR=18, Order=$110
  // ValueMultiplier = 110/110 = 1.0, cFN = 125 * 1.0 = 125
  // DirectAbuseLoss = (0.01*1.0 + 0.01*0.85 + 0.02*0.50) * 125 = (0.01 + 0.0085 + 0.01) * 125 = 0.0285 * 125 = 3.5625 -> $3.56
  // E[Approve] = $3.56
  // E[Flag] = CMR + pL*(0.12*CFP) + DirectAbuseLoss*0.10 = 18 + 0.96*(5.4) + 3.5625*0.1 = 18 + 5.184 + 0.35625 = 23.54025 -> $23.54
  // E[Deny] = pL*CFP + (1 - pL)*(0.08*CMR) = 0.96*45 + 0.04*(1.44) = 43.20 + 0.0576 = 43.2576 -> $43.26
  // Optimal = Approve-Instantly (min cost: $3.56)
  {
    name: 'Case 1: Tenured VIP / Clearly Legitimate',
    probabilities: {
      Legitimate: 0.96,
      'Policy Abuser': 0.02,
      'Fraudulent Return': 0.01,
      Wardrobing: 0.01,
    },
    costMatrix: {
      cost_false_positive: 45,
      cost_false_negative: 125,
      cost_manual_review: 18,
    },
    orderValue: 110,
    handCalculations: {
      expectedCostApprove: 3.56,
      expectedCostFlag: 23.54,
      expectedCostDeny: 43.26,
      expectedOptimalAction: 'Approve-Instantly',
      expectedMinCost: 3.56,
    },
  },

  // CASE 2: High-Confidence Fraudulent Return (Empty Box Scheme)
  // pL=0.01, pP=0.02, pF=0.92, pW=0.05, CFP=45, CFN=125, CMR=18, Order=$110
  // ValueMultiplier = 1.0, cFN = 125
  // DirectAbuseLoss = (0.92*1.0 + 0.05*0.85 + 0.02*0.50) * 125 = (0.92 + 0.0425 + 0.01) * 125 = 0.9725 * 125 = 121.5625 -> $121.56
  // E[Approve] = $121.56
  // E[Flag] = 18 + 0.01*(0.12*45) + 121.5625*0.10 = 18 + 0.054 + 12.15625 = 30.21025 -> $30.21
  // E[Deny] = 0.01*45 + 0.99*(0.08*18) = 0.45 + 1.4256 = 1.8756 -> $1.88
  // Optimal = Deny-and-Blacklist (min cost: $1.88)
  {
    name: 'Case 2: Organized Empty Box Fraud',
    probabilities: {
      Legitimate: 0.01,
      'Policy Abuser': 0.02,
      'Fraudulent Return': 0.92,
      Wardrobing: 0.05,
    },
    costMatrix: {
      cost_false_positive: 45,
      cost_false_negative: 125,
      cost_manual_review: 18,
    },
    orderValue: 110,
    handCalculations: {
      expectedCostApprove: 121.56,
      expectedCostFlag: 30.21,
      expectedCostDeny: 1.88,
      expectedOptimalAction: 'Deny-and-Blacklist',
      expectedMinCost: 1.88,
    },
  },

  // CASE 3: High-Value Evening Wear Wardrober
  // pL=0.04, pP=0.08, pF=0.06, pW=0.82, CFP=45, CFN=125, CMR=18, Order=$480
  // ValueMultiplier = 480 / 110 = 4.3636 -> capped at 3.0 (defined in decision engine: Math.min(3.0, orderValue / 110))
  // cFN = 125 * 3.0 = 375.0
  // DirectAbuseLoss = (0.06*1.0 + 0.82*0.85 + 0.08*0.50) * 375 = (0.06 + 0.697 + 0.04) * 375 = 0.797 * 375 = 298.875 -> $298.88
  // E[Approve] = $298.88
  // E[Flag] = 18 + 0.04*(0.12*45) + 298.875*0.10 = 18 + 0.216 + 29.8875 = 48.1035 -> $48.10
  // E[Deny] = 0.04*45 + 0.96*(0.08*18) = 1.80 + 1.3824 = 3.1824 -> $3.18
  // Optimal = Deny-and-Blacklist (min cost: $3.18)
  {
    name: 'Case 3: High-Value Gala Gown Wardrober ($480)',
    probabilities: {
      Legitimate: 0.04,
      'Policy Abuser': 0.08,
      'Fraudulent Return': 0.06,
      Wardrobing: 0.82,
    },
    costMatrix: {
      cost_false_positive: 45,
      cost_false_negative: 125,
      cost_manual_review: 18,
    },
    orderValue: 480,
    handCalculations: {
      expectedCostApprove: 298.88,
      expectedCostFlag: 48.10,
      expectedCostDeny: 3.18,
      expectedOptimalAction: 'Deny-and-Blacklist',
      expectedMinCost: 3.18,
    },
  },

  // CASE 4: Ambiguous Borderline Return Under High False Positive Penalty (Holiday VIP)
  // pL=0.48, pP=0.32, pF=0.08, pW=0.12, CFP=110, CFN=80, CMR=14, Order=$145
  // ValueMultiplier = 145/110 = 1.31818, cFN = 80 * 1.31818 = 105.4545
  // DirectAbuseLoss = (0.08*1.0 + 0.12*0.85 + 0.32*0.50) * 105.4545 = 0.342 * 105.4545 = 36.0654 -> $36.07
  // E[Approve] = $36.07
  // E[Flag] = 14 + 0.48*(0.12*110) + 36.0654*0.10 = 14 + 6.336 + 3.6065 = 23.9425 -> $23.94
  // E[Deny] = 0.48*110 + 0.52*(0.08*14) = 52.80 + 0.5824 = 53.3824 -> $53.38
  // Optimal = Flag-for-Review (min cost: $23.94, protecting against $53.38 churn penalty)
  {
    name: 'Case 4: Ambiguous Pivot under Holiday VIP Churn Matrix',
    probabilities: {
      Legitimate: 0.48,
      'Policy Abuser': 0.32,
      'Fraudulent Return': 0.08,
      Wardrobing: 0.12,
    },
    costMatrix: {
      cost_false_positive: 110,
      cost_false_negative: 80,
      cost_manual_review: 14,
    },
    orderValue: 145,
    handCalculations: {
      expectedCostApprove: 36.07,
      expectedCostFlag: 23.94,
      expectedCostDeny: 53.38,
      expectedOptimalAction: 'Flag-for-Review',
      expectedMinCost: 23.94,
    },
  },

  // CASE 5: Moderate Policy Abuser under Labor Shortage (High CMR)
  // pL=0.25, pP=0.60, pF=0.05, pW=0.10, CFP=35, CFN=140, CMR=48, Order=$110
  // ValueMultiplier = 1.0, cFN = 140
  // DirectAbuseLoss = (0.05*1.0 + 0.10*0.85 + 0.60*0.50) * 140 = (0.05 + 0.085 + 0.30) * 140 = 0.435 * 140 = 60.90 -> $60.90
  // E[Approve] = $60.90
  // E[Flag] = 48 + 0.25*(0.12*35) + 60.90*0.10 = 48 + 1.05 + 6.09 = 55.14 -> $55.14
  // E[Deny] = 0.25*35 + 0.75*(0.08*48) = 8.75 + 2.88 = 11.63 -> $11.63
  // Optimal = Deny-and-Blacklist (min cost: $11.63, avoids expensive $55 manual review)
  {
    name: 'Case 5: Policy Abuser under Labor Shortage ($48 CMR)',
    probabilities: {
      Legitimate: 0.25,
      'Policy Abuser': 0.60,
      'Fraudulent Return': 0.05,
      Wardrobing: 0.10,
    },
    costMatrix: {
      cost_false_positive: 35,
      cost_false_negative: 140,
      cost_manual_review: 48,
    },
    orderValue: 110,
    handCalculations: {
      expectedCostApprove: 60.90,
      expectedCostFlag: 55.14,
      expectedCostDeny: 11.63,
      expectedOptimalAction: 'Deny-and-Blacklist',
      expectedMinCost: 11.63,
    },
  },
];
