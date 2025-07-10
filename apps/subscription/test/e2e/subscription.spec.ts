import { test, expect } from '@playwright/test';

test.describe('Weather Subscription E2E', () => {
  test('User can subscribe to weather updates', async ({ page }) => {
    await page.goto('/subscribe.html');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="city"]', 'Kyiv');
    await page.selectOption('select[name="frequency"]', 'daily');
    await page.click('button[type="submit"]');
    await expect(page.locator('#msg')).toContainText(
      /confirmation|check your email/i,
    );
  });

  test('Shows error for invalid email', async ({ page }) => {
    await page.goto('/subscribe.html');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="city"]', 'Kyiv');
    await page.selectOption('select[name="frequency"]', 'daily');
    await page.click('button[type="submit"]');
    await expect(page.locator('#msg')).toContainText(/invalid email/i);
  });

  test('Shows error for empty city', async ({ page }) => {
    await page.goto('/subscribe.html');
    await page.fill('input[name="email"]', 'testuser2@example.com');
    await page.fill('input[name="city"]', '');
    await page.selectOption('select[name="frequency"]', 'daily');
    await page.click('button[type="submit"]');
    await expect(page.locator('#msg')).toContainText(/city.*required/i);
  });

  test('Shows error for empty frequency', async ({ page }) => {
    await page.goto('/subscribe.html');
    await page.fill('input[name="email"]', 'testuser3@example.com');
    await page.fill('input[name="city"]', 'Lviv');
    await page.selectOption('select[name="frequency"]', '');
    await page.click('button[type="submit"]');
    await expect(page.locator('#msg')).toContainText(/frequency.*required/i);
  });
});
