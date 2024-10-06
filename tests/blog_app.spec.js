const { test, expect, beforeEach, describe } = require('@playwright/test');
const { loginWith, createBlog } = require('./testHelper');

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
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Test user',
        username: 'test',
        password: 'password'
      }
    });

    await page.goto('http://localhost:5173');
  });

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('log in to application')).toBeVisible();
  });

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'root', 'secret');

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
      await createBlog(page, 'test blog', 'test author', 'test url');

      await expect(page.getByText('a new blog test blog by test author added')).toBeVisible();

      await page.goto('http://localhost:5173');

      await expect(page.getByText('test blog test author')).toBeVisible();
    });

    describe('When blog already created', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, 'another blog', 'me', 'mysite.com');

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

      test('remove button seen only by blog creator', async ({ page }) => {
        await page.getByRole('button', { name: 'log out' }).click();
        await loginWith(page, 'test', 'password');

        await createBlog(page, 'blog 1', 'not me', 'www.com');
        await page.goto('http://localhost:5173');

        await page.getByRole('button', { name: 'view' }).first().click()
        await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible();

        await page.getByRole('button', { name: 'view' }).last().click()
        await expect(page.getByRole('button', { name: 'remove' })).toBeVisible();
      });
    });
  });
});