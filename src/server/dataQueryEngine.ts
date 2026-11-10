/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ - Chat-With-Your-Fraud-Data Engine
 * 
 * Safely translates natural-language queries into structured filters
 * executed against the 12,000 held-out test cases.
 * Guarantees ZERO row fabrication: the LLM never generates data, only filter specifications.
 */

import { GoogleGenAI } from '@google/genai';
import { ReturnCase, AbuseType, ActionRecommendation } from '../types';
import { generateSyntheticTestSet } from '../lib/backtestCore';
import { predictReturnAbuse } from '../lib/modelInference';
import { DEFAULT_COST_MATRIX, computeOptimalDecision } from '../lib/decisionEngine';

export interface EvaluatedCaseRecord extends ReturnCase {
  predictedAbuseType: AbuseType;
  modelConfidence: number;
  recommendedAction: ActionRecommendation;
  expectedCost: number;
}

export interface DataFilterCriteria {
  abuseType?: AbuseType | AbuseType[];
  itemCategory?: string;
  minOrderValue?: number;
  maxOrderValue?: number;
  region?: string;
  ageBracket?: string;
  actionRecommendation?: ActionRecommendation;
  highDeviceRisk?: boolean; // deviceFingerprintRisk > 60
  wardrobingTags?: boolean;
  emptyBox?: boolean;
  ipProxyMismatch?: boolean;
  minDaysToReturn?: number;
  maxDaysToReturn?: number;
  packagingDamaged?: boolean;
}

export interface QueryResponse {
  query: string;
  canAnswer: boolean;
  explanation: string;
  parsedFilters?: DataFilterCriteria;
  summaryMetrics?: {
    matchCount: number;
    totalExposureDollars: number;
    avgOrderValue: number;
    abuseBreakdown: Record<AbuseType, number>;
    actionBreakdown: Record<ActionRecommendation, number>;
  };
  sampleRecords?: Array<{
    id: string;
    customerName: string;
    orderValue: number;
    itemCategory: string;
    actualAbuseType: AbuseType;
    predictedAbuseType: AbuseType;
    recommendedAction: ActionRecommendation;
    daysBetweenDeliveryAndReturn: number;
    region: string;
    riskSignals: string[];
  }>;
}

// In-memory memoized 12,000 held-out cases
let cachedHeldoutRecords: EvaluatedCaseRecord[] | null = null;

export function getHeldoutTestRecords(): EvaluatedCaseRecord[] {
  if (!cachedHeldoutRecords) {
    const rawCases = generateSyntheticTestSet(12000);
    cachedHeldoutRecords = rawCases.map((c) => {
      const pred = predictReturnAbuse(c);
      const dec = computeOptimalDecision(pred.probabilities, DEFAULT_COST_MATRIX, c.orderValue);
      return {
        ...c,
        predictedAbuseType: pred.predictedClass,
        modelConfidence: pred.confidence,
        recommendedAction: dec.recommendedAction,
        expectedCost: dec.minCost,
      };
    });
  }
  return cachedHeldoutRecords;
}

let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  }
  return genAIClient;
}

/**
 * Deterministic Semantic Query Parser
 * Maps common natural-language queries reliably even when offline or before LLM responds
 */
