import { test, expect } from '@playwright/test';

test.describe('Weather API E2E', () => {
  test('GET /api/weather returns weather for valid city', async ({
    request,
  }) => {
    const city = 'Kyiv';
    const response = await request.get(`/api/weather?city=${city}`);
    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json).toHaveProperty('temperature');
    expect(json).toHaveProperty('humidity');
    expect(json).toHaveProperty('description');
    expect(typeof json.temperature).toBe('number');
    expect(typeof json.humidity).toBe('number');
    expect(typeof json.description).toBe('string');
  });

  test('GET /api/weather returns 400 for missing city', async ({ request }) => {
    const response = await request.get('/api/weather');
    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.message).toBeDefined();
  });

  test('GET /api/weather returns 404 for unknown city', async ({ request }) => {
    const response = await request.get('/api/weather?city=UnknownCity12345');
    expect(response.status()).toBe(404);
    const json = await response.json();
    expect(json.message).toBeDefined();
  });

  test('Weather page UI shows weather for valid city', async ({ page }) => {
    await page.goto('/get-weather.html');
    await page.fill('input[name="city"]', 'Lviv');
    await page.click('button[type="submit"]');
    await expect(page.locator('#msg')).toContainText(
      'weather details for Lviv',
    );
    await expect(page.locator('#weatherResult')).toBeVisible();
    await expect(page.locator('#weatherResult')).toContainText('Temperature');
    await expect(page.locator('#weatherResult')).toContainText('Humidity');
    await expect(page.locator('#weatherResult')).toContainText('Description');
  });

  test('Weather page UI shows error for empty city', async ({ page }) => {
    await page.goto('/get-weather.html');
    await page.fill('input[name="city"]', 'Kyiv_invalid');
    await page.click('button[type="submit"]');
    await expect(page.locator('#msg')).toContainText('not found');
    await expect(page.locator('#weatherResult')).not.toBeVisible();
  });
});
