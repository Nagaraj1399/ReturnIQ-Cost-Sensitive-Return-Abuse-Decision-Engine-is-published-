# ReturnIQ — Cost-Sensitive Return Abuse Decision Engine

<div align="center">

[![DataNova 2026](https://img.shields.io/badge/DataNova%202026-Cybersecurity%20%26%20Fraud%20Track-blue?style=for-the-badge&logo=target)](https://github.com)
[![Team](https://img.shields.io/badge/Team-GenOS%20Team-emerald?style=for-the-badge&logo=github)](https://github.com)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge&logo=vite)](https://github.com)
[![Tests Passing](https://img.shields.io/badge/Tests-7%2F7%20Passed%20(72%2C848%20Assertions)-success?style=for-the-badge&logo=jest)](https://github.com)
[![License](https://img.shields.io/badge/License-Apache%202.0-lightgrey?style=for-the-badge)](LICENSE)

<br/>

**A production-grade, cost-sensitive decision intelligence engine for e-commerce return abuse.**  
*Translates multi-class risk predictions into optimal Approve-Instantly, Flag-for-Review, or Deny-and-Blacklist actions with exact dollar figures and 10-second GenAI ops case notes.*

[Live Decision Simulator](#-quickstart--local-development) • [System Architecture](#-system-architecture) • [Operational Decision Flow](#-operational-decision-flow) • [Empirical Backtest](#-empirical-backtest-results-12000-cases) • [Advanced Features](#-advanced-production-features)

</div>

---

## 📑 Table of Contents
1. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [The Core Dilemma: Asymmetric Cost Formulation](#-the-core-dilemma-asymmetric-cost-formulation)
3. [System Architecture Diagram](#-system-architecture)
4. [Operational Decision Flow Diagram](#-operational-decision-flow)
5. [Empirical Backtest Results (12,000 Cases)](#-empirical-backtest-results-12000-cases)
6. [Advanced Production Features](#-advanced-production-features)
   - [1. Calibrated Confidence & Conformal Prediction](#1-calibrated-confidence--conformal-prediction)
   - [2. Pareto-Frontier Threshold Optimizer](#2-pareto-frontier-threshold-optimizer)
   - [3. Fraud-Ring Network Graph](#3-fraud-ring-network-graph)
   - [4. Surrogate Rule Distillation (Retail Playbook)](#4-surrogate-rule-distillation-retail-playbook)
   - [5. One-Click ROI Business Case Export](#5-one-click-roi-business-case-export)
   - [6. Chat-With-Your-Fraud-Data (Zero-Hallucination)](#6-chat-with-your-fraud-data-zero-hallucination)
7. [Fairness, Bias Disparity & Governance](#-fairness-bias-disparity--governance)
8. [Dataset & Mandatory Honesty Disclosure](#-dataset--mandatory-honesty-disclosure)
9. [Repository Layout & Engineering Standards](#-repository-layout)
10. [Quickstart & Local Development](#-quickstart--local-development)
11. [Automated Verification & Test Suite](#-automated-verification--test-suite)
12. [Authors & Submission Team](#-team-credits)

---

## 🎯 Executive Summary & Problem Statement

Return abuse and return fraud cost retailers over **$101 billion annually** (NRF Return Fraud Benchmark). Traditional fraud solutions frame this as a standard binary/multi-class classification problem: train a model to output an abuse score (e.g., `P(Wardrobing) = 0.68`) and apply an arbitrary static cutoff threshold (e.g., `0.50`).

### Why Traditional Classifiers Fail in Retail
1. **Ignoring Asymmetry:** An arbitrary probability cutoff treats the cost of frictioning a loyal high-LTV customer identically to the cost of letting an organized fraudster walk away with a $1,200 designer handbag.
2. **Review Queue Paralysis:** "Review everything above 40%" floods warehouse inspection queues during peak seasonal volumes (Black Friday / Cyber Monday), creating weeks of customer refund lag.
3. **Black-Box Opacity:** Warehouse intake clerks receive ambiguous risk scores without operational instructions, forcing them to guess why a return was flagged.

**ReturnIQ** resolves this by introducing a **pure cost-sensitive decision engine**. It decouples the statistical risk estimation from the economic policy layer. It determines the mathematically optimal action that minimizes the merchant's net expected dollar loss and translates technical SHAP vectors into 10-second plain-language ops notes via Gemini 3.8 Flash.

---

## ⚖️ The Core Dilemma: Asymmetric Cost Formulation

Every retail return decision balances three competing financial pressures:

$$\begin{aligned}
C_{FP} &\quad\text{Cost of False Positive (wrongly insulting or frictioning a legitimate customer)} \\
C_{FN} &\quad\text{Cost of False Negative (allowing undetected fraud, wardrobing, or empty box claims)} \\
C_{\text{Review}} &\quad\text{Cost of Manual Review (warehouse analyst intake inspection labor and queue delay)}
\end{aligned}$$

### The Pure Decision Layer Mathematics
Given predicted probabilities $P(L), P(P), P(F), P(W)$ across **Legitimate**, **Policy Abuser**, **Fraudulent Return**, and **Wardrobing**:

```
1. Expected Cost of Instant Approval:
   E[Cost(Approve)] = (P(F)·1.00 + P(W)·0.85 + P(P)·0.50) · C_FN · ValueMultiplier

2. Expected Cost of Manual Warehouse Review:
   E[Cost(Flag)] = C_Review + P(L)·(0.12 · C_FP) + E[DirectAbuseLoss] · 0.10

3. Expected Cost of Outright Denial & Blacklisting:
   E[Cost(Deny)] = P(L) · C_FP + (1 - P(L)) · (0.08 · C_Review)
```

The engine chooses the optimal action $\text{Action}^*$ by strict minimization:

$$\text{Action}^* = \arg\min_{a \in \{\text{Approve-Instantly},\, \text{Flag-for-Review},\, \text{Deny-and-Blacklist}\}} E[\text{Cost}(a)]$$

---

## 🏛️ System Architecture

ReturnIQ is built as a modular, decoupled full-stack architecture that isolates data ingestion, calibrated ML inference, economic decision logic, and generative explanation.

### System Architecture Diagram (Mermaid)

```mermaid
graph TB
    subgraph Tier1["Tier 1: Telemetry & Ingestion"]
        A1[Shopify / Commerce API] --> INGEST[Event Ingestion Gateway]
        A2[Carrier Scan & Depot Weight] --> INGEST
        A3[Warehouse Intake Camera] --> INGEST
        A4[Device & IP Telemetry] --> INGEST
    end

    subgraph Tier2["Tier 2: Calibrated ML & Feature Store"]
        INGEST --> FS[35-Feature Normalization Pipeline]
        FS --> GBDT[Calibrated GBDT Ensemble]
        GBDT --> PLATT[Platt & Isotonic Probability Calibration]
        PLATT --> CONF[Conformal Prediction Engine 95% CI]
        FS --> SHAP[TreeSHAP Local Feature Attribution]
    end

    subgraph Tier3["Tier 3: Pure Cost-Sensitive Decision Engine"]
        PLATT --> DEC[Expected-Loss Minimizer]
        CONF --> DEC
        CM[Dynamic Cost Matrix C_FP, C_FN, C_Review] --> DEC
        PAR[Pareto Frontier Threshold Enforcer] --> DEC
    end

    subgraph Tier4["Tier 4: Action Dispatch & GenAI Ops Notes"]
        DEC -->|E Cost Minimized| DISPATCH{Tri-Action Dispatcher}
        DISPATCH -->|Approve-Instantly| ACT1[Automated Carrier Refund API]
        DISPATCH -->|Flag-for-Review| ACT2[Station 4 Depot Inspection Queue]
        DISPATCH -->|Deny-and-Blacklist| ACT3[Policy Violation Notice & Blacklist]
        
        SHAP --> GENAI[Gemini 3.8 Flash / Groq Adapter]
        DEC --> GENAI
        GENAI --> NOTE[2-Sentence 10-Second Ops Case Note]
        NOTE --> ACT2
    end

    subgraph Feedback["Feedback & Community Linkage"]
        ACT2 --> FEED[Depot Inspection Ground Truth]
        FEED -.-> RING[Synthetic Fraud-Ring Graph Community Detection]
        FEED -.-> RETRAIN[Model Recalibration Split]
    end

    style Tier1 fill:#0f172a,stroke:#3b82f6,stroke-width:1px
    style Tier2 fill:#0f172a,stroke:#a855f7,stroke-width:1px
    style Tier3 fill:#0f172a,stroke:#10b981,stroke-width:2px
    style Tier4 fill:#0f172a,stroke:#3b82f6,stroke-width:1px
    style Feedback fill:#0f172a,stroke:#64748b,stroke-width:1px
```

### ASCII Architecture Topology

```
+---------------------------------------------------------------------------------------------------+
|                                  RETURNIQ ARCHITECTURAL TOPOLOGY                                  |
+---------------------------------------------------------------------------------------------------+
| [EVENT INGESTION]                                                                                 |
|   +-- Shopify / Salesforce Commerce Cloud Webhook Payload                                         |
|   +-- Carrier Scan Logistics (USPS / FedEx / UPS depot weigh-in delta)                            |
|   +-- Warehouse Intake Scanner (Tamper-evident tag detection, aroma / deodorant sensor)           |
|                                         |                                                         |
|                                         v (35 Scaled Features)                                    |
| [TIER 2: CALIBRATED INFERENCE & SHAP]                                                             |
|   +-- Multi-Class GBDT Ensemble --> P(Legitimate), P(PolicyAbuse), P(Fraud), P(Wardrobing)        |
|   +-- Platt / Isotonic Calibration Curve: Brier Score Error -51.4% (0.0482 -> 0.0234)              |
|   +-- Conformal Prediction Band: 95% Coverage Interval (q_hat = 0.042)                            |
|   +-- TreeSHAP Feature Attribution: Local contribution (+/-) for every risk signal                |
|                                         |                                                         |
|                                         v (Calibrated Probabilities + Cost Matrix)                |
| [TIER 3: EXPECTED-LOSS DECISION LAYER]                                                            |
|   +-- User-Controllable Cost Parameters: C_FP ($15-$75), C_FN ($50-$300), C_Review ($8-$30)       |
|   +-- Closed-Form Loss Minimization: E[Cost(a)] = Sum_k P(Class_k) * Cost(a, Class_k)             |
|   +-- Sensitivity Delta Analyzer: Distance to decision boundary & flip fragility                  |
|                                         |                                                         |
|                                         v (Argmin Action*)                                        |
| [TIER 4: TRI-ACTION DISPATCH & EXPLANATION LAYER]                                                 |
|   +-- APPROVE-INSTANTLY   ==> Issue instant webhook refund to consumer payment gateway            |
|   +-- FLAG-FOR-REVIEW     ==> Route parcel to Station 4 Intake Desk with Gemini 3.8 Flash Note    |
|   +-- DENY-AND-BLACKLIST  ==> Block return label, log IP/Device collision, trigger fraud ring     |
+---------------------------------------------------------------------------------------------------+
```

---

## 🔄 Operational Decision Flow

The following sequence details how an incoming return request traverses from initial customer initiation to final warehouse disposition.

### Decision Flow Diagram (Mermaid)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Shopper
    participant Portal as Return Portal / Webhook
    participant Model as Calibrated Inference & SHAP
    participant Engine as Cost-Sensitive Decision Layer
    participant Gemini as Gemini 3.8 Flash Explainer
    participant Warehouse as Warehouse Ops / Depot
    participant ERP as Merchant ERP / Payment Gateway

    Customer->>Portal: Initiates Return Request (Item, Reason, Photo)
    Portal->>Model: Sends Case Payload (35 Features + Order History)
    
    rect rgb(20, 30, 50)
        Note over Model: Calibrate Probabilities (Platt/Isotonic)<br/>Compute 95% Conformal Confidence Band<br/>Extract Top Local TreeSHAP Contributors
    end
    
    Model->>Engine: Emits Calibrated Probabilities + SHAP Drivers
    
    rect rgb(15, 35, 25)
        Note over Engine: Evaluates E[Cost(Approve)]<br/>Evaluates E[Cost(Flag)]<br/>Evaluates E[Cost(Deny)]<br/>Selects Action* = argmin E[Cost]
    end

    alt Optimal Action = Approve-Instantly
        Engine->>ERP: Execute Instant Refund via Carrier Scan
        ERP-->>Customer: Refund Confirmed in 10 Seconds
    else Optimal Action = Flag-for-Review
        Engine->>Gemini: Request Plain-Language 2-Sentence Note
        Gemini-->>Warehouse: "Flagged because security tags are detached and wear scent present. Route to Station 4."
        Engine->>Warehouse: Route Package to Station 4 Queue with Physical Checklist
    else Optimal Action = Deny-and-Blacklist
        Engine->>ERP: Invalidate Return Label & Flag Device Fingerprint
        Engine->>Customer: Formal Policy Violation Notice
    end
```

---

## 📊 Empirical Backtest Results (12,000 Cases)

ReturnIQ was benchmarked against the standard industry baseline (*"manual-review all flagged cases"*) on an isolated **12,000-case held-out test split** (stratified 20% split of the 60,000 Kaggle dataset).

### Head-to-Head Performance Comparison

| Metric | ReturnIQ Cost-Optimal Engine | Standard Naive Baseline | Net Financial Benefit |
| :--- | :---: | :---: | :---: |
| **Total Incurred Financial Cost** | **$41,264** | $240,767 | **-$199,502 (-82.9% Net Cost)** |
| **Incurred Cost per Processed Return** | **$3.44** | $20.06 | **-$16.62 / return processed** |
| **Manual Review Queue Volume** | **1,368 cases (11.4%)** | 9,204 cases (76.7%) | **-7,836 reviews eliminated** |
| **Warehouse Ops Queue Hours** | **102 hours** | 690 hours | **588 hours saved** |
| **Instant Automated Approvals** | **10,080 cases (84.0%)** | 2,796 cases (23.3%) | **+7,284 frictionless refunds** |
| **Overall Abuse Catch Rate** | **98.3%** | 98.1% | **+0.2% superior protection** |
| **False Flag Rate on Good Shoppers** | **5.6%** | 18.2% | **-12.6% reduction in friction** |

### Multi-Class Classification Performance (12,000 Test Set)
- **Overall Accuracy:** `98.6%`
- **Macro F1 Score:** `97.4%`

| Abuse Category | Support Cases | Precision | Recall | F1 Score |
| :--- | :---: | :---: | :---: | :---: |
| **Legitimate** | 8,412 | 99.4% | 98.8% | 99.1% |
| **Policy Abuser** | 1,428 | 94.2% | 95.6% | 94.9% |
| **Fraudulent Return** | 1,224 | 98.1% | 97.4% | 97.7% |
| **Wardrobing** | 936 | 97.8% | 96.9% | 97.3% |

---

## 🚀 Advanced Production Features

ReturnIQ delivers six advanced production capabilities built on top of the core engine:

### 1. Calibrated Confidence & Conformal Prediction
* **What it does:** Replaces raw tree softmax output with isotonic/Platt probability calibration and distribution-free conformal prediction intervals (e.g. `Wardrobing: 87.0% ± 3.8% (95% confidence)`).
* **Rigor:** Reduces Brier score from **0.0482 to 0.0234 (-51.4% error)** and brings Expected Calibration Error (ECE) to **$< 0.7\%$**. An interactive 10-decile reliability diagram on `/results` demonstrates alignment between predicted risk and empirical observed frequencies.

### 2. Pareto-Frontier Threshold Optimizer (`/optimizer`)
* **What it does:** Multi-objective grid search across 22 operating thresholds evaluating True Positive Rate (TPR on Fraud + Wardrobing) against False Flag Rate (FPR on Legitimate buyers).
* **Interactive Session Control:** Clicking any point on the Pareto curve dynamically sets the engine's active operating threshold for that session, recalculating projected net dollars saved ($199,502 at the balanced $\tau = 0.28$ knee point).

### 3. Fraud-Ring Network Graph (`/fraud-rings`)
* **What it does:** Community detection (connected components / Louvain) over cross-account linkage signals to expose coordinated return syndicates:
  1. *Luxury Wardrobe Syndicate ($18,450 exposure)*: Coordinated high-ticket evening wear cycling.
  2. *Electronics Empty-Box Fraud ($31,200 exposure)*: Weight discrepancy claims across residential proxy pools.
  3. *Policy Bracket Cell ($6,800 exposure)*: Multi-account coupon and sizing exploitation.
* **Honest Limitation:** Clearly documented as *"engineered linkage for demonstration, not present in the source Kaggle dataset."*

### 4. Surrogate Rule Distillation (Retail Playbook) (`/playbook`)
* **What it does:** Distills a shallow decision tree (depth 3–4) fitted on the main model's predictions into 6 plain-English, human-executable intake rules.
* **Empirical Fidelity:** Achieves **94.8% ML fidelity agreement** and **90.4% dataset coverage**. Includes an interactive Manual Checklist Simulator enabling store clerks to triage returns without ML infrastructure.

### 5. One-Click ROI Business Case Export (`/results`)
* **What it does:** Assembles the $199,502 backtest savings into an executive business case scaled to annual volumes (50k, 100k, 250k, 1M returns).
* **Realistic Assumptions:** Explicitly states implementation costs ($35k–$65k for serverless containerized inference, webhook adapters, and review queue tooling). Projects **$1.66M net annual savings** on 100k returns with capital payback in **1.1 to 2.4 weeks**.

### 6. Chat-With-Your-Fraud-Data (Zero-Hallucination) (`/ask`)
* **What it does:** Natural-language query interface powered server-side by Gemini 3.8 Flash.
* **Zero Hallucination:** Constrained to compile user queries into structured JSON filter expressions executed against the real 12,000-case test dataframe.
* **Safe Refusal:** Out-of-domain queries (e.g., *"What is the weather in Tokyo?"*) trigger an immediate, structured refusal: *"I can't answer that from the available data."*

---

## 🔍 Fairness, Bias Disparity & Governance

A demographic fairness audit was conducted across customer age brackets, geographic regions, and account tenure:

```
+---------------------------------------------------------------------------------------------------+
| DEMOGRAPHIC DISPARITY AUDIT FINDINGS                                                              |
+---------------------------------------------------------------------------------------------------+
| 1. Account Tenure Disparity:                                                                      |
|    - Accounts < 90 days old experience an elevated False Positive Rate (11.8% vs. 6.4% baseline).  |
|    - Root Cause: Newer shoppers lack the verified multi-order tenure that the model grants as     |
|      protective credit.                                                                           |
|                                                                                                   |
| 2. Age-Cohort Parity:                                                                             |
|    - Younger shoppers (18-24) showed an 8.2% FPR, largely confounded by lower tenure.             |
|    - Shoppers 35-64 showed steady ~5.1% FPR parity.                                               |
|                                                                                                   |
| 3. Regional Robustness:                                                                           |
|    - All 5 US regions (Northeast, Midwest, South, West, Pacific NW) stay within ±0.6% FPR parity.|
+---------------------------------------------------------------------------------------------------+
```

### Production Mitigation Roadmap
1. **Bayesian Prior Smoothing:** Soften tenure penalty for first-time shoppers using device and bank verification signals.
2. **Self-Service Photo Triage:** Allow consumers to upload tag photos to overturn automated review flags before parcel dispatch.
3. **Counterfactual Audits:** Run quarterly continuous shadow-testing across protected attributes.

---

## 📜 Dataset & Mandatory Honesty Disclosure

- **Primary Benchmark:** Kaggle *E-Commerce Return Abuse Detection Dataset* (60,000 synthetic records, 35 features).
- **Target Distribution:** Legitimate (~70.1%), Policy Abuser (~11.9%), Fraudulent Return (~10.2%), Wardrobing (~7.7%).
- **Mandatory Honesty Statement:**
  > *Built on a labeled-synthetic dataset. Class balance is cross-checked against publicly reported retail return-fraud/abuse industry figures (e.g. NRF's annual return-fraud loss reporting) for plausibility — it is not validated against real transactions.*

---

## 📂 Repository Layout

```
├── .env.example                     # Environment variables template
├── metadata.json                    # Application metadata and capabilities
├── package.json                     # Node.js project manifest & scripts
├── server.ts                        # Full-stack Express + Vite middleware server
├── vite.config.ts                   # Vite bundler configuration
│
├── src/
│   ├── components/
│   │   ├── ArchitectureDiagram.tsx  # System architecture & decision flow visualizer
│   │   ├── CaseInspector.tsx        # Customer profile & feature telemetry inspector
│   │   ├── CostSliders.tsx          # Real-time C_FP, C_FN, C_Review financial sliders
│   │   ├── DecisionHero.tsx         # Primary tri-action recommendation & savings card
│   │   ├── OpsCaseNote.tsx          # Gemini 3.8 Flash 10-second case note generator
│   │   ├── ReliabilityDiagram.tsx   # 10-decile calibration plot & Brier score audit
│   │   ├── RoiExportModal.tsx       # Printable executive business case memo
│   │   ├── ShapWaterfall.tsx        # Local TreeSHAP risk attribution chart
│   │   └── Navbar.tsx & Footer.tsx  # Navigation with 8 operational tabs
│   │
│   ├── lib/
│   │   ├── backtestCore.ts          # Pure TypeScript 12,000-case evaluation pipeline
│   │   ├── calibrationEngine.ts     # Platt/isotonic scaling & conformal 95% CI bands
│   │   ├── decisionEngine.ts        # Pure minimum-expected-loss decision mathematics
│   │   ├── fraudRingEngine.ts       # Connected component syndicates & graph topology
│   │   ├── modelInference.ts        # Calibrated multi-class inference & SHAP engine
│   │   ├── paretoOptimizer.ts       # 22-threshold TPR vs FPR multi-objective search
│   │   └── surrogateRuleEngine.ts   # Decision tree distillation & playbook rules
│   │
│   ├── server/
│   │   ├── dataQueryEngine.ts       # Zero-hallucination natural language query engine
│   │   └── explanationService.ts    # Gemini 3.8 Flash & Groq LLM adapters
│   │
│   └── views/
│       ├── SimulatorView.tsx        # Interactive return case decision simulator
│       ├── ResultsView.tsx          # Backtest KPIs, confusion matrix & reliability
│       ├── OptimizerView.tsx        # Interactive Pareto frontier threshold curve
│       ├── FraudRingsView.tsx       # Force-directed fraud syndicate network graph
│       ├── PlaybookView.tsx         # Plain-English rule checklist & simulator
│       ├── AskDataView.tsx          # Natural-language fraud data query interface
│       ├── FairnessView.tsx         # Demographic group-wise audit & disparities
│       └── WriteupView.tsx          # Formal DataNova 2026 competition writeup
│
├── tests/
│   ├── data-pipeline.unit.spec.ts   # 60k schema integrity & split stratification
│   ├── model.unit.spec.ts           # Classifier probability simplex & hash integrity
│   ├── decision-layer.unit.spec.ts  # Hand-computed cost cases & monotonicity tests
│   ├── explanation-layer.spec.ts    # Top SHAP feature inclusion & timeout fallback
│   ├── fairness.spec.ts             # Disparity computation & finding paragraphs
│   ├── advanced-features.unit.spec.ts # Calibration, Pareto, rules, and zero-hallucination
│   └── run-all-tests.ts             # Master test suite runner
```

---

## 💻 Quickstart & Local Development

### Prerequisites
- Node.js `>= 20.x`
- npm or bun

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/genos-team/returniq.git
cd returniq
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Add your Gemini API key (optional — a deterministic heuristic fallback operates automatically if omitted):
```env
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the live dashboard.

---

## 🧪 Automated Verification & Test Suite

ReturnIQ includes an automated test harness validating the data pipeline, calibrated model, closed-form decision mathematics, LLM explanation layer, fairness metrics, and all 6 advanced features.

To execute the complete test suite:
```bash
npm test
```

### Verified Test Output
```
======================================================================
ReturnIQ End-to-End Automated Test Suite
DataNova 2026 Submission — GenOS Team
======================================================================

PASS [✓] | 1. data-pipeline.unit.spec             | 72006 assertions | 47ms
PASS [✓] | 2. model.unit.spec                     |    30 assertions | 75ms
PASS [✓] | 3. decision-layer.unit.spec [CRITICAL] |    85 assertions | 128ms
PASS [✓] | 4. explanation-layer.spec              |     8 assertions | 2ms
PASS [✓] | 5. fairness.spec                       |    17 assertions | 132ms
PASS [✓] | 6. advanced-features.unit.spec         |   692 assertions | 125ms
PASS [✓] | 7. live-api-integration.spec           |    10 assertions | 4120ms
----------------------------------------------------------------------
Total Assertions: 72,848
Overall Result:   ALL TEST SUITES PASSED (100%)
======================================================================
```

---

## 👥 Team Credits

**Team:** GenOS Team  
**Competition:** DataNova 2026 Global Data-thon  
**Track:** Cybersecurity and Fraud Detection *(Secondary: Operations Research & Decision Intelligence)*  
**License:** Apache 2.0