export function parseQueryDeterministically(query: string): { canAnswer: boolean; filters: DataFilterCriteria; reason: string } {
  const q = query.toLowerCase().trim();

  // Out of domain queries check
  const nonDomainTriggers = ['weather', 'president', 'capital of', 'recipe', 'movie', 'song', 'joke', 'poem', 'write a story', 'who is', 'credit card number', 'ssn', 'password'];
  if (nonDomainTriggers.some((t) => q.includes(t))) {
    return {
      canAnswer: false,
      filters: {},
      reason: "I can't answer that from the available data. The ReturnIQ dataset tracks retail returns, order values, fraud/wardrobing indicators, and decision policies.",
    };
  }

  const filters: DataFilterCriteria = {};

  // Abuse type matching
  if (q.includes('wardrobing') || q.includes('wardrobe')) {
    filters.abuseType = 'Wardrobing';
  } else if (q.includes('fraudulent') || q.includes('fraud return') || q.includes('stolen') || q.includes('organized fraud')) {
    filters.abuseType = 'Fraudulent Return';
  } else if (q.includes('policy abuser') || q.includes('serial returner') || q.includes('bracketing') || q.includes('abuser')) {
    filters.abuseType = 'Policy Abuser';
  } else if (q.includes('legit') || q.includes('honest') || q.includes('good customer')) {
    filters.abuseType = 'Legitimate';
  }

  // Category matching
  if (q.includes('apparel') || q.includes('clothing') || q.includes('dress') || q.includes('fashion')) {
    filters.itemCategory = 'Apparel';
  } else if (q.includes('electronic') || q.includes('phone') || q.includes('laptop') || q.includes('gadget')) {
    filters.itemCategory = 'Electronics';
  } else if (q.includes('luxury') || q.includes('jewelry') || q.includes('designer') || q.includes('watch')) {
    filters.itemCategory = 'Luxury Goods';
  } else if (q.includes('home') || q.includes('kitchen') || q.includes('furniture')) {
    filters.itemCategory = 'Home Goods';
  } else if (q.includes('beauty') || q.includes('cosmetic') || q.includes('fragrance')) {
    filters.itemCategory = 'Beauty & Cosmetics';
  }

  // Value thresholds
  const highVal = q.includes('high value') || q.includes('expensive') || q.includes('over $200') || q.includes('over $300') || q.includes('>200') || q.includes('>300');
  const lowVal = q.includes('low value') || q.includes('cheap') || q.includes('under $50') || q.includes('<50');

  if (highVal) filters.minOrderValue = 250;
  if (lowVal) filters.maxOrderValue = 50;

  // Specific value pattern like "$400", "over 300"
  const overMatch = q.match(/(?:over|greater than|>)\s*\$?(\d+)/);
  if (overMatch) filters.minOrderValue = parseInt(overMatch[1], 10);

  const underMatch = q.match(/(?:under|less than|<)\s*\$?(\d+)/);
  if (underMatch) filters.maxOrderValue = parseInt(underMatch[1], 10);

  // Region matching
  if (q.includes('west')) filters.region = 'West';
  else if (q.includes('northeast')) filters.region = 'Northeast';
  else if (q.includes('south')) filters.region = 'South';
  else if (q.includes('midwest')) filters.region = 'Midwest';

  // Action matching
  if (q.includes('deny') || q.includes('denied') || q.includes('blacklist')) {
    filters.actionRecommendation = 'Deny-and-Blacklist';
  } else if (q.includes('flag') || q.includes('review') || q.includes('inspected') || q.includes('inspection')) {
    filters.actionRecommendation = 'Flag-for-Review';
  } else if (q.includes('approve') || q.includes('approved') || q.includes('instant')) {
    filters.actionRecommendation = 'Approve-Instantly';
  }

  // Specific risk signals
  if (q.includes('tag') || q.includes('tags removed') || q.includes('worn')) {
    filters.wardrobingTags = true;
  }
  if (q.includes('empty box') || q.includes('empty parcel') || q.includes('missing item')) {
    filters.emptyBox = true;
  }
  if (q.includes('proxy') || q.includes('vpn') || q.includes('ip mismatch')) {
    filters.ipProxyMismatch = true;
  }
  if (q.includes('device') || q.includes('high risk device') || q.includes('mobile')) {
    filters.highDeviceRisk = true;
  }

  // If no filters were recognized and the query wasn't a general summary request
  const isGeneralSummary = q.includes('all') || q.includes('summary') || q.includes('overview') || q.includes('breakdown') || q.includes('cases') || q.includes('returns') || q.includes('show');
  
  if (!isGeneralSummary && Object.keys(filters).length === 0) {
    return {
      canAnswer: false,
      filters: {},
      reason: "I can't answer that from the available data. Try asking about abuse categories (Wardrobing, Fraud), item types (Luxury, Electronics), order values, or recommended actions.",
    };
  }

  return {
    canAnswer: true,
    filters,
    reason: 'Parsed query against retail return dimensions.',
  };
}

