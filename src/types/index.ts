export type AbuseType = 'Legitimate' | 'Policy Abuser' | 'Fraudulent Return' | 'Wardrobing';

export type ActionRecommendation = 'Approve-Instantly' | 'Flag-for-Review' | 'Deny-and-Blacklist';

export interface CostMatrix {
  cost_false_positive: number; // Cost of wrongly flagging a legitimate return (customer churn + support friction)
  cost_false_negative: number; // Cost of missing real fraud/wardrobing (item loss + chargeback risk)
  cost_manual_review: number;  // Cost of routing a case to human review (labor/queue expense)
}

export interface ActionCostBreakdown {
  riskCost: number;     // Expected loss from undetected abuse
  reviewCost: number;   // Human review labor cost
  frictionCost: number; // Customer churn / support friction
  totalCost: number;    // Sum of expected costs
}

export interface ExpectedCostResult {
  actionCosts: Record<ActionRecommendation, ActionCostBreakdown>;
  recommendedAction: ActionRecommendation;
  minCost: number;
  savingsVsApprove: number;
  savingsVsNaiveReview: number;
  savingsVsWorst: number;
  sensitivityDeltas: {
    distanceToFlipAction: number; // probability margin before optimal action changes
    sensitiveTo: 'FP' | 'FN' | 'Review';
    explanation: string;
  };
}

export interface ShapFeature {
  feature: string;
  label: string;
  contribution: number; // positive increases abuse risk, negative decreases abuse risk
  direction: 'increases_risk' | 'decreases_risk';
  value: string | number | boolean;
  category: 'behavior' | 'transaction' | 'device' | 'physical_inspection';
}

export interface ReturnCase {
  id: string;
  customerName: string;
  customerAge: number;
  ageBracket: '18-24' | '25-34' | '35-49' | '50-64' | '65+';
  customerGender: 'Female' | 'Male' | 'Non-Binary';
  region: 'Northeast' | 'Midwest' | 'South' | 'West' | 'Pacific NW';
  accountTenureDays: number;
  totalOrdersPrior: number;
  returnRatePrior: number; // e.g. 0.08 = 8%
  orderValue: number;
  itemCategory: string;
  daysBetweenDeliveryAndReturn: number;
  returnReason: string;
  packagingCondition: 'Original Sealed' | 'Opened Intact' | 'Tags Removed' | 'Damaged / Repackaged';
  wardrobingFlagTags: boolean;
  wardrobingSmellOrWear: boolean;
  wardrobingSocialMediaMatch: boolean;
  emptyBoxClaim: boolean;
  serialReturnerIndex: number; // 0 - 100
  ipProxyMismatch: boolean;
  disputeHistoryCount: number;
  deviceFingerprintRisk: number; // 0 - 100
  actualAbuseType?: AbuseType; // Ground truth in backtest
}

export interface PredictionResult {
  probabilities: Record<AbuseType, number>;
  predictedClass: AbuseType;
  confidence: number;
  shapFeatures: ShapFeature[];
  baseValue: number;
}

export interface CaseAnalysis {
  caseData: ReturnCase;
  prediction: PredictionResult;
  decision: ExpectedCostResult;
  explanation: {
    summary: string;
    keyDrivers: string[];
    opsActionRecommendation: string;
    modelConfidenceNote: string;
    provider: 'gemini' | 'groq' | 'ensemble-rule';
    generatedAt: string;
  };
}

export interface ConfusionMatrixData {
  labels: AbuseType[];
  matrix: number[][]; // [actual][predicted]
  classMetrics: Record<AbuseType, {
    precision: number;
    recall: number;
    f1Score: number;
    support: number;
  }>;
  overallAccuracy: number;
  macroF1: number;
}

export interface BacktestResults {
  sampleSize: number;
  costMatrix: CostMatrix;
  returnIqPolicy: {
    totalCost: number;
    costPerReturn: number;
    approvedCount: number;
    reviewedCount: number;
    deniedCount: number;
    fraudCatchRate: number;        // Catch rate of (Fraud + Wardrobing + Policy Abuser)
    falseFlagRateOnLegit: number;  // Legit returns sent to Review or Denied
    opsLaborHours: number;
  };
  naiveReviewBaseline: {
    totalCost: number;
    costPerReturn: number;
    approvedCount: number;
    reviewedCount: number;
    deniedCount: number;
    fraudCatchRate: number;
    falseFlagRateOnLegit: number;
    opsLaborHours: number;
  };
  netSavingsDollars: number;
  costReductionPercent: number;
  savedOpsHours: number;
  confusionMatrix: ConfusionMatrixData;
  evaluatedAt: string;
}

export interface DemographicGroupMetric {
  groupName: string;
  subgroup: string;
  sampleCount: number;
  legitCount: number;
  abuseCount: number;
  falsePositiveRate: number; // Legit customer wrongly flagged / denied
  falseNegativeRate: number; // Real abuser wrongly approved
  avgItemValue: number;
  disparityVsBenchmark: number; // Ratio vs overall FPR
  isFlaggedDisparity: boolean;
}

export interface FairnessReport {
  overallFPR: number;
  overallFNR: number;
  categories: {
    age: DemographicGroupMetric[];
    region: DemographicGroupMetric[];
    accountTenure: DemographicGroupMetric[];
  };
  plainLanguageFinding: string;
  recommendedMitigations: string[];
  syntheticNotice: string;
}
