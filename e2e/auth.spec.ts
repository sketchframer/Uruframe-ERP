import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login with valid PIN and redirect to dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('button', { name: '2' }).click();
    await page.getByRole('button', { name: '3' }).click();
    await page.getByRole('button', { name: '4' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('should show error for invalid PIN', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: '9' }).click();
    await page.getByRole('button', { name: '9' }).click();
    await page.getByRole('button', { name: '9' }).click();
    await page.getByRole('button', { name: '9' }).click();

    await expect(page.getByText('Acceso Denegado')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('button', { name: '2' }).click();
    await page.getByRole('button', { name: '3' }).click();
    await page.getByRole('button', { name: '4' }).click();

    await expect(page.getByText('Dashboard')).toBeVisible();

    await page.getByRole('button', { name: /Salir/i }).click();

    await expect(page).toHaveURL('/login');
  });
});
