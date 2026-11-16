import { test, expect } from '@playwright/test';

test('register, add a note type, create / search / delete a note', async ({ page }) => {
  const email = `e2e+${Date.now()}@test.com`;

  // --- Register a fresh account ---
  await page.goto('/register');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /create account/i }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: 'Notes' })).toBeVisible();

  // --- Add a note type ---
  await page.getByRole('link', { name: 'Note Types' }).click();
  await page.getByPlaceholder('New note type name').fill('Standup');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText('Standup')).toBeVisible();

  // --- Create a note ---
  await page.getByRole('link', { name: 'Notes' }).click();
  await page.getByRole('button', { name: 'New note' }).click();
  await page.getByLabel('Title').fill('E2E standup note');
  await page.getByLabel('Note type').selectOption({ label: 'Standup' });
  await page.getByLabel(/content/i).fill('Did the end-to-end test today.');
  await page.getByRole('button', { name: /create note/i }).click();

  await expect(page.getByRole('link', { name: 'E2E standup note' })).toBeVisible();

  // --- Search finds it ---
  await page.getByPlaceholder(/search title and content/i).fill('end-to-end');
  await expect(page.getByRole('link', { name: 'E2E standup note' })).toBeVisible();

  // --- Delete it ---
  await page
    .getByRole('row', { name: /E2E standup note/i })
    .getByRole('button')
    .last()
    .click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('link', { name: 'E2E standup note' })).toHaveCount(0);
});
