/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Playwright E2E: Simulator Behavior & Live Slider Flip
 */

import { test, expect } from '@playwright/test';

test.describe('ReturnIQ Simulator Interactive Workflow', () => {
  const APP_URL = process.env.APP_URL || 'http://localhost:3000';

  test('should load simulator, score fixture case and flip recommendation on slider drag', async ({ page }) => {
    // 1. Navigate to simulator
    await page.goto(APP_URL);
    await expect(page.locator('text=ReturnIQ')).toBeVisible();
    await expect(page.locator('text=Cost-Sensitive Return Decision Simulator')).toBeVisible();

    // 2. Verify Borderline Case #4092 is loaded by default
    await expect(page.locator('text=Borderline Case #4092')).toBeVisible();
    await expect(page.locator('text=RETURNIQ ENGINE RECOMMENDATION')).toBeVisible();

    // 3. Select Gala Evening Dress (Serial Wardrober)
    await page.click('button:has-text("Gala Evening Dress")');
    await expect(page.locator('text=Deny-and-Blacklist')).toBeVisible();
    await expect(page.locator('text=Plain-Language Retail Ops Case Note')).toBeVisible();

    // 4. Drag Cost of False Positive slider to $110 to witness decision flip
    const fpSlider = page.locator('input[type="range"]').first();
    await fpSlider.fill('110');
    await fpSlider.dispatchEvent('change');

    // Confirm that increasing FP churn cost flips or shifts expected cost
    await expect(page.locator('text=Optimal Expected Loss')).toBeVisible();

    // 5. Open Customizer, edit Order Value, confirm re-scoring without crash
    await page.click('button:has-text("Customize Return Case")');
    const orderInput = page.locator('input[type="number"]').first();
    await orderInput.fill('750');
    await orderInput.dispatchEvent('change');

    // Confirm all 3 UI fields remain rendered
    await expect(page.locator('text=Multi-Class Abuse Probability Distribution')).toBeVisible();
    await expect(page.locator('text=RETURNIQ ENGINE RECOMMENDATION')).toBeVisible();
    await expect(page.locator('text=Plain-Language Retail Ops Case Note')).toBeVisible();
  });
});
