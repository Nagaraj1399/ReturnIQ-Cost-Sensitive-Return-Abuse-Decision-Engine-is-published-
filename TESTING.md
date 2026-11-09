# ReturnIQ End-to-End Test Automation Suite
**DataNova 2026 Global Data-thon** | **Track:** Cybersecurity & Fraud Detection | **Team:** GenOS Team

---

## 1. Quick Start: The One Command to Run Everything Locally

To execute the complete automated test suite (all unit tests, decision layer verification, model calibration checks, fairness audit assertions, and live API integration tests):

```bash
npm test
# OR directly via tsx:
npx tsx tests/run-all-tests.ts
```

To run the Playwright browser E2E test suite and generate the 3-minute presentation screenshot gallery:
```bash
npx playwright test
```

To run the standalone Python decision engine pipeline:
```bash
python3 scripts/train_and_backtest.py
```

---

## 2. Test Coverage Matrix

| Test File | Focus Area | What Is Tested & Asserted |
| :--- | :--- | :--- |
| **`tests/data-pipeline.unit.spec.ts`** | Data Pipeline | • Synthesizer & Kaggle CSV row count (60,000 / 12,000 split)<br>• Class priors within tolerance: Legitimate ~70.1%, Policy Abuser ~11.9%, Fraudulent Return ~10.2%, Wardrobing ~7.7%<br>• Zero NaN / null / undefined values survive feature engineering<br>• Stratified split preserves balance across random halves |
| **`tests/model.unit.spec.ts`** | Model Inference | • Predicted probability vector sums to 1.0000 within floating-point tolerance<br>• Per-class precision/recall on held-out test set are non-degenerate (&gt;75%)<br>• Model artifact version and parameter signature matches the numbers on `/results` |
| **`tests/decision-layer.unit.spec.ts`** | Decision Layer *(Critical)* | • **5 Hand-Derived Mathematical Oracles**: Expected cost for each action ($E[\text{Approve}]$, $E[\text{Flag}]$, $E[\text{Deny}]$) matches manual arithmetic exactly<br>• **Monotonicity Property**: Increasing $C_{FN}$ (fraud penalty) strictly increases or maintains action strictness (Approve &le; Flag &le; Deny)<br>• **Backtest Invariance**: Held-out $199,502 savings and 82.9% reduction match `/results` exactly |
| **`tests/explanation-layer.spec.ts`** | Ops Explanations | • Generated ops case note explicitly names the top SHAP contributing feature<br>• Failure/timeout fallback path returns robust, non-empty retail ops case note |
| **`tests/fairness.spec.ts`** | Bias Governance | • Recomputed group-wise FP/FN rates across age, region, and tenure match report<br>• Subgroup disparity detection triggers non-empty finding paragraph naming affected groups (&lt;90d accounts, 18-24 age)<br>• Mandatory synthetic dataset disclosure verified |
| **`tests/simulator-e2e.spec.ts`** | Simulator E2E | • Interactive case loading, scoring, and real-time decision flip on slider drag<br>• Case customization and live re-scoring |
| **`tests/fixtures/test_fixtures.ts`** | Test Oracles | • 5 hand-derived reference cases with step-by-step arithmetic shown in code comments |

---

## 3. Explicitly Out of Scope

In alignment with data-thon constraints and enterprise deployment realities, the following are explicitly out of scope for this test suite:
1. **Real Production Transaction Validation:** The underlying dataset is labeled synthetic (Kaggle 60,000 rows). Real merchant transaction validation requires an active retailer pilot with live ERP/WMS integration.
2. **Stress / Load Testing Beyond Batch Limits:** Tests validate batch inferences up to 12,000 cases. High-throughput streaming (e.g. 50,000 requests/sec distributed load testing) is left for enterprise cloud staging.
3. **Third-Party Model Provider Uptime:** Tests use the built-in deterministic ops heuristic and mocked timeout race to ensure zero flakiness if external Gemini/Groq networks experience latency.

---

## 4. Continuous Integration (GitHub Actions)

The `.github/workflows/test.yml` workflow enforces:
- **On every push:** Unit tests, decision layer verification, Python pipeline execution, and TypeScript linting.
- **On PR to main:** Full Playwright E2E suite execution with automatic upload of the presentation screenshot gallery artifact.
