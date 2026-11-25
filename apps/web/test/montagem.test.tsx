import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  atributos,
  CATEGORIAS,
  deParametros,
  disponibilidade,
  equipePorId,
  EQUIPES,
  montagemPadrao,
  montagemValida,
  orcamento,
  paraParametros,
  TETO_DE_GASTOS,
} from '../src/features/montagem/catalogo';
import { renderizar } from './renderizar';

function equipe(id: string) {
  const encontrada = equipePorId(id);

  if (!encontrada) {
    throw new Error(id);
  }

  return encontrada;
}

describe('Catálogo da garagem', () => {
  it('tem ids únicos e a primeira peça de cada categoria é gratuita e de nível 1', () => {
    expect(new Set(EQUIPES.map((item) => item.id)).size).toBe(EQUIPES.length);

    for (const categoria of CATEGORIAS) {
      expect(new Set(categoria.pecas.map((peca) => peca.id)).size).toBe(categoria.pecas.length);
      expect(categoria.pecas[0]).toMatchObject({ nivel: 1, custo: 0 });
    }
  });

  it('a montagem padrão cabe no teto de qualquer equipe', () => {
    expect(orcamento(montagemPadrao())).toEqual({
      teto: TETO_DE_GASTOS,
      gasto: 0,
      sobra: TETO_DE_GASTOS,
    });
  });

  it('bloqueia peça acima da tecnologia da equipe', () => {
    const asa = CATEGORIAS[0]?.pecas.find((peca) => peca.id === 'evolucao');

    expect(asa).toBeDefined();
    if (!asa) return;

    expect(disponibilidade(equipe('cadillac'), montagemPadrao(), 'asa-dianteira', asa)).toEqual({
      liberada: false,
      motivo: 'Fora da tecnologia da Cadillac (pede nível 3).',
    });
    expect(disponibilidade(equipe('ferrari'), montagemPadrao(), 'asa-dianteira', asa)).toEqual({
      liberada: true,
    });
  });

  it('só libera a atualização de fábrica para quem faz o próprio motor', () => {
    const motor = CATEGORIAS.find((item) => item.id === 'motor')?.pecas.find(
      (peca) => peca.id === 'evolucao',
    );

    if (!motor) throw new Error('motor');

    expect(disponibilidade(equipe('mclaren'), montagemPadrao(), 'motor', motor)).toEqual({
      liberada: false,
      motivo: 'Só para quem fabrica o motor. A McLaren usa motor Mercedes.',
    });
    expect(disponibilidade(equipe('mercedes'), montagemPadrao(), 'motor', motor).liberada).toBe(
      true,
    );
  });

  it('não deixa estourar o teto, e o patrocinador aumenta o teto', () => {
    const ferrari = equipe('ferrari');
    const cheia = { ...montagemPadrao(), 'asa-dianteira': 'evolucao', 'asa-traseira': 'evolucao' };
    const assoalho = CATEGORIAS.find((item) => item.id === 'assoalho')?.pecas.find(
      (peca) => peca.id === 'borda',
    );

    if (!assoalho) throw new Error('assoalho');

    expect(disponibilidade(ferrari, cheia, 'assoalho', assoalho)).toEqual({
      liberada: false,
      motivo: 'Estoura o teto de gastos em US$ 5 mi.',
    });

    const comBanco = { ...cheia, patrocinio: 'apice-bank' };
    expect(orcamento(comBanco).teto).toBe(TETO_DE_GASTOS + 3);
  });

  it('as peças mudam os números do carro', () => {
    const ferrari = equipe('ferrari');
    const padrao = atributos(ferrari, montagemPadrao());
    const rapida = atributos(ferrari, { ...montagemPadrao(), 'asa-traseira': 'arrasto' });

    expect(rapida.reta - padrao.reta).toBe(7);
    expect(rapida.curva - padrao.curva).toBe(-5);
  });

  it('o link guarda só o que mudou e ignora peças que a equipe não pode usar', () => {
    const ferrari = equipe('ferrari');
    const montagem = { ...montagemPadrao(), pneus: 'macio', motor: 'evolucao' };

    expect(paraParametros(ferrari, montagem).toString()).toBe(
      'equipe=ferrari&motor=evolucao&pneus=macio',
    );

    const lida = deParametros(new URLSearchParams('equipe=haas&motor=evolucao&pneus=macio'));
    expect(lida?.equipe.id).toBe('haas');
    expect(lida?.montagem.motor).toBe('padrao');
    expect(lida?.montagem.pneus).toBe('macio');

    expect(deParametros(new URLSearchParams('equipe=inexistente'))).toBeNull();
  });

  it('uma montagem acima do teto vinda do link perde as peças que não cabem', () => {
    const montagem = montagemValida(equipe('ferrari'), {
      'asa-dianteira': 'evolucao',
      'asa-traseira': 'evolucao',
      assoalho: 'borda',
    });

    expect(orcamento(montagem).sobra).toBeGreaterThanOrEqual(0);
    expect(montagem.assoalho).toBe('padrao');
  });
});

describe('Garagem com peças', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('troca a peça, mostra o ganho e guarda a montagem no endereço', async () => {
    const { usuario, router } = renderizar('/garagem?equipe=ferrari');

    expect(await screen.findByRole('heading', { name: 'Monte o carro da equipe' })).toBeVisible();

    const asaTraseira = screen.getByRole('group', { name: 'Asa traseira' });
    await usuario.click(within(asaTraseira).getByRole('radio', { name: /Baixa carga/ }));

    expect(router.state.location.search).toBe('?equipe=ferrari&asa-traseira=arrasto');
    expect(screen.getByText('+7')).toBeVisible();
    expect(localStorage.getItem('drs:montagem')).toBe('equipe=ferrari&asa-traseira=arrasto');
  });

  it('mostra a peça travada com o motivo', async () => {
    renderizar('/garagem?equipe=cadillac');

    const asa = await screen.findByRole('group', { name: 'Asa dianteira' });
    const evolucao = within(asa).getByRole('radio', { name: /Evolução de três elementos/ });

    expect(evolucao).toBeDisabled();
    expect(evolucao).toHaveAccessibleDescription('Fora da tecnologia da Cadillac (pede nível 3).');
  });

  it('ao trocar de equipe, tira as peças que a nova equipe não pode usar', async () => {
    const { usuario, router } = renderizar('/garagem?equipe=mercedes&motor=evolucao&pneus=duro');

    const equipes = await screen.findByRole('group', { name: 'Equipe' });
    await usuario.click(within(equipes).getByRole('radio', { name: /McLaren/ }));

    expect(router.state.location.search).toBe('?equipe=mclaren&pneus=duro');
  });

  it('abre a última montagem salva quando o endereço não traz uma', async () => {
    localStorage.setItem('drs:montagem', 'equipe=williams&pneus=macio');
    renderizar('/garagem');

    const equipes = await screen.findByRole('group', { name: 'Equipe' });
    expect(within(equipes).getByRole('radio', { name: /Williams/ })).toBeChecked();
    expect(
      within(screen.getByRole('group', { name: 'Pneus' })).getByRole('radio', { name: /Macio/ }),
    ).toBeChecked();
  });
});
