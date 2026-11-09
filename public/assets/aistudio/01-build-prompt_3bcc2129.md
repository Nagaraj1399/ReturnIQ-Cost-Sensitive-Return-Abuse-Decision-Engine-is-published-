# ReturnIQ — Build Prompt (Google Antigravity + Gemini/Groq)

Paste this into Google Antigravity as the mission brief.

```
ROLE
You are the lead engineer inside Google Antigravity, building a working
submission for DataNova 2026 Global Data-thon, track: Cybersecurity and Fraud
Detection (secondary resonance: Operations Research and Decision Intelligence).
Use Gemini (Gemini 3 Pro for reasoning/explanation generation) and/or the Groq
API (already available, fast inference, good for a live low-latency demo) for
the LLM explanation layer — implement an adapter so either can be swapped in
via env var. Team name in any generated copy: "GenOS Team" — never use a
personal name.

PRODUCT
Name: ReturnIQ
One-liner: A cost-sensitive decision engine for e-commerce return abuse — not
just a fraud classifier. It turns a return's predicted abuse-type and
confidence into an actual Approve-Instantly / Flag-for-Review / Deny-and-
Blacklist recommendation with a dollar value attached, and explains why in
plain language.

DATASET & HONESTY REQUIREMENT
- Primary dataset: Kaggle "E-Commerce Return Abuse Detection Dataset"
  (60,000 rows, 35 features, target `abuse_type`: Legitimate 70.1%,
  Policy Abuser 11.9%, Fraudulent Return 10.2%, Wardrobing 7.7%).
- This dataset is explicitly labeled synthetic by its own author. Every
  surface of this product (README, dashboard footer, submission writeup) must
  say so plainly: "Built on a labeled-synthetic dataset. Class balance is
  cross-checked against publicly reported retail return-fraud/abuse industry
  figures (e.g. NRF's annual return-fraud loss reporting) for plausibility —
  it is not validated against real transactions." Never let a screen imply
  this is live production data.
- Do not chase leaderboard AUC. Use LightGBM or XGBoost with sane defaults
  (reasonable max_depth, n_estimators, class-weighting or SMOTE for the
  imbalance) and move on — the differentiator is the decision layer, not
  model tuning.

ARCHITECTURE
Stack: Next.js (App Router) + TypeScript + Tailwind for the dashboard,
deployed to Vercel. Python (scikit-learn/LightGBM/XGBoost/SHAP) for the model
training pipeline, exposed to the Next.js app via a small FastAPI/Flask
inference service (or exported to ONNX/ran via a serverless function — pick
whichever is faster to stand up overnight).

Pipeline:
  [Kaggle CSV] -> EDA + feature engineering (time deltas order_date/return_date
  if present, category/behavioral features) -> train/val/test split ->
  multi-class model -> SHAP values per prediction
    -> DECISION LAYER (see below)
    -> EXPLANATION LAYER (LLM turns SHAP top-features + decision into a plain-
       English case note)
    -> dashboard surfaces below.

DECISION LAYER (build this as a pure, testable function — this is the core
differentiator, do not skip it for a plain classifier)
Inputs: predicted class probabilities for a return case, an editable cost
matrix with these parameters (expose as UI sliders, not hardcoded constants):
  - cost_false_positive: cost of wrongly flagging a legitimate return
    (customer churn + support cost estimate)
  - cost_false_negative: cost of missing real fraud/wardrobing (item value +
    chargeback risk)
  - cost_manual_review: cost of routing a case to human review (labor cost)
Logic: compute expected cost for each of the three actions (Approve-Instantly,
Flag-for-Review, Deny-and-Blacklist) given the model's class probabilities and
the current cost matrix, and recommend the minimum-expected-cost action.
Run this against the held-out test set and report, vs. a naive "always
manual-review flagged cases" baseline policy: total cost difference ($),
fraud-catch rate, false-flag rate on legitimate customers. This backtest
output is what goes on the results page — do not assert a dollar figure that
didn't come out of this computation.

EXPLANATION LAYER
For each flagged case (Flag-for-Review or Deny), generate a short, specific,
plain-language case note: "Flagged because [top 2-3 SHAP-contributing
features in plain English], similar to known [abuse_type] patterns." Must
read like something a retail ops analyst could act on in 10 seconds, not a
probability dump.

FAIRNESS CHECK (cheap, don't skip it — most competing teams won't bother)
Compute false-positive and false-negative rate broken out by whatever
demographic-adjacent fields exist in the dataset (age bracket, gender,
location/region if present). Put this on its own /fairness page as a simple
table/bar chart with a one-paragraph plain-language finding. If a disparity
shows up, say so honestly — don't hide it, name it as a known limitation.

SCREENS
1. /simulator — paste or generate a new return case, see it scored live:
   predicted abuse-type probabilities, the recommended action, the dollar
   rationale, and the plain-language case note. Cost-matrix sliders are on
   this page and changing them must visibly change the recommendation in
   real time for the same case — this is the single most important
   interactive moment in the demo, build and polish this first.
2. /results — the backtest: model performance (per-class precision/recall,
   confusion matrix), the decision-layer $ comparison vs. the naive baseline
   policy, and the synthetic-data honesty statement from above.
3. /fairness — the group-wise error-rate breakdown and its one-paragraph
   finding.

DELIVERABLES
- Working deployed dashboard (Vercel URL) + the training/backtest scripts in
  the repo (not just notebook cells — a judge should be able to re-run them).
- README covering: problem statement, dataset + honesty statement, model
  choice and why, the decision-layer math, backtest results, fairness
  findings, known limitations, and what a real pilot would need (real
  transaction data, a retailer partner, A/B test against current policy).
- A submission writeup matching DataNova's required sections: project
  overview, problem statement, solution & methodology, technology stack,
  implementation & demonstration, results & validation, potential impact,
  team contributions.
- A demo script: what to click, in order, for a 3-minute walkthrough
  (load a flagged case -> explain the recommendation -> drag a cost slider,
  watch it flip -> show the backtest $ number -> show the fairness page).

PROCESS
Build /simulator and the decision layer first — it's the differentiator and
the demo centerpiece. Model training and the fairness page can follow. Show
me a milestone plan before writing code. Verify each milestone works in the
browser before moving to the next. Every number on /results and /fairness
must come from an actual script run against the actual dataset — do not
fabricate or round-for-effect any result.
```
