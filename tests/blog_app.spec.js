const { test, expect, beforeEach, describe } = require('@playwright/test');

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset');
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Superuser',
        username: 'root',
        password: 'secret'
      }
    });
    
    await page.goto('http://localhost:5173');
  });

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('log in to application')).toBeVisible();
  });

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByTestId('username').fill('root');
      await page.getByTestId('password').fill('secret');
      await page.getByRole('button', { name: 'Log in' }).click();

      await expect(page.getByText('Superuser logged in')).toBeVisible();
    });

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByTestId('username').fill('root');
      await page.getByTestId('password').fill('wrong');
      await page.getByRole('button', { name: 'Log in' }).click();

      await expect(page.getByText('wrong username or password')).toBeVisible();
    });
  });
});