import { expect, type Page, test } from '@playwright/test';
import { SENHA_DO_ADMINISTRADOR } from './credenciais.js';

async function entrar(page: Page, senha = SENHA_DO_ADMINISTRADOR) {
  await page.goto('/entrar');
  await page.getByLabel('Senha').fill(senha);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

test('recusa senha errada', async ({ page }) => {
  await entrar(page, 'senha-errada-de-proposito');

  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/entrar$/);
  await expect(page.getByRole('button', { name: 'Sair' })).toHaveCount(0);
});

test('cadastra equipe e piloto, edita e exclui', async ({ page }) => {
  const equipe = `Equipe ${Date.now()}`;

  await entrar(page);
  await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible();

  await page.getByRole('navigation').getByRole('link', { name: 'Equipes' }).click();
  await page.getByLabel('Nova equipe').fill(equipe);
  await page.getByRole('button', { name: 'Adicionar' }).click();
  await expect(page.getByText(equipe, { exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'Novo piloto' }).click();
  await page.getByLabel('Nome completo').fill('Gabriel Bortoleto');
  await page.getByLabel('Equipe').selectOption({ label: equipe });
  await page.getByLabel('País').selectOption('BR');
  await page.getByLabel('Número').fill('5');
  await page.getByRole('button', { name: 'Cadastrar piloto' }).click();

  await expect(page).toHaveURL(/\/pilotos\/[\w-]+$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Gabriel Bortoleto');

  await page.getByRole('link', { name: 'Editar' }).click();
  await page.getByLabel('Títulos mundiais').fill('1');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Gabriel Bortoleto');

  await page.goto('/pilotos');
  await page.getByRole('searchbox').fill('bortoleto');
  await expect(page).toHaveURL(/busca=bortoleto/);
  await expect(page.getByText('1 resultado para “bortoleto”')).toBeVisible();

  await page.getByRole('link', { name: /Gabriel Bortoleto/ }).click();
  await page.getByRole('button', { name: 'Excluir' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Excluir piloto' }).click();

  await expect(page).toHaveURL(/\/pilotos$/);
  await page.getByRole('searchbox').fill('bortoleto');
  await expect(page.getByRole('heading', { name: 'Nenhum piloto encontrado' })).toBeVisible();
});

test('a sessão some ao sair', async ({ page }) => {
  await entrar(page);
  await page.getByRole('button', { name: 'Sair' }).click();

  await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible();
  await page.goto('/pilotos/novo');
  await expect(page).toHaveURL(/\/entrar/);
});
