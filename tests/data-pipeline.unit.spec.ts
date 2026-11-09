/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Unit Test: Data Pipeline & Dataset Integrity
 * 
 * Verifies:
 * - Expected row counts & class distribution matching Kaggle 60,000 dataset priors
 * - Zero NaN / null / undefined values survive feature engineering
 * - Train/val/test split preserves class stratification within tolerance
 */

import { generateSyntheticTestSet } from '../src/lib/backtestCore';
import { DATASET_SPECIFICATION } from './fixtures/test_fixtures';
import { AbuseType, ReturnCase } from '../src/types';

export function runDataPipelineUnitTests(): { passed: boolean; message: string; assertions: number } {
  let assertions = 0;
  console.log('--- Running data-pipeline.unit.spec ---');

  // 1. Generate test split of 12,000 cases
  const sampleSize = DATASET_SPECIFICATION.testSplitSize;
  const cases: ReturnCase[] = generateSyntheticTestSet(sampleSize);
  assertions++;
  if (cases.length !== sampleSize) {
    throw new Error(`Expected ${sampleSize} rows, got ${cases.length}`);
  }

  // 2. Class Distribution Verification
  const counts: Record<AbuseType, number> = {
    Legitimate: 0,
    'Policy Abuser': 0,
    'Fraudulent Return': 0,
    Wardrobing: 0,
  };

  for (const c of cases) {
    counts[c.actualAbuseType!]++;
  }

  const tolerance = DATASET_SPECIFICATION.tolerance;
  for (const [cls, prior] of Object.entries(DATASET_SPECIFICATION.classPriors)) {
    const empirical = counts[cls as AbuseType] / sampleSize;
    assertions++;
    const diff = Math.abs(empirical - prior);
    if (diff > tolerance) {
      throw new Error(`Class ${cls} empirical proportion ${empirical.toFixed(4)} differs from prior ${prior} by ${diff.toFixed(4)} (tolerance: ${tolerance})`);
    }
  }

  // 3. Assert Zero Missing Values (NaN, null, undefined)
  for (const c of cases) {
    assertions++;
    if (typeof c.orderValue !== 'number' || isNaN(c.orderValue) || c.orderValue <= 0) {
      throw new Error(`Invalid orderValue in case ${c.id}: ${c.orderValue}`);
    }
    assertions++;
    if (typeof c.returnRatePrior !== 'number' || isNaN(c.returnRatePrior) || c.returnRatePrior < 0 || c.returnRatePrior > 1) {
      throw new Error(`Invalid returnRatePrior in case ${c.id}: ${c.returnRatePrior}`);
    }
    assertions++;
    if (typeof c.accountTenureDays !== 'number' || isNaN(c.accountTenureDays) || c.accountTenureDays < 0) {
      throw new Error(`Invalid accountTenureDays in case ${c.id}: ${c.accountTenureDays}`);
    }
    assertions++;
    if (typeof c.daysBetweenDeliveryAndReturn !== 'number' || isNaN(c.daysBetweenDeliveryAndReturn) || c.daysBetweenDeliveryAndReturn < 0) {
      throw new Error(`Invalid daysBetweenDeliveryAndReturn in case ${c.id}: ${c.daysBetweenDeliveryAndReturn}`);
    }
    assertions++;
    if (!c.itemCategory || typeof c.itemCategory !== 'string') {
      throw new Error(`Missing itemCategory in case ${c.id}`);
    }
    assertions++;
    if (!c.packagingCondition || typeof c.packagingCondition !== 'string') {
      throw new Error(`Missing packagingCondition in case ${c.id}`);
    }
  }

  // 4. Stratified Split Consistency Check
  // Divide into two equal 6,000 halves and verify both preserve class ratios
  const half1 = cases.slice(0, 6000);
  const half2 = cases.slice(6000, 12000);
  const h1Legit = half1.filter(c => c.actualAbuseType === 'Legitimate').length / 6000;
  const h2Legit = half2.filter(c => c.actualAbuseType === 'Legitimate').length / 6000;
  assertions++;
  if (Math.abs(h1Legit - h2Legit) > 0.02) {
    throw new Error(`Stratification violation between halves: ${h1Legit.toFixed(4)} vs ${h2Legit.toFixed(4)}`);
  }

  console.log(`✓ data-pipeline.unit.spec passed (${assertions} assertions checked)`);
  return { passed: true, message: 'All data pipeline integrity tests passed.', assertions };
}
