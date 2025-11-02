import { test, expect } from '@playwright/test';

const stepTitles = {
  en: ['Master SmetaPro in minutes', 'Secure your data', 'Sample projects'],
  ru: ['Освойте СметаПро за минуты', 'Защитите данные', 'Примеры проектов']
};

test.describe('Mobile onboarding', () => {
  test('walks through onboarding in English on Safari', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only');

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'SmetaPro' })).toBeVisible();

    await expect(page.getByRole('heading', { name: stepTitles.en[0] })).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { name: stepTitles.en[1] })).toBeVisible();

    await page.getByRole('button', { name: 'Generate key' }).click();
    await expect(page.getByText('BEGIN PUBLIC KEY')).toBeVisible();

    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { name: stepTitles.en[2] })).toBeVisible();
  });

  test('supports Russian locale on Chrome', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only');

    await page.goto('/');
    await page.getByLabel('Change language').selectOption('ru');
    await expect(page.getByRole('heading', { name: 'СметаПро' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Продолжить' })).toBeVisible();

    await page.getByRole('button', { name: 'Продолжить' }).click();
    await expect(page.getByRole('heading', { name: stepTitles.ru[1] })).toBeVisible();
  });
});
