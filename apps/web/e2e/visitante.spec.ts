import { expect, test } from '@playwright/test';

test('navega pelo menu até o grid e as equipes', async ({ page }) => {
  await page.goto('/pilotos');

  await expect(page.getByRole('heading', { level: 1, name: 'Grid de pilotos' })).toBeVisible();

  await page.getByRole('navigation').getByRole('link', { name: 'Equipes' }).click();

  await expect(page).toHaveURL(/\/equipes$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('pede login para cadastrar e lembra de onde a pessoa veio', async ({ page }) => {
  await page.goto('/pilotos/novo');

  await expect(page).toHaveURL(/\/entrar\?voltar=%2Fpilotos%2Fnovo$/);
  await expect(page.getByRole('heading', { name: 'Área do administrador' })).toBeVisible();
});

test('mostra uma página própria para endereço inexistente', async ({ page }) => {
  await page.goto('/endereco-que-nao-existe');

  await expect(page.getByRole('heading', { name: 'Essa página saiu da pista' })).toBeVisible();
  await page.getByRole('link', { name: 'Voltar ao início' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('cabe na tela sem rolagem lateral', async ({ page }) => {
  await page.goto('/pilotos');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const sobra = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  expect(sobra).toBeLessThanOrEqual(0);
});
