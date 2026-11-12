import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderizar } from './renderizar';
import { servidor } from './servidor';

function cartoes() {
  return within(screen.getByRole('list', { name: 'Pilotos' }))
    .getAllByRole('listitem')
    .map((item) => item.textContent ?? '');
}

describe('Grid de pilotos', () => {
  it('lista os pilotos com o total', async () => {
    renderizar('/pilotos');

    expect(await screen.findByText('4 pilotos no grid')).toBeInTheDocument();
    expect(cartoes()).toHaveLength(4);
    expect(screen.getByRole('link', { name: /Lewis Hamilton/ })).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/pilotos\/[\w-]+$/),
    );
  });

  it('busca enquanto a pessoa digita e guarda a busca no endereço', async () => {
    const { router, usuario } = renderizar('/pilotos');
    await screen.findByText('4 pilotos no grid');

    await usuario.type(screen.getByRole('searchbox'), 'mclaren');

    expect(await screen.findByText('2 resultados para “mclaren”')).toBeInTheDocument();
    expect(cartoes().join(' ')).toMatch(/Lando Norris.*Oscar Piastri/);
    expect(router.state.location.search).toBe('?busca=mclaren');
  });

  it('filtra por equipe pelos atalhos', async () => {
    const { usuario } = renderizar('/pilotos');
    const filtros = await screen.findByRole('navigation', { name: 'Filtrar por equipe' });

    await usuario.click(within(filtros).getByRole('link', { name: /Ferrari/ }));

    expect(await screen.findByText('2 resultados para “Ferrari”')).toBeInTheDocument();
    expect(within(filtros).getByRole('link', { name: /Ferrari/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('explica quando a busca não encontra ninguém', async () => {
    renderizar('/pilotos?busca=senna');

    expect(
      await screen.findByRole('heading', { name: 'Nenhum piloto encontrado' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Limpar busca' })).toHaveAttribute('href', '/pilotos');
  });

  it('mostra o erro e deixa tentar de novo quando a API falha', async () => {
    let falhar = true;
    servidor.use(
      http.get('*/api/pilotos', ({ request }) =>
        falhar
          ? HttpResponse.json(
              { codigo: 'ERRO_INTERNO', mensagem: 'O servidor está fora do ar.' },
              { status: 500 },
            )
          : HttpResponse.json({
              itens: [],
              total: 0,
              pagina: 1,
              porPagina: Number(new URL(request.url).searchParams.get('porPagina')),
            }),
      ),
    );
    const { usuario } = renderizar('/pilotos');

    expect(await screen.findByRole('alert')).toHaveTextContent('O servidor está fora do ar.');

    falhar = false;
    await usuario.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByRole('heading', { name: 'O grid está vazio' })).toBeInTheDocument();
  });

  it('esconde as ações de administrador de quem não entrou', async () => {
    renderizar('/pilotos');
    await screen.findByText('4 pilotos no grid');

    expect(screen.queryByRole('link', { name: /Novo piloto/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Importar/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('pagina quando há mais pilotos que cabem na tela', async () => {
    servidor.use(
      http.get('*/api/pilotos', ({ request }) => {
        const pagina = Number(new URL(request.url).searchParams.get('pagina') ?? 1);

        return HttpResponse.json({ itens: [], total: 30, pagina, porPagina: 12 });
      }),
    );
    const { usuario } = renderizar('/pilotos');

    expect(await screen.findByText('Página 1 de 3')).toBeInTheDocument();
    await usuario.click(screen.getByRole('link', { name: 'Próxima →' }));

    await waitFor(() => expect(screen.getByText('Página 2 de 3')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: '← Anterior' })).toBeInTheDocument();
  });
});
