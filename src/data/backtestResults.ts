// Auto-generated backtest output from real computation on 12,000 synthetic test cases
export const BACKTEST_RESULTS = {
  "sampleSize": 12000,
  "costMatrix": {
    "cost_false_positive": 45,
    "cost_false_negative": 125,
    "cost_manual_review": 18
  },
  "returnIqPolicy": {
    "totalCost": 41264,
    "costPerReturn": 3.44,
    "approvedCount": 8041,
    "reviewedCount": 512,
    "deniedCount": 3447,
    "fraudCatchRate": 98.3,
    "falseFlagRateOnLegit": 5.6,
    "opsLaborHours": 102
  },
  "naiveReviewBaseline": {
    "totalCost": 240767,
    "costPerReturn": 20.06,
    "approvedCount": 8550,
    "reviewedCount": 3450,
    "deniedCount": 0,
    "fraudCatchRate": 97.2,
    "falseFlagRateOnLegit": 0,
    "opsLaborHours": 690
  },
  "netSavingsDollars": 199502,
  "costReductionPercent": 82.9,
  "savedOpsHours": 588,
  "confusionMatrix": {
    "labels": [
      "Legitimate",
      "Policy Abuser",
      "Fraudulent Return",
      "Wardrobing"
    ],
    "matrix": [
      [
        8452,
        0,
        0,
        0
      ],
      [
        0,
        1518,
        0,
        0
      ],
      [
        66,
        0,
        1099,
        0
      ],
      [
        103,
        0,
        0,
        762
      ]
    ],
    "classMetrics": {
      "Legitimate": {
        "precision": 98,
        "recall": 100,
        "f1Score": 99,
        "support": 8452
      },
      "Policy Abuser": {
        "precision": 100,
        "recall": 100,
        "f1Score": 100,
        "support": 1518
      },
      "Fraudulent Return": {
        "precision": 100,
        "recall": 94.3,
        "f1Score": 97.1,
        "support": 1165
      },
      "Wardrobing": {
        "precision": 100,
        "recall": 88.1,
        "f1Score": 93.7,
        "support": 865
      }
    },
    "overallAccuracy": 98.6,
    "macroF1": 97.4
  },
  "groupStats": {
    "age:18-24": {
      "total": 2366,
      "legit": 1686,
      "abuse": 680,
      "fp": 103,
      "fn": 12,
      "totalVal": 477923
    },
    "region:Pacific NW": {
      "total": 2331,
      "legit": 1666,
      "abuse": 665,
      "fp": 94,
      "fn": 13,
      "totalVal": 476888
    },
    "tenure:3-12mo": {
      "total": 3548,
      "legit": 2857,
      "abuse": 691,
      "fp": 420,
      "fn": 8,
      "totalVal": 572877
    },
    "region:South": {
      "total": 2380,
      "legit": 1676,
      "abuse": 704,
      "fp": 95,
      "fn": 15,
      "totalVal": 474710
    },
    "tenure:1yr+": {
      "total": 6942,
      "legit": 5284,
      "abuse": 1658,
      "fp": 2,
      "fn": 31,
      "totalVal": 1100262
    },
    "age:25-34": {
      "total": 2464,
      "legit": 1721,
      "abuse": 743,
      "fp": 104,
      "fn": 13,
      "totalVal": 504450
    },
    "region:Midwest": {
      "total": 2376,
      "legit": 1732,
      "abuse": 644,
      "fp": 104,
      "fn": 5,
      "totalVal": 463778
    },
    "age:50-64": {
      "total": 2420,
      "legit": 1695,
      "abuse": 725,
      "fp": 88,
      "fn": 12,
      "totalVal": 495870
    },
    "region:West": {
      "total": 2437,
      "legit": 1711,
      "abuse": 726,
      "fp": 78,
      "fn": 15,
      "totalVal": 494366
    },
    "age:35-49": {
      "total": 2423,
      "legit": 1735,
      "abuse": 688,
      "fp": 82,
      "fn": 9,
      "totalVal": 474071
    },
    "age:65+": {
      "total": 2327,
      "legit": 1615,
      "abuse": 712,
      "fp": 94,
      "fn": 14,
      "totalVal": 464318
    },
    "region:Northeast": {
      "total": 2476,
      "legit": 1667,
      "abuse": 809,
      "fp": 100,
      "fn": 12,
      "totalVal": 506890
    },
    "tenure:<90d": {
      "total": 1510,
      "legit": 311,
      "abuse": 1199,
      "fp": 49,
      "fn": 21,
      "totalVal": 743493
    }
  },
  "evaluatedAt": "2026-11-09T17:23:25.695Z"
};
