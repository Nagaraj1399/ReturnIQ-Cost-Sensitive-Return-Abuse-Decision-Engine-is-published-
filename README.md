# ReturnIQ: Cost-Sensitive Decision Engine for E-Commerce Return Abuse

**DataNova 2026 Global Data-thon**  
**Track:** Cybersecurity and Fraud Detection (Secondary: Operations Research & Decision Intelligence)  
**Team:** GenOS Team  

---

## 1. Problem Statement
Return abuse costs North American and global retailers over $101 billion annually. Traditional machine learning models output a static abuse probability score (e.g., 68% risk) and leave operations teams with an arbitrary cutoff threshold. 

However, every return involves an asymmetric economic tradeoff:
- **Cost of False Positive ($CFP):** Wrongly denying or flagging a loyal customer leads to customer churn, lost customer lifetime value (LTV), support escalations, and negative social sentiment.
- **Cost of False Negative ($CFN):** Missing real fraud, wardrobing, or policy abuse leads to direct merchandise write-offs, chargeback penalties, and unresellable inventory.
- **Cost of Manual Review ($CMR):** Routing suspicious packages to human warehouse inspection queues costs $15–$25 per return in labor and creates processing bottlenecks.

**ReturnIQ** is a cost-sensitive decision engine for e-commerce return abuse — not just a classifier. It translates multi-class risk predictions into an optimal **Approve-Instantly / Flag-for-Review / Deny-and-Blacklist** recommendation with an exact dollar value attached, and explains why in plain language.

---

## 2. Dataset & Mandatory Data Honesty Disclosure
- **Primary Dataset:** Kaggle "E-Commerce Return Abuse Detection Dataset" (60,000 synthetic rows, 35 features).
- **Target Distribution:**
  - Legitimate: 70.1%
  - Policy Abuser: 11.9%
  - Fraudulent Return: 10.2%
  - Wardrobing: 7.7%
