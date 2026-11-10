/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Fullstack Server (Express + Vite Middlewares)
 * DataNova 2026 Submission — GenOS Team
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ReturnCase, CostMatrix } from './src/types';
import { DEFAULT_COST_MATRIX, computeOptimalDecision } from './src/lib/decisionEngine';
import { predictReturnAbuse } from './src/lib/modelInference';
import { generateCaseExplanation } from './src/server/explanationService';
import { BACKTEST_RESULTS } from './src/data/backtestResults';
import { FAIRNESS_REPORT } from './src/data/fairnessResults';
import { generateSyntheticTestSet, runBacktest } from './src/lib/backtestCore';
import { queryFraudData } from './src/server/dataQueryEngine';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API Routes

// 1. Health check & provider detection
app.get('/api/health', (req, res) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  const hasGroq = Boolean(process.env.GROQ_API_KEY);
  res.json({
    status: 'ok',
    product: 'ReturnIQ',
    team: 'GenOS Team',
    llmProviders: {
      gemini: hasGemini,
      groq: hasGroq,
      activeDefault: process.env.LLM_PROVIDER || (hasGemini ? 'gemini' : hasGroq ? 'groq' : 'heuristic'),
    },
    syntheticDatasetDisclaimer:
      "Built on a labeled-synthetic dataset. Class balance is cross-checked against publicly reported retail return-fraud/abuse industry figures (e.g. NRF's annual return-fraud loss reporting) for plausibility — it is not validated against real transactions.",
  });
});

// 2. Score a single return case & generate decision + ops case note
app.post('/api/score', async (req, res) => {
  try {
    const caseData: ReturnCase = req.body.caseData;
    const costMatrix: CostMatrix = req.body.costMatrix || DEFAULT_COST_MATRIX;
    const providerPreference = req.body.providerPreference;

    if (!caseData) {
      return res.status(400).json({ error: 'Missing caseData payload' });
    }

    const prediction = predictReturnAbuse(caseData);
    const decision = computeOptimalDecision(prediction.probabilities, costMatrix, caseData.orderValue);
    const explanation = await generateCaseExplanation({
      caseData,
      prediction,
      decision,
      providerPreference,
    });

    res.json({
      caseData,
      prediction,
      decision,
      explanation,
    });
  } catch (error: any) {
    console.error('Error in /api/score:', error);
    res.status(500).json({ error: error.message || 'Scoring engine error' });
  }
});

// 3. Fast pure decision recalculation (for high-frequency slider dragging)
app.post('/api/decision', (req, res) => {
  try {
    const { probabilities, costMatrix, orderValue } = req.body;
    if (!probabilities) {
      return res.status(400).json({ error: 'Missing probabilities' });
    }
    const decision = computeOptimalDecision(probabilities, costMatrix || DEFAULT_COST_MATRIX, orderValue);
    res.json(decision);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Case note explanation generation (Gemini / Groq adapter)
app.post('/api/explain', async (req, res) => {
  try {
    const { caseData, prediction, decision, providerPreference } = req.body;
    const explanation = await generateCaseExplanation({
      caseData,
      prediction,
      decision,
      providerPreference,
    });
    res.json(explanation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Backtest results (precomputed or dynamic re-run)
app.get('/api/backtest', (req, res) => {
  const cFP = req.query.cost_false_positive ? parseFloat(req.query.cost_false_positive as string) : DEFAULT_COST_MATRIX.cost_false_positive;
  const cFN = req.query.cost_false_negative ? parseFloat(req.query.cost_false_negative as string) : DEFAULT_COST_MATRIX.cost_false_negative;
  const cMR = req.query.cost_manual_review ? parseFloat(req.query.cost_manual_review as string) : DEFAULT_COST_MATRIX.cost_manual_review;

  const isDefault =
    cFP === DEFAULT_COST_MATRIX.cost_false_positive &&
    cFN === DEFAULT_COST_MATRIX.cost_false_negative &&
    cMR === DEFAULT_COST_MATRIX.cost_manual_review;

  if (isDefault) {
    return res.json(BACKTEST_RESULTS);
  }

  // Dynamic recalculation on custom cost matrix
  try {
    const testCases = generateSyntheticTestSet(3000); // 3,000 cases for instant responsive dynamic backtest
    const customMatrix: CostMatrix = {
      cost_false_positive: cFP,
      cost_false_negative: cFN,
      cost_manual_review: cMR,
    };
    const dynamicResults = runBacktest(testCases, customMatrix);
    res.json(dynamicResults);
  } catch (err: any) {
    res.json(BACKTEST_RESULTS);
  }
});

// 6. Demographic fairness breakdown
app.get('/api/fairness', (req, res) => {
  res.json(FAIRNESS_REPORT);
});

// 7. Natural language query on 12k held-out test dataframe (Zero-Hallucination)
app.post('/api/ask', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid query in request body' });
    }
    const response = await queryFraudData(query);
    res.json(response);
  } catch (error: any) {
    console.error('Error in /api/ask:', error);
    res.status(500).json({
      query: req.body?.query || '',
      canAnswer: false,
      explanation: "I can't answer that from the available data. (Internal error occurred processing query)",
    });
  }
});

// Vite middleware integration for full-stack dev and static serving in prod
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReturnIQ engine running on http://0.0.0.0:${PORT} (${isDev ? 'Development Vite' : 'Production'})`);
  });
}

startServer();
