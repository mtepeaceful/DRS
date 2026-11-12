import type { DadosPilotoDTO, EquipeDTO, PilotoDTO } from '@drs/contracts';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const SENHA_CORRETA = 'senha-de-teste-bem-longa';

export const ferrari: EquipeDTO = {
  id: '6f1b0a3e-1c1f-4b7e-9a51-5c2b8f0e0001',
  nome: 'Ferrari',
  cor: '#ed1131',
  corSecundaria: '#ffffff',
};

export const mclaren: EquipeDTO = {
  id: '6f1b0a3e-1c1f-4b7e-9a51-5c2b8f0e0002',
  nome: 'McLaren',
  cor: '#f47600',
  corSecundaria: '#ffffff',
};

function piloto(numero: number, nome: string, equipe: EquipeDTO, titulos = 0): PilotoDTO {
  return {
    id: `0a7c3d52-8e4b-4f0a-b1c2-${String(numero).padStart(12, '0')}`,
    nome,
    numero,
    pais: 'GB',
    titulos,
    equipe,
    criadoEm: '2026-11-01T12:00:00.000Z',
    atualizadoEm: '2026-11-01T12:00:00.000Z',
  };
}

const gridInicial = [
  piloto(44, 'Lewis Hamilton', ferrari, 7),
  piloto(16, 'Charles Leclerc', ferrari),
  piloto(1, 'Lando Norris', mclaren, 1),
  piloto(81, 'Oscar Piastri', mclaren),
];

export const banco = {
  equipes: [ferrari, mclaren],
  pilotos: [...gridInicial],
  reiniciar() {
    this.equipes = [ferrari, mclaren];
    this.pilotos = [...gridInicial];
  },
};

function autenticado(request: Request) {
  return request.headers.get('authorization') === 'Bearer token-de-teste';
}

const naoAutorizado = () =>
  HttpResponse.json(
    { codigo: 'NAO_AUTORIZADO', mensagem: 'Entre como administrador.' },
    { status: 401 },
  );

export const servidor = setupServer(
  http.get('*/api/equipes', () => HttpResponse.json(banco.equipes)),

  http.get('*/api/pilotos', ({ request }) => {
    const url = new URL(request.url);
    const busca = (url.searchParams.get('busca') ?? '').toLowerCase();
    const pagina = Number(url.searchParams.get('pagina') ?? 1);
    const porPagina = Number(url.searchParams.get('porPagina') ?? 10);
    const encontrados = banco.pilotos.filter(
      (p) => p.nome.toLowerCase().includes(busca) || p.equipe.nome.toLowerCase().includes(busca),
    );

    return HttpResponse.json({
      itens: encontrados.slice((pagina - 1) * porPagina, pagina * porPagina),
      total: encontrados.length,
      pagina,
      porPagina,
    });
  }),

  http.get('*/api/pilotos/fotos', () => HttpResponse.json([])),
  http.get('*/api/pilotos/:id/carreira', () => HttpResponse.json(null)),

  http.get('*/api/temporada/pilotos', () =>
    HttpResponse.json({ ano: 2026, rodadasDisputadas: 0, pilotos: [] }),
  ),

  http.get('*/api/calendario', () => HttpResponse.json([])),

  http.get('*/api/historia/equipes', () => HttpResponse.json([])),

  http.get('*/api/circuitos', () => HttpResponse.json([])),

  http.get('*/api/historia/pilotos', () => HttpResponse.json([])),

  http.get('*/api/pilotos/:id', ({ params }) => {
    const encontrado = banco.pilotos.find((p) => p.id === params.id);

    return encontrado
      ? HttpResponse.json(encontrado)
      : HttpResponse.json(
          { codigo: 'PILOTO_NAO_ENCONTRADO', mensagem: 'Piloto não encontrado.' },
          { status: 404 },
        );
  }),

  http.post('*/api/pilotos', async ({ request }) => {
    if (!autenticado(request)) {
      return naoAutorizado();
    }

    const dados = (await request.json()) as DadosPilotoDTO;
    const dono = banco.pilotos.find((p) => p.numero === dados.numero);

    if (dono) {
      return HttpResponse.json(
        {
          codigo: 'NUMERO_JA_EM_USO',
          mensagem: `O número ${dados.numero} já pertence a ${dono.nome}.`,
        },
        { status: 409 },
      );
    }

    const equipe = banco.equipes.find((e) => e.id === dados.equipeId) ?? ferrari;
    const novo = { ...piloto(dados.numero, dados.nome, equipe, dados.titulos), pais: dados.pais };
    banco.pilotos.push(novo);

    return HttpResponse.json(novo, { status: 201 });
  }),

  http.post('*/api/sessao', async ({ request }) => {
    const { senha } = (await request.json()) as { senha: string };

    if (senha !== SENHA_CORRETA) {
      return HttpResponse.json(
        { codigo: 'SENHA_INCORRETA', mensagem: 'Senha incorreta.' },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      token: 'token-de-teste',
      expiraEm: new Date(Date.now() + 60 * 60_000).toISOString(),
    });
  }),
);
