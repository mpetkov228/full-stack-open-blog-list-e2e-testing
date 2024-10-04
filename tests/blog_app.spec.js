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

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByTestId('username').fill('root');
      await page.getByTestId('password').fill('secret');
      await page.getByRole('button', { name: 'Log in' }).click();
    });

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'new blog' }).click();
      await page.getByTestId('title').fill('test blog');
      await page.getByTestId('author').fill('test author');
      await page.getByTestId('url').fill('test url');
      await page.getByRole('button', { name: 'create' }).click();

      await expect(page.getByText('a new blog test blog by test author added')).toBeVisible();

      await page.goto('http://localhost:5173');

      await expect(page.getByText('test blog test author')).toBeVisible();
    });

    describe('When blog already created', () => {
      beforeEach(async ({ page }) => {
        await page.getByRole('button', { name: 'new blog' }).click();
        await page.getByTestId('title').fill('another blog');
        await page.getByTestId('author').fill('me');
        await page.getByTestId('url').fill('mysite.com');
        await page.getByRole('button', { name: 'create' }).click();

        await page.goto('http://localhost:5173');
      });

      test('blogs can be liked', async ({ page }) => {
        await page.getByRole('button', { name: 'view' }).click();
        await page.getByRole('button', { name: 'like' }).click();

        await expect(page.getByText('likes 1')).toBeVisible();
      });

      test('blog can be removed', async ({ page }) => {
        await page.getByRole('button', { name: 'view' }).click();

        page.on('dialog', dialog => dialog.accept());
        await page.getByRole('button', { name: 'remove' }).click();

        await page.goto('http://localhost:5173');
        
        await expect(page.getByText('another blog me')).not.toBeVisible();
      });
    });
  });
});