import { test, expect } from '@playwright/test';

test('создание и редактирование сметы', async ({ page }) => {
  await page.goto('/estimates');
  await page.getByRole('button', { name: '+ Новая смета' }).click();
  await expect(page.getByText('Новая смета')).toBeVisible();
  await page.getByLabel('Название').fill('Смета Playwright');
  await page.getByLabel('Код').fill('PW-001');
  await page.getByLabel('Теги (через запятую)').fill('playwright, тест');
  const firstQuantity = page.locator('input[type="number"]').nth(0);
  await firstQuantity.fill('3');
  await page.getByRole('button', { name: 'Сохранить изменения' }).click();
  await page.waitForTimeout(500);
  await page.goto('/estimates');
  await expect(page.getByText('Смета Playwright')).toBeVisible();
});