/**
 * Filter Execution Engine
 * Evaluates filter predicates against actual held-out records
 */
export function executeFilter(records: EvaluatedCaseRecord[], criteria: DataFilterCriteria): EvaluatedCaseRecord[] {
  return records.filter((r) => {
    if (criteria.abuseType) {
      if (Array.isArray(criteria.abuseType)) {
        if (!criteria.abuseType.includes(r.actualAbuseType!)) return false;
      } else {
        if (r.actualAbuseType !== criteria.abuseType) return false;
      }
    }

    if (criteria.itemCategory && !r.itemCategory.toLowerCase().includes(criteria.itemCategory.toLowerCase())) {
      return false;
    }

    if (criteria.minOrderValue !== undefined && r.orderValue < criteria.minOrderValue) {
      return false;
    }

    if (criteria.maxOrderValue !== undefined && r.orderValue > criteria.maxOrderValue) {
      return false;
    }

    if (criteria.region && r.region !== criteria.region) {
      return false;
    }

    if (criteria.ageBracket && r.ageBracket !== criteria.ageBracket) {
      return false;
    }

    if (criteria.actionRecommendation && r.recommendedAction !== criteria.actionRecommendation) {
      return false;
    }

    if (criteria.highDeviceRisk && r.deviceFingerprintRisk < 60) {
      return false;
    }

    if (criteria.wardrobingTags && !r.wardrobingFlagTags) {
      return false;
    }

    if (criteria.emptyBox && !r.emptyBoxClaim) {
      return false;
    }

    if (criteria.ipProxyMismatch && !r.ipProxyMismatch) {
      return false;
    }

    if (criteria.minDaysToReturn !== undefined && r.daysBetweenDeliveryAndReturn < criteria.minDaysToReturn) {
      return false;
    }

    if (criteria.maxDaysToReturn !== undefined && r.daysBetweenDeliveryAndReturn > criteria.maxDaysToReturn) {
      return false;
    }

    if (criteria.packagingDamaged && !r.packagingCondition.includes('Damaged')) {
      return false;
    }

    return true;
  });
}

/**
 * Main query processor:
 * 1. Uses Gemini to translate natural language into structured JSON filter schema
 * 2. Falls back to deterministic regex parser
 * 3. Applies filter against the 12,000 held-out cases
 * 4. Assembles aggregate metrics and real row slice
 */
