# ReturnIQ — Advanced Features Prompt (Google Antigravity + Gemini/Groq)

Run this AFTER the base build (01-build-prompt.md) is working: /simulator,
/results, /fairness are live with real backtest numbers. This prompt layers
six advanced features on top, in priority order. Build and verify each one
before starting the next — if time runs out, stop at the highest-numbered
one you finished cleanly rather than leaving several half-built.

```
ROLE
You are extending the working ReturnIQ submission for DataNova 2026 with
advanced features that differentiate it from other teams using the same
public Kaggle dataset. Do not break the existing /simulator, /results,
/fairness pages — these features extend them, they don't replace them.
Every new number shown anywhere must come from an actual computation against
the actual dataset/model — never a plausible-looking placeholder.

BUILD IN THIS ORDER:

1. CALIBRATED CONFIDENCE
   Replace raw softmax output with a calibrated probability (e.g.
   scikit-learn CalibratedClassifierCV, Platt or isotonic) and add a
   conformal-prediction confidence band around each prediction. On
   /simulator, show "Wardrobing: 87% ± 4% (95% confidence)" instead of a bare
   percentage. On /results, add a reliability diagram (predicted probability
   vs. observed frequency) and report the Brier score before/after
   calibration — this is a real, checkable rigor claim, not decoration.

2. PARETO-FRONTIER THRESHOLD OPTIMIZER
   Grid-search (or a simple multi-objective optimization) the tradeoff
   between fraud-catch-rate (true positive rate on Fraudulent
   Return + Wardrobing) and false-flag-rate on Legitimate returns, across a
   range of decision thresholds. Plot this as an actual Pareto frontier curve
   on a new /optimizer page. Make the curve clickable: clicking a point sets
   the decision-layer's operating threshold for that session and immediately
   re-renders the expected $ outcome from the existing backtest logic at that
   point (reuse the decision-layer math from the base build, don't
   reimplement it). This is the single most important new feature — do not
   cut it under time pressure.

3. FRAUD-RING NETWORK GRAPH
   The base dataset has no explicit account-linkage field. Engineer one
   explicitly and transparently: for the demo, synthetically assign shared
   attributes (e.g., same shipping address or device fingerprint cluster) to
   a small designated subset of flagged cases, clearly documented in the
   README as "engineered linkage for demonstration, not present in the
   source dataset." Run a community-detection pass (e.g., connected
   components or a simple Louvain pass) over this linkage graph and render
   it as a force-directed graph (react-force-graph or D3) on a new
   /fraud-rings page — nodes colored by abuse_type, clusters visually
   grouped, clicking a node shows that case's detail. Label this feature
   clearly as "illustrative of ring-detection capability on linkage data a
   real deployment would have (shared payment tokens, device IDs, addresses)
   that this public dataset does not include."

4. SURROGATE RULE DISTILLATION
   Fit a shallow (max_depth 3-4) decision tree on the main model's own
   predictions (not the raw labels) to approximate its behavior in
   human-readable form. Render the extracted rules as a plain-English
   checklist on a new /playbook page — e.g., "IF days_to_return > 25 AND
   return_reason = 'Changed mind' AND past_return_rate > 0.4 THEN flag for
   review." State the surrogate's fidelity (agreement rate with the full
   model) plainly. Frame this explicitly as "a retailer without an ML team
   can run this checklist manually tomorrow."

5. ONE-CLICK ROI EXPORT
   Add an "Export Business Case" button on /results that generates a PDF (or
   well-formatted printable page) containing: the $ saved vs. baseline
   policy figure from the existing backtest, an estimated implementation
   cost range (state your assumptions explicitly — e.g., inference
   infrastructure + review-queue tooling, order-of-magnitude, not a fake
   precise number), and a payback-period estimate computed from those two
   numbers. Every figure must trace back to a value already computed
   elsewhere in the app — this export assembles, it doesn't invent.

6. CHAT-WITH-YOUR-FRAUD-DATA
   Add a chat input (Gemini or Groq, server-side) on a new /ask page that
   accepts natural-language queries against the held-out test set's
   predictions and renders a filtered table or small chart as the answer
   (e.g., "show me wardrobing cases flagged on mobile devices" ->
   server translates to a real filter against the actual results dataframe,
   never lets the LLM fabricate rows). If the LLM produces a query that
   doesn't map to a real, safe filter operation, fall back to "I can't answer
   that from the available data" rather than hallucinating an answer.

DELIVERABLES (in addition to the base build's deliverables)
- Update the README with a section per feature: what it does, why it's there,
  and its honest limitations (especially feature 3's synthetic linkage).
- Update the demo script to include: a Pareto-frontier click-through, one
  fraud-ring cluster inspection, one playbook-rule read-out, one ROI export,
  and one natural-language query — in that order, after the original
  simulator walkthrough.
- If you run out of time partway through this list, stop cleanly after
  completing a feature in full rather than leaving a half-built one visible
  in the demo — a judge should never see a broken page.
```