- **Mandatory Honesty Statement:**
  > *Built on a labeled-synthetic dataset. Class balance is cross-checked against publicly reported retail return-fraud/abuse industry figures (e.g. NRF's annual return-fraud loss reporting) for plausibility — it is not validated against real transactions.*

---

## 3. Model Choice & Rationale
We utilize a calibrated multi-class gradient-boosted decision tree ensemble with local SHAP (SHapley Additive exPlanations) feature attribution. 

Rather than chasing diminishing leaderboard AUC returns, we focused engineering effort on:
1. **Calibrated Class Probabilities:** Outputting true risk distributions across all 4 abuse types.
2. **Local SHAP Feature Attribution:** Decomposing every return into interpretable risk signals (e.g. detached security tags, cosmetic wear scent, weekend return velocity, carrier depot weight mismatch).
3. **The Pure Decision Layer:** Transforming probabilities and loss matrices into minimum expected loss decisions.

---

## 4. The Decision Layer Mathematics
The decision layer is a pure, testable function:
Given class probabilities $P(L), P(P), P(F), P(W)$ and editable cost parameters ($C_{FP}, C_{FN}, C_{MR}$):

1. **Approve-Instantly:**
   $$E[Cost(\text{Approve})] = (P(F) \cdot 1.0 + P(W) \cdot 0.85 + P(P) \cdot 0.50) \cdot C_{FN} \cdot \text{ValueMultiplier}$$
2. **Flag-for-Review:**
   $$E[Cost(\text{Flag})] = C_{MR} + P(L) \cdot (0.12 \cdot C_{FP}) + E[\text{DirectLoss}] \cdot 0.10$$
3. **Deny-and-Blacklist:**
   $$E[Cost(\text{Deny})] = P(L) \cdot C_{FP} + (1 - P(L)) \cdot (0.08 \cdot C_{MR})$$

The engine chooses the action that minimizes expected loss:
$$\text{Action}^* = \arg\min_{a \in \{\text{Approve}, \text{Flag}, \text{Deny}\}} E[Cost(a)]$$

Dragging the UI sliders visibly recalculates these expected costs and shifts the recommendation in real time.

---

## 5. Backtest Results (12,000 Held-Out Test Set)
Evaluating ReturnIQ against the standard industry baseline ("always manual-review flagged cases") on a 12,000-case held-out test split yielded:
- **Net Dollar Savings:** **$199,502** (82.9% net financial cost reduction)
- **Cost Incurred per Return:** **$3.44** vs. $20.06 naive baseline
- **Manual Review Hours Saved:** **588 hours** (102h vs. 690h in warehouse queue)
- **Abuse Catch Rate:** **98.3%** across all real abuse
- **False Flag Rate on Legitimate Shoppers:** **5.6%**
- **Model Accuracy:** 98.6% overall accuracy, 97.4% Macro F1

---

## 6. Fairness & Demographic Bias Findings
Group-wise error rates were audited across Customer Age Brackets, Geographic Regions, and Account Tenure:
- **Finding:** Accounts under 90 days old and younger shoppers (18-24) showed an elevated False Positive Rate (11.8% vs. 6.4% baseline). This occurs because new shoppers lack the multi-order tenure history that the model uses as protective credit.
- **Regional Consistency:** Across all 5 US geographic regions, False Positive Rates stayed within a tight ±0.6% parity band.

---

## 7. Advanced Production Features (DataNova Differentiators)

### Feature 1: Calibrated Confidence & Conformal Prediction
- **What it does:** Replaces raw uncalibrated tree softmax outputs with isotonic/Platt probability calibration and distribution-free conformal prediction intervals (e.g. `Wardrobing: 87% ± 4% (95% confidence)`).
- **Rigor Claim:** Tested on the 12,000-case held-out test split, probability calibration dropped the Brier score from **0.0482 to 0.0234 (-51.4% error)** and reduced Expected Calibration Error (ECE) to **< 0.7%**. A reliability diagram on `/results` plots predicted probabilities against empirical observed frequencies across 10 decile bins.
- **Why it matters:** Raw neural network and tree probabilities are notorious for overconfidence. Risk decisions involving hundreds of dollars require true statistical calibration.

### Feature 2: Pareto-Frontier Threshold Optimizer (`/optimizer`)
- **What it does:** Grid-searches 22 operating thresholds to quantify the tradeoff between True Positive Catch Rate (TPR on Fraud + Wardrobing) and False Flag Rate (FPR on Legitimate buyers). Renders an interactive Pareto frontier curve.
- **Interactive Session Control:** Clicking any Pareto-optimal point dynamically sets the engine's active operating threshold for that session, immediately projecting net dollars saved and intake distribution across the 12k cases.
- **Sweet Spot:** At threshold $\tau = 0.28$, the engine catches **98.2% of abuse** while holding false flags on good shoppers to only **5.4%**.

### Feature 3: Fraud-Ring Network Graph (`/fraud-rings`)
- **What it does:** Runs community detection (connected components / clustering) over synthetic cross-account linkages (shared shipping addresses, device/IP collisions, and virtual card tokens) to uncover coordinated abuse rings.
- **Visual Topology:** Renders an interactive force-directed graph grouping 3 distinct syndicates:
  1. *Luxury Wardrobe Syndicate ($18,450 exposure):* High-end designer evening wear wardrobed around gala seasons.
  2. *Electronics Empty-Box Fraud ($31,200 exposure):* Coordinated "item not in box" claims across residential proxy clusters.
  3. *Policy Bracket Cell ($6,800 exposure):* Multi-size bracketing abusing free-return promotions.
- **Honest Limitation:** Clearly labeled in the UI as *"engineered linkage for demonstration, not present in the source Kaggle dataset."* Demonstrates ring-detection capability on link data a real production deployment would collect.

### Feature 4: Surrogate Rule Distillation (`/playbook`)
- **What it does:** Fits a shallow decision tree (depth 3-4) on the main model's own predictions (not raw labels) to extract 6 plain-English, human-executable intake rules with **94.8% ML fidelity agreement** and **90.4% dataset coverage**.
- **Practical Application:** A merchant without an in-house ML team or API infrastructure can print the checklist and execute manual triage at return intake desks tomorrow. Includes an interactive Manual Checklist Simulator.

### Feature 5: One-Click ROI Export (Executive Business Case)
- **What it does:** Adds an "Export Business Case" modal on `/results` assembling empirical backtest figures into an executive memo printable to PDF.
- **Realistic Assumptions:** Scales the 12k test set to merchant volumes (50k, 100k, 250k, 1M annual returns). Explicitly states implementation capital assumptions ($35k–$65k for containerized serverless inference, ERP webhooks, and review queue tooling).
- **Payback Period:** Projects **$1.66M net annual savings** on 100k returns, with capital payback achieved in **1.1 to 2.4 weeks**.

### Feature 6: Chat-With-Your-Fraud-Data (`/ask`)
- **What it does:** A natural language query interface against the 12,000-case held-out test dataframe powered server-side by Gemini / Groq.
- **Zero-Hallucination Guarantee:** The LLM is strictly constrained to compile the user query into structured JSON filter predicates (abuse type, order value, warehouse flags). These filters execute against real test dataframe records — the LLM never fabricates rows.
- **Deterministic Refusal:** If a user asks for unmeasured or out-of-domain information (e.g. "What is the weather in Tokyo?"), the engine safely falls back to *"I can't answer that from the available data."*

---

## 8. End-to-End Walkthrough Script (for DataNova Judges)

1. **Simulator Walkthrough (`/simulator`):**
   - Select case `Case #7481 (Elena Rostova - Wardrobing)`.
   - Observe calibrated confidence: `Wardrobing: 87% ± 4% (95% confidence)`.
   - Inspect SHAP waterfall: detached security tag (`+0.38`), perfume scent (`+0.28`), and 27-day return latency (`+0.18`).
   - Drag the *Cost of False Negative ($CFN)* slider from $80 to $240: watch the recommendation dynamically flip from *Flag-for-Review* to *Deny-and-Blacklist*.

2. **Pareto-Frontier Threshold Optimizer (`/optimizer`):**
   - Click the Pareto Frontier curve at the balanced knee point ($\tau = 0.28$).
   - Confirm that the operating threshold is set for the active session, projecting $199k in net savings with 98.2% fraud catch rate and only 5.4% false flag rate.

3. **Fraud-Ring Network Graph (`/fraud-rings`):**
   - Inspect the *Luxury Wardrobe Syndicate* cluster.
   - Click a node (e.g., `Elena Rostova - $1,420 Designer Evening Gown`) to view cross-account link reasons (shared drop address and virtual card pattern).
   - Review the synthetic linkage transparency disclaimer.

4. **Surrogate Rule Playbook (`/playbook`):**
   - Read Rule 1: `IF Tags Removed = TRUE AND Wear/Scent = TRUE THEN Deny-and-Blacklist (98.4% fidelity)`.
   - Test the interactive Manual Intake Checklist Simulator: toggle tags and wear scent to see the checklist trigger Rule 1.

5. **Executive ROI Business Case (`/results`):**
   - Navigate to `/results`, review the Decile Reliability Diagram and Brier Score reduction (0.0482 to 0.0234).
   - Click **"Export Business Case (ROI)"**.
   - Review the annual projection ($1.66M net savings on 100k returns, 1.1–2.4 week payback) and print preview.

6. **Natural-Language Fraud Query (`/ask`):**
   - Click the suggested chip: *"Show me wardrobing cases in Apparel with order value over $200"*.
   - Inspect the compiled structured filter predicates and real matching cases.
   - Test out-of-domain refusal: *"What is the weather in Tokyo?"* &rarr; observe safe refusal without hallucinated rows.

---

## 9. Runnable Pipelines & Verification
- **Full Test Suite:** `npm test` (Runs all 7 unit and e2e test suites covering data pipeline, model, decision layer, explanation layer, and fairness).
- **TypeScript Backtest:** `npx tsx scripts/generate_dataset_and_backtest.ts`
- **Full-Stack Dev Server:** `npm run dev`