export async function queryFraudData(userQuery: string): Promise<QueryResponse> {
  const records = getHeldoutTestRecords();

  let parsedCriteria: DataFilterCriteria = {};
  let canAnswer = true;
  let explanation = '';

  const gemini = getGeminiClient();

  if (gemini) {
    try {
      const prompt = `You are a strict data-filtering translation compiler for ReturnIQ (GenOS Team).
You translate natural language queries into a JSON filter specification to run against 12,000 return cases.

Dataset schema fields:
- abuseType: "Legitimate" | "Policy Abuser" | "Fraudulent Return" | "Wardrobing"
- itemCategory: "Apparel" | "Electronics" | "Luxury Goods" | "Home Goods" | "Beauty & Cosmetics"
- minOrderValue: number (e.g. 200)
- maxOrderValue: number (e.g. 50)
- region: "Northeast" | "Midwest" | "South" | "West" | "Pacific NW"
- actionRecommendation: "Approve-Instantly" | "Flag-for-Review" | "Deny-and-Blacklist"
- highDeviceRisk: boolean
- wardrobingTags: boolean
- emptyBox: boolean
- ipProxyMismatch: boolean
- minDaysToReturn: number
- maxDaysToReturn: number

CRITICAL SAFETY INSTRUCTIONS:
1. If the user asks something NOT related to return fraud, orders, customers, or decisions (e.g., weather, history, recipes, general coding, personal secrets), set "canAnswer": false.
2. If "canAnswer" is false, set "explanation": "I can't answer that from the available data."
3. Never invent rows. You only output filter criteria.

User Query: "${userQuery}"

Output format (MUST be valid JSON only, no markdown wrapping, no backticks):
{
  "canAnswer": true,
  "explanation": "Filtering for...",
  "filters": {
    "abuseType": "...",
    ...
  }
}`;

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
      const geminiPromise = gemini.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const response = await Promise.race([geminiPromise, timeoutPromise]);

      if (response && 'text' in response && response.text) {
        try {
          const parsed = JSON.parse(response.text.trim());
          canAnswer = parsed.canAnswer !== false;
          explanation = parsed.explanation || '';
          parsedCriteria = parsed.filters || {};
        } catch {
          // fallback to deterministic
        }
      }
    } catch (err) {
      console.warn('Gemini data query translation failed, using deterministic parser:', err);
    }
  }

  // If Gemini wasn't available or couldn't parse, use deterministic semantic parser
  if (!explanation) {
    const det = parseQueryDeterministically(userQuery);
    canAnswer = det.canAnswer;
    explanation = det.reason;
    parsedCriteria = det.filters;
  }

  if (!canAnswer) {
    return {
      query: userQuery,
      canAnswer: false,
      explanation: "I can't answer that from the available data. The ReturnIQ dataset holds 12,000 test cases with attributes: order value, return reason, abuse classification (Wardrobing, Fraud, Policy Abuser, Legitimate), item category, and warehouse inspection flags.",
    };
  }

  // Execute filter against real records
  const matched = executeFilter(records, parsedCriteria);

  // Compute aggregate statistics
  const abuseBreakdown: Record<AbuseType, number> = {
    'Legitimate': 0,
    'Policy Abuser': 0,
    'Fraudulent Return': 0,
    'Wardrobing': 0,
  };

  const actionBreakdown: Record<ActionRecommendation, number> = {
    'Approve-Instantly': 0,
    'Flag-for-Review': 0,
    'Deny-and-Blacklist': 0,
  };

  let totalExposure = 0;
  for (const c of matched) {
    if (c.actualAbuseType && abuseBreakdown[c.actualAbuseType] !== undefined) {
      abuseBreakdown[c.actualAbuseType]++;
    }
    if (actionBreakdown[c.recommendedAction] !== undefined) {
      actionBreakdown[c.recommendedAction]++;
    }
    totalExposure += c.orderValue;
  }

  const avgOrderValue = matched.length > 0 ? Math.round(totalExposure / matched.length) : 0;

  // Format sample records (top 20 for preview)
  const sampleRecords = matched.slice(0, 20).map((r) => {
    const riskSignals: string[] = [];
    if (r.wardrobingFlagTags) riskSignals.push('Tags Removed');
    if (r.wardrobingSmellOrWear) riskSignals.push('Perfume/Wear Detected');
    if (r.emptyBoxClaim) riskSignals.push('Empty Box Claim');
    if (r.ipProxyMismatch) riskSignals.push('Proxy Mismatch');
    if (r.returnRatePrior > 0.3) riskSignals.push(`High Return Rate (${(r.returnRatePrior * 100).toFixed(0)}%)`);
    if (riskSignals.length === 0) riskSignals.push('Clean History');

    return {
      id: r.id,
      customerName: r.customerName,
      orderValue: r.orderValue,
      itemCategory: r.itemCategory,
      actualAbuseType: r.actualAbuseType || 'Legitimate',
      predictedAbuseType: r.predictedAbuseType,
      recommendedAction: r.recommendedAction,
      daysBetweenDeliveryAndReturn: r.daysBetweenDeliveryAndReturn,
      region: r.region,
      riskSignals,
    };
  });

  return {
    query: userQuery,
    canAnswer: true,
    explanation: explanation || `Filtered 12,000 cases matching specified criteria.`,
    parsedFilters: parsedCriteria,
    summaryMetrics: {
      matchCount: matched.length,
      totalExposureDollars: Math.round(totalExposure),
      avgOrderValue,
      abuseBreakdown,
      actionBreakdown,
    },
    sampleRecords,
  };
}
