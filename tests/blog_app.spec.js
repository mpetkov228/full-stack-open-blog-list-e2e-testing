const { test, expect, beforeEach, describe } = require('@playwright/test');

describe('Blog app', () => {
  beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('Login form is shown', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.getByRole('button', { name: 'Log in' }).click();
  });
});