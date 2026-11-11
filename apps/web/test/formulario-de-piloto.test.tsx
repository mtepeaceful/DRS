import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderizar } from './renderizar';
import { banco } from './servidor';

describe('Cadastro de piloto', () => {
  it('mostra em português o que falta preencher', async () => {
    const { usuario } = renderizar('/pilotos/novo', { logado: true });

    await usuario.click(await screen.findByRole('button', { name: 'Cadastrar piloto' }));

    expect(await screen.findByText('Informe o nome do piloto.')).toBeInTheDocument();
    expect(screen.getByText('Informe o número do piloto.')).toBeInTheDocument();
    expect(screen.getByText('Selecione uma equipe.')).toBeInTheDocument();
    expect(screen.getByText('Selecione um país.')).toBeInTheDocument();
  });

  it('recusa número fora da faixa permitida', async () => {
    const { usuario } = renderizar('/pilotos/novo', { logado: true });

    await usuario.type(await screen.findByLabelText('Número'), '120');
    await usuario.click(screen.getByRole('button', { name: 'Cadastrar piloto' }));

    expect(await screen.findByLabelText('Número')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Número')).toHaveAccessibleDescription(/99/);
  });

  it('atualiza a prévia do cartão enquanto a pessoa digita', async () => {
    const { usuario } = renderizar('/pilotos/novo', { logado: true });

    await usuario.type(await screen.findByLabelText('Nome completo'), 'Gabriel Bortoleto');
    await usuario.type(screen.getByLabelText('Número'), '5');

    const previa = screen.getByRole('complementary', { name: 'Prévia do cartão' });
    expect(within(previa).getByText('Gabriel Bortoleto')).toBeInTheDocument();
    expect(within(previa).getByText('5')).toBeInTheDocument();
  });

  it('cadastra e abre a página do novo piloto', async () => {
    const { router, usuario } = renderizar('/pilotos/novo', { logado: true });

    await usuario.type(await screen.findByLabelText('Nome completo'), 'Gabriel Bortoleto');
    await usuario.selectOptions(screen.getByLabelText('Equipe'), 'McLaren');
    await usuario.selectOptions(screen.getByLabelText('País'), 'BR');
    await usuario.type(screen.getByLabelText('Número'), '5');
    await usuario.click(screen.getByRole('button', { name: 'Cadastrar piloto' }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(`/pilotos/${banco.pilotos.at(-1)?.id}`),
    );
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Gabriel Bortoleto'),
    );
    expect(banco.pilotos.at(-1)).toMatchObject({
      nome: 'Gabriel Bortoleto',
      numero: 5,
      pais: 'BR',
    });
  });

  it('aponta no campo quando o número já é de outro piloto', async () => {
    const { usuario } = renderizar('/pilotos/novo', { logado: true });

    await usuario.type(await screen.findByLabelText('Nome completo'), 'Outro Piloto');
    await usuario.selectOptions(screen.getByLabelText('Equipe'), 'Ferrari');
    await usuario.selectOptions(screen.getByLabelText('País'), 'IT');
    await usuario.type(screen.getByLabelText('Número'), '44');
    await usuario.click(screen.getByRole('button', { name: 'Cadastrar piloto' }));

    expect(
      await screen.findByText('O número 44 já pertence a Lewis Hamilton.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Número')).toHaveFocus();
  });
});
