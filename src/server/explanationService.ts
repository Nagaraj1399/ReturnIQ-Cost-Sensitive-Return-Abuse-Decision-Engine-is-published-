/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Explanation Layer Adapter (Gemini / Groq / Deterministic Ops Heuristic)
 * Team: GenOS Team
 */

import { GoogleGenAI } from '@google/genai';
import { ActionRecommendation, ReturnCase, PredictionResult, ExpectedCostResult } from '../types';

let genAIClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

export interface ExplanationInput {
  caseData: ReturnCase;
  prediction: PredictionResult;
  decision: ExpectedCostResult;
  providerPreference?: 'gemini' | 'groq' | 'auto';
}

export interface GeneratedExplanation {
  summary: string;
  keyDrivers: string[];
  opsActionRecommendation: string;
  modelConfidenceNote: string;
  provider: 'gemini' | 'groq' | 'ensemble-rule';
  generatedAt: string;
}

/**
 * Deterministic, domain-grounded ops case note generator following the DataNova brief format:
 * "Flagged because [top 2-3 SHAP-contributing features in plain English], similar to known [abuse_type] patterns."
 */
export function generateHeuristicExplanation(input: ExplanationInput): GeneratedExplanation {
  const { caseData, prediction, decision } = input;
  const topShap = prediction.shapFeatures.filter(f => f.direction === 'increases_risk').slice(0, 3);
  const primaryFeatures = topShap.map(f => f.label.toLowerCase()).join(' and ');
  const abuseType = prediction.predictedClass;
  const action = decision.recommendedAction;

  const minCostVal = decision?.minCost ?? 0;
  const approveExposure = decision?.actionCosts?.['Approve-Instantly']?.totalCost ?? (input.caseData?.orderValue ? input.caseData.orderValue * 1.1 : 125);

  let summary = '';
  if (action === 'Approve-Instantly') {
    const protectiveFeatures = prediction.shapFeatures
      .filter(f => f.direction === 'decreases_risk')
      .map(f => f.label.toLowerCase())
      .slice(0, 2)
      .join(' alongside ');
    summary = `Approved instantly. Low abuse risk profile supported by ${protectiveFeatures || 'verified customer history and intact merchandise'}. Minimum expected cost: $${minCostVal.toFixed(2)}.`;
  } else if (action === 'Flag-for-Review') {
    summary = `Flagged for Ops review because of ${primaryFeatures || 'elevated return risk signals'}, exhibiting traits similar to known ${abuseType} patterns. Routing to physical intake inspection minimizes expected risk-friction cost to $${minCostVal.toFixed(2)}.`;
  } else {
    summary = `Deny-and-Blacklist recommended because of critical risk flags: ${primaryFeatures || 'verified abuse indicators'}, closely matching high-confidence ${abuseType} profiles. Prevents projected merchandise & dispute exposure of $${approveExposure.toFixed(2)}.`;
  }

  const keyDrivers = prediction.shapFeatures.slice(0, 3).map(f => `${f.label} (${f.direction === 'increases_risk' ? '+' : ''}${f.contribution.toFixed(2)} SHAP weight)`);

  let opsActionRecommendation = '';
  if (action === 'Approve-Instantly') {
    opsActionRecommendation = 'Execute automatic refund upon scan-at-carrier. No manual warehouse inspection required.';
  } else if (action === 'Flag-for-Review') {
    opsActionRecommendation = 'Route to Station 4 for physical tag inspection, seam/wear analysis, and carrier delivery weight comparison before release.';
  } else {
    opsActionRecommendation = 'Issue policy violation denial notice, decline automated return label, and tag account device fingerprint for review.';
  }

  return {
    summary,
    keyDrivers,
    opsActionRecommendation,
    modelConfidenceNote: `Model confidence: ${prediction.confidence}% ${abuseType} (vs 70.1% baseline legitimate prior). Prepared by GenOS Team engine.`,
    provider: 'ensemble-rule',
    generatedAt: new Date().toISOString(),
  };
}

export async function generateCaseExplanation(input: ExplanationInput): Promise<GeneratedExplanation> {
  const provider = input.providerPreference || process.env.LLM_PROVIDER || 'gemini';

  // 1. If Groq requested and key present
  if (provider === 'groq' && process.env.GROQ_API_KEY) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content:
                'You are a senior retail fraud operations decision engine analyst for ReturnIQ (GenOS Team). Generate a short, specific, 2-sentence plain-language case note for a warehouse ops analyst that can be acted on in 10 seconds. Format: Flagged because [top 2-3 SHAP-contributing features in plain English], similar to known [abuse_type] patterns. Do not dump probabilities.',
            },
            {
              role: 'user',
              content: JSON.stringify({
                action: input.decision.recommendedAction,
                predictedAbuseType: input.prediction.predictedClass,
                confidence: input.prediction.confidence,
                orderValue: input.caseData.orderValue,
                itemCategory: input.caseData.itemCategory,
                topShapFeatures: input.prediction.shapFeatures.map(f => `${f.label} (value: ${f.value})`),
                expectedCosts: input.decision.actionCosts,
              }),
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) {
          const fallback = generateHeuristicExplanation(input);
          return {
            ...fallback,
            summary: text,
            provider: 'groq',
          };
        }
      }
    } catch (err) {
      console.warn('Groq explanation failed, falling back to Gemini/Heuristic', err);
    }
  }

  // 2. Gemini implementation using @google/genai
  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const prompt = `You are the lead retail fraud operations decision engine for ReturnIQ, developed by GenOS Team for DataNova 2026.
Generate a concise, highly specific retail ops case note for a return inspection analyst that can be read and acted upon in 10 seconds.

Return Case Details:
- Order Value: $${input.caseData.orderValue} (${input.caseData.itemCategory})
- Predicted Risk: ${input.prediction.predictedClass} (${input.prediction.confidence}% confidence)
- Recommended Action: ${input.decision.recommendedAction} (Min Expected Cost: $${input.decision.minCost})
- Top SHAP Risk Drivers:
${input.prediction.shapFeatures.map(f => `  * ${f.label} (Value: ${f.value}, Impact: ${f.direction})`).join('\n')}

MANDATORY FORMAT:
Provide exactly 2 short sentences:
Sentence 1: "${input.decision.recommendedAction === 'Approve-Instantly' ? 'Approved instantly because' : 'Flagged because'} [mention top 2-3 specific features], matching known [abuse_type or legitimate] patterns."
Sentence 2: Clear actionable instructions for warehouse intake (e.g. tag inspection, weight verification, or automated refund release).`;

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000));
      const geminiPromise = gemini.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are ReturnIQ Ops Explainer by GenOS Team. Always adhere strictly to concise, 10-second retail ops case note prose. No markdown bullets.',
        },
      });

      const response = await Promise.race([geminiPromise, timeoutPromise]);

      if (response && 'text' in response) {
        const noteText = response.text?.trim();
        if (noteText) {
          const heuristic = generateHeuristicExplanation(input);
          return {
            ...heuristic,
            summary: noteText,
            provider: 'gemini',
          };
        }
      }
    } catch (geminiErr) {
      console.warn('Gemini explanation call failed, using heuristic:', geminiErr);
    }
  }

  // 3. Robust heuristic fallback
  return generateHeuristicExplanation(input);
}
