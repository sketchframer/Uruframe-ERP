import { test, expect } from '@playwright/test';

test.describe('Operator Terminal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: '0' }).click();
    await page.getByRole('button', { name: '0' }).click();
    await page.getByRole('button', { name: '0' }).click();
    await page.getByRole('button', { name: '0' }).click();
  });

  test('should show operator terminal after login', async ({ page }) => {
    await expect(page.getByText('OPERATOR ACTIVO')).toBeVisible();
  });

  test('should show operator name', async ({ page }) => {
    await expect(page.getByText('Juan Perez')).toBeVisible();
  });
});
