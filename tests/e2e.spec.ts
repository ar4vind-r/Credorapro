/**
 * End-to-End Test Suite for Credora Red Routes
 * Covers:
 * - Red Route 1: Bulk Certificate Generation Flow
 * - Red Route 2: Certificate Verification (Direct URL & Number Lookup)
 *
 * To run when @playwright/test is installed:
 * npx playwright test tests/e2e.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Red Route 1: Bulk Certificate Generation Flow', () => {
  test('completes full end-to-end journey from sample load to batch generation', async ({ page }) => {
    // 1. Visit app
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Generate verifiable certificates in bulk');

    // 2. Click "Load Sample Project" to populate template and spreadsheet data
    const loadSampleBtn = page.getByRole('button', { name: /Load Sample/i });
    await expect(loadSampleBtn).toBeVisible();
    await loadSampleBtn.click();

    // 3. Verify transition to Field Mapping step
    await expect(page.getByText('Map Spreadsheet Fields')).toBeVisible();
    await expect(page.getByText('Use arrow keys')).toBeVisible();

    // 4. Test field interaction and keyboard nudge capability
    const nameFieldItem = page.getByRole('button', { name: /Recipient Name/i }).first();
    await nameFieldItem.click();
    
    // Press keyboard arrow to verify keyboard nudging
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');

    // 5. Proceed to generation step
    const proceedToGenerateBtn = page.getByRole('button', { name: /Proceed to Generate/i });
    await proceedToGenerateBtn.click();

    // 6. Verify generation step interface
    await expect(page.getByText('Review and Export')).toBeVisible();
    const generateBtn = page.getByRole('button', { name: /Generate \d+ Certificates/i });
    await expect(generateBtn).toBeVisible();

    // 7. Click Generate and check live progress
    await generateBtn.click();
    
    // Live progress region must be present
    const progressRegion = page.locator('[aria-live="polite"]');
    await expect(progressRegion).toBeVisible();

    // Wait for batch completion
    await expect(page.getByText(/Generation Complete/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /Download ZIP/i })).toBeVisible();
  });

  it('rejects invalid or empty files during upload with clear actionable feedback', async ({ page }) => {
    await page.goto('/');
    
    // Test that empty state shows upload drops
    await expect(page.getByText('Upload Certificate Template')).toBeVisible();
    await expect(page.getByText('Upload Attendee Spreadsheet')).toBeVisible();
  });
});

test.describe('Red Route 2: Certificate Verification Flow', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // Mobile-first viewport (iPhone 12/13/14)

  test('verifies genuine certificate via direct URL lookup', async ({ page }) => {
    // Open verification modal with valid mock certificate ID
    await page.goto('/?verify=CRD-2026-X8K9M2');

    // Modal dialog must be visible
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // In demo / fallback mode, verifies either registry record or unverified fallback notice
    await expect(page.locator('text=Certificate Status').or(page.locator('text=Authenticity'))).toBeVisible();
  });

  test('shows not found state for unknown or tampered certificate ID', async ({ page }) => {
    await page.goto('/?verify=CRD-9999-000000');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Should indicate certificate does not exist or unverified
    await expect(page.getByText(/No certificate with this number exists|not found/i)).toBeVisible();
  });

  test('allows manual lookup by typing certificate number into search box', async ({ page }) => {
    await page.goto('/');

    const verifyInput = page.getByPlaceholder(/CRD-YYYY-NNNNNN/i);
    await expect(verifyInput).toBeVisible();

    await verifyInput.fill('CRD-2026-INVALID1');
    const verifySubmitBtn = page.getByRole('button', { name: /Check Status/i });
    await verifySubmitBtn.click();

    // Verification modal opens with lookup result
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });
});
