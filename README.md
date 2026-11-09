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

## 7. Known Limitations & Production Pilot Roadmap
In a real enterprise deployment:
1. **Real Transaction Calibration:** The engine must be trained on verified carrier return scans, warehouse inspection notes, and dispute outcomes.
2. **Tenure Normalization:** Introduce Bayesian prior smoothing for first-time shoppers to prevent unfair history penalties.
3. **Dual-Stage Intake:** Offer instant self-service photo upload (e.g. tag condition) before routing customers to manual review.
4. **90-Day A/B Pilot:** Deploy ReturnIQ in shadow mode against the retailer's existing policy and measure post-return retention and chargeback rates.

---

## 8. Runnable Scripts
Judges can re-run all pipelines directly:
- **TypeScript Backtest:** `npx tsx scripts/generate_dataset_and_backtest.ts`
- **Python Training & Backtest:** `python3 scripts/train_and_backtest.py`
