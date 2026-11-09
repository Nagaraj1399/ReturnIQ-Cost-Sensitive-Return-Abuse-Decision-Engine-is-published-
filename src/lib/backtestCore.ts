/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Pure Backtest & Dataset Generator (Zero Node-specific dependencies)
 * Safe for both browser bundles and server scripts.
 */

import { AbuseType, ActionRecommendation, CostMatrix, ReturnCase } from '../types';
import { computeOptimalDecision } from './decisionEngine';
import { predictReturnAbuse } from './modelInference';

// Deterministic pseudo-random number generator for absolute reproducibility (seed: 2026)
let seed = 20260401;
function seededRandom(): number {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

const AGE_BRACKETS: Array<ReturnCase['ageBracket']> = ['18-24', '25-34', '35-49', '50-64', '65+'];
const REGIONS: Array<ReturnCase['region']> = ['Northeast', 'Midwest', 'South', 'West', 'Pacific NW'];
const GENDERS: Array<ReturnCase['customerGender']> = ['Female', 'Male', 'Non-Binary'];

const CATEGORIES = [
  'Apparel - Evening Wear',
  'Apparel - Outerwear',
  'Luxury Handbags',
  'Consumer Electronics',
  'Footwear & Accessories',
  'Home & Kitchen',
  'Fine Jewelry',
];

export function generateSyntheticTestSet(sampleSize = 12000): ReturnCase[] {
  seed = 20260401; // reset seed for consistent distribution
  const cases: ReturnCase[] = [];

  for (let i = 0; i < sampleSize; i++) {
    const roll = seededRandom();
    let actualAbuseType: AbuseType = 'Legitimate';
    if (roll < 0.701) {
      actualAbuseType = 'Legitimate';
    } else if (roll < 0.701 + 0.119) {
      actualAbuseType = 'Policy Abuser';
    } else if (roll < 0.701 + 0.119 + 0.102) {
      actualAbuseType = 'Fraudulent Return';
    } else {
      actualAbuseType = 'Wardrobing';
    }

    const ageBracket = AGE_BRACKETS[Math.floor(seededRandom() * AGE_BRACKETS.length)];
    let age = 32;
    if (ageBracket === '18-24') age = 18 + Math.floor(seededRandom() * 7);
    else if (ageBracket === '25-34') age = 25 + Math.floor(seededRandom() * 10);
    else if (ageBracket === '35-49') age = 35 + Math.floor(seededRandom() * 15);
    else if (ageBracket === '50-64') age = 50 + Math.floor(seededRandom() * 15);
    else age = 65 + Math.floor(seededRandom() * 18);

    const gender = GENDERS[Math.floor(seededRandom() * GENDERS.length)];
    const region = REGIONS[Math.floor(seededRandom() * REGIONS.length)];
    const category = CATEGORIES[Math.floor(seededRandom() * CATEGORIES.length)];

    let orderValue = Math.round(30 + seededRandom() * 220);
    let returnRatePrior = Number((0.02 + seededRandom() * 0.18).toFixed(2));
    let accountTenureDays = Math.round(60 + seededRandom() * 800);
    let totalOrdersPrior = Math.round(2 + seededRandom() * 25);
    let daysBetweenDeliveryAndReturn = Math.round(3 + seededRandom() * 22);
    let packagingCondition: ReturnCase['packagingCondition'] = 'Original Sealed';
    let wardrobingFlagTags = false;
    let wardrobingSmellOrWear = false;
    let wardrobingSocialMediaMatch = false;
    let emptyBoxClaim = false;
    let serialReturnerIndex = Math.round(seededRandom() * 30);
    let ipProxyMismatch = false;
    let disputeHistoryCount = 0;
    let deviceFingerprintRisk = Math.round(seededRandom() * 25);

    // Correlate attributes with ground-truth abuse types
    if (actualAbuseType === 'Legitimate') {
      packagingCondition = seededRandom() > 0.3 ? 'Original Sealed' : 'Opened Intact';
      returnRatePrior = Number((0.01 + seededRandom() * 0.15).toFixed(2));
    } else if (actualAbuseType === 'Policy Abuser') {
      returnRatePrior = Number((0.45 + seededRandom() * 0.40).toFixed(2));
      serialReturnerIndex = Math.round(65 + seededRandom() * 34);
      daysBetweenDeliveryAndReturn = Math.round(24 + seededRandom() * 6);
      totalOrdersPrior = Math.round(15 + seededRandom() * 40);
      accountTenureDays = Math.round(200 + seededRandom() * 700);
    } else if (actualAbuseType === 'Fraudulent Return') {
      orderValue = Math.round(250 + seededRandom() * 650);
      emptyBoxClaim = seededRandom() > 0.45;
      ipProxyMismatch = seededRandom() > 0.50;
      deviceFingerprintRisk = Math.round(60 + seededRandom() * 38);
      accountTenureDays = Math.round(5 + seededRandom() * 45);
      disputeHistoryCount = Math.floor(seededRandom() * 4);
      packagingCondition = emptyBoxClaim ? 'Damaged / Repackaged' : 'Opened Intact';
    } else if (actualAbuseType === 'Wardrobing') {
      orderValue = Math.round(180 + seededRandom() * 420);
      daysBetweenDeliveryAndReturn = Math.round(1 + seededRandom() * 3);
      wardrobingFlagTags = seededRandom() > 0.35;
      wardrobingSmellOrWear = seededRandom() > 0.40;
      wardrobingSocialMediaMatch = seededRandom() > 0.60;
      packagingCondition = wardrobingFlagTags ? 'Tags Removed' : 'Opened Intact';
      serialReturnerIndex = Math.round(50 + seededRandom() * 40);
    }

    cases.push({
      id: `RET-2026-${(10000 + i).toString()}`,
      customerName: `Customer #${10000 + i}`,
      customerAge: age,
      ageBracket,
      customerGender: gender,
      region,
      accountTenureDays,
      totalOrdersPrior,
      returnRatePrior,
      orderValue,
      itemCategory: category,
      daysBetweenDeliveryAndReturn,
      returnReason: actualAbuseType === 'Legitimate' ? 'Size / fit discrepancy' : 'Item not needed',
      packagingCondition,
      wardrobingFlagTags,
      wardrobingSmellOrWear,
      wardrobingSocialMediaMatch,
      emptyBoxClaim,
      serialReturnerIndex,
      ipProxyMismatch,
      disputeHistoryCount,
      deviceFingerprintRisk,
      actualAbuseType,
    });
  }

  return cases;
}

export function runBacktest(cases: ReturnCase[], costMatrix: CostMatrix) {
  const abuseLabels: AbuseType[] = ['Legitimate', 'Policy Abuser', 'Fraudulent Return', 'Wardrobing'];
  const confusionMatrix: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  let returnIqTotalCost = 0;
  let returnIqApproved = 0;
  let returnIqReviewed = 0;
  let returnIqDenied = 0;
  let returnIqCaughtAbuse = 0;
  let returnIqFalseFlaggedLegit = 0;

  let naiveTotalCost = 0;
  let naiveApproved = 0;
  let naiveReviewed = 0;
  let naiveDenied = 0;
  let naiveCaughtAbuse = 0;
  let naiveFalseFlaggedLegit = 0;

  const groupStats: Record<string, { total: number; legit: number; abuse: number; fp: number; fn: number; totalVal: number }> = {};

  for (const c of cases) {
    const actual = c.actualAbuseType!;
    const actualIdx = abuseLabels.indexOf(actual);
    const pred = predictReturnAbuse(c);
    const predIdx = abuseLabels.indexOf(pred.predictedClass);
    confusionMatrix[actualIdx][predIdx]++;

    const iqDecision = computeOptimalDecision(pred.probabilities, costMatrix, c.orderValue);
    const iqAction = iqDecision.recommendedAction;

    const isAbuse = actual !== 'Legitimate';
    const effectiveFN = costMatrix.cost_false_negative * (c.orderValue / 110);
    const cFP = costMatrix.cost_false_positive;
    const cMR = costMatrix.cost_manual_review;

    if (iqAction === 'Approve-Instantly') {
      returnIqApproved++;
      if (isAbuse) {
        returnIqTotalCost += actual === 'Fraudulent Return' ? effectiveFN : actual === 'Wardrobing' ? effectiveFN * 0.85 : effectiveFN * 0.50;
      }
    } else if (iqAction === 'Flag-for-Review') {
      returnIqReviewed++;
      returnIqTotalCost += cMR;
      if (isAbuse) {
        returnIqCaughtAbuse++;
        returnIqTotalCost += (effectiveFN * 0.10);
      } else {
        returnIqFalseFlaggedLegit++;
        returnIqTotalCost += (cFP * 0.12);
      }
    } else {
      returnIqDenied++;
      if (isAbuse) {
        returnIqCaughtAbuse++;
        returnIqTotalCost += (cMR * 0.05);
      } else {
        returnIqFalseFlaggedLegit++;
        returnIqTotalCost += cFP;
      }
    }

    const naiveAbuseProb = 1 - pred.probabilities.Legitimate;
    const naiveAction: ActionRecommendation = naiveAbuseProb >= 0.30 ? 'Flag-for-Review' : 'Approve-Instantly';

    if (naiveAction === 'Approve-Instantly') {
      naiveApproved++;
      if (isAbuse) {
        naiveTotalCost += actual === 'Fraudulent Return' ? effectiveFN : actual === 'Wardrobing' ? effectiveFN * 0.85 : effectiveFN * 0.50;
      }
    } else {
      naiveReviewed++;
      naiveTotalCost += cMR;
      if (isAbuse) {
        naiveCaughtAbuse++;
        naiveTotalCost += (effectiveFN * 0.10);
      } else {
        naiveFalseFlaggedLegit++;
        naiveTotalCost += (cFP * 0.12);
      }
    }

    const keys = [
      `age:${c.ageBracket}`,
      `region:${c.region}`,
      `tenure:${c.accountTenureDays < 90 ? '<90d' : c.accountTenureDays < 365 ? '3-12mo' : '1yr+'}`,
    ];

    for (const k of keys) {
      if (!groupStats[k]) {
        groupStats[k] = { total: 0, legit: 0, abuse: 0, fp: 0, fn: 0, totalVal: 0 };
      }
      groupStats[k].total++;
      groupStats[k].totalVal += c.orderValue;
      if (actual === 'Legitimate') {
        groupStats[k].legit++;
        if (iqAction !== 'Approve-Instantly') {
          groupStats[k].fp++;
        }
      } else {
        groupStats[k].abuse++;
        if (iqAction === 'Approve-Instantly') {
          groupStats[k].fn++;
        }
      }
    }
  }

  const totalLegit = cases.filter((c) => c.actualAbuseType === 'Legitimate').length;
  const totalAbuse = cases.length - totalLegit;

  const classMetrics: Record<AbuseType, { precision: number; recall: number; f1Score: number; support: number }> = {} as any;
  let totalCorrect = 0;
  let macroF1Sum = 0;

  for (let i = 0; i < abuseLabels.length; i++) {
    const label = abuseLabels[i];
    const tp = confusionMatrix[i][i];
    totalCorrect += tp;
    const support = confusionMatrix[i].reduce((a, b) => a + b, 0);
    const predictedTotal = confusionMatrix.map((r) => r[i]).reduce((a, b) => a + b, 0);

    const precision = predictedTotal > 0 ? tp / predictedTotal : 0;
    const recall = support > 0 ? tp / support : 0;
    const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    macroF1Sum += f1Score;

    classMetrics[label] = {
      precision: Number((precision * 100).toFixed(1)),
      recall: Number((recall * 100).toFixed(1)),
      f1Score: Number((f1Score * 100).toFixed(1)),
      support,
    };
  }

  const netSavingsDollars = Math.round(naiveTotalCost - returnIqTotalCost);
  const costReductionPercent = Number(((netSavingsDollars / naiveTotalCost) * 100).toFixed(1));

  const naiveOpsHours = Math.round((naiveReviewed * 12) / 60);
  const returnIqOpsHours = Math.round((returnIqReviewed * 12) / 60);
  const savedOpsHours = Math.max(0, naiveOpsHours - returnIqOpsHours);

  return {
    sampleSize: cases.length,
    costMatrix,
    returnIqPolicy: {
      totalCost: Math.round(returnIqTotalCost),
      costPerReturn: Number((returnIqTotalCost / cases.length).toFixed(2)),
      approvedCount: returnIqApproved,
      reviewedCount: returnIqReviewed,
      deniedCount: returnIqDenied,
      fraudCatchRate: Number(((returnIqCaughtAbuse / totalAbuse) * 100).toFixed(1)),
      falseFlagRateOnLegit: Number(((returnIqFalseFlaggedLegit / totalLegit) * 100).toFixed(1)),
      opsLaborHours: returnIqOpsHours,
    },
    naiveReviewBaseline: {
      totalCost: Math.round(naiveTotalCost),
      costPerReturn: Number((naiveTotalCost / cases.length).toFixed(2)),
      approvedCount: naiveApproved,
      reviewedCount: naiveReviewed,
      deniedCount: naiveDenied,
      fraudCatchRate: Number(((naiveCaughtAbuse / totalAbuse) * 100).toFixed(1)),
      falseFlagRateOnLegit: Number(((naiveFalseFlaggedLegit / totalLegit) * 100).toFixed(1)),
      opsLaborHours: naiveOpsHours,
    },
    netSavingsDollars,
    costReductionPercent,
    savedOpsHours,
    confusionMatrix: {
      labels: abuseLabels,
      matrix: confusionMatrix,
      classMetrics,
      overallAccuracy: Number(((totalCorrect / cases.length) * 100).toFixed(1)),
      macroF1: Number(((macroF1Sum / abuseLabels.length) * 100).toFixed(1)),
    },
    groupStats,
    evaluatedAt: new Date().toISOString(),
  };
}
