import { type EquipeDTO, paginaDePilotosSchema, type ResumoDaEquipeDTO } from '@drs/contracts';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { buscar } from '../../shared/api/http';
import { chaveDaEquipe } from '../../shared/lib/equipe';
import { nomeDaEquipe } from '../../shared/lib/traducoes';
import { listaDeEquipes } from './api';
import type { EquipeDoCartao, PilotoDoCartao } from './CartaoDaEquipe';
import { coresSugeridas } from './cores-classicas';

/** Todos os pilotos cadastrados de uma vez (o grid cabe numa página). */
const pilotosDoGrid = queryOptions({
  queryKey: ['pilotos', 'lista', 'grid'] as const,
  queryFn: ({ signal }) =>
    buscar('/pilotos?pagina=1&porPagina=50', paginaDePilotosSchema, { signal }),
  staleTime: 60 * 60_000,
});

/**
 * Junta as três fontes da página de equipes: as equipes da história (com a
 * ficha do dicionário), as equipes cadastradas (com as cores) e os pilotos.
 * Os nomes vêm de fontes diferentes, como "Red Bull" e "Red Bull Racing", e
 * se encontram pelo mesmo identificador que escolhe o símbolo da equipe.
 */
export function montarGrid(
  historia: ResumoDaEquipeDTO[],
  cadastradas: EquipeDTO[],
  pilotos: { nome: string; numero: number; equipe: EquipeDTO }[],
): EquipeDoCartao[] {
  const pilotosPorEquipe = new Map<string, PilotoDoCartao[]>();

  for (const piloto of pilotos) {
    const daEquipe = pilotosPorEquipe.get(piloto.equipe.id) ?? [];
    daEquipe.push({ nome: piloto.nome, numero: piloto.numero });
    pilotosPorEquipe.set(piloto.equipe.id, daEquipe);
  }

  const cadastradaPorChave = new Map(
    cadastradas.map((equipe) => [chaveDaEquipe(equipe.nome), equipe]),
  );
  const historiaPorChave = new Map(historia.map((equipe) => [chaveDaEquipe(equipe.nome), equipe]));
  const usadas = new Set<string>();

  function cartao(nome: string, id: string | null, cadastrada?: EquipeDTO): EquipeDoCartao {
    if (cadastrada) {
      usadas.add(cadastrada.id);
    }

    return {
      id,
      nome,
      cores: cadastrada
        ? { cor: cadastrada.cor, corSecundaria: cadastrada.corSecundaria }
        : coresSugeridas(nome),
      pilotos: (cadastrada ? (pilotosPorEquipe.get(cadastrada.id) ?? []) : []).toSorted(
        (a, b) => a.numero - b.numero,
      ),
    };
  }

  const doGrid = historia
    .filter((equipe) => equipe.noGridAtual)
    .map((equipe) =>
      cartao(equipe.nome, equipe.id, cadastradaPorChave.get(chaveDaEquipe(equipe.nome))),
    );

  const semPar = cadastradas
    .filter((equipe) => !usadas.has(equipe.id) && pilotosPorEquipe.has(equipe.id))
    .map((equipe) =>
      cartao(equipe.nome, historiaPorChave.get(chaveDaEquipe(equipe.nome))?.id ?? null, equipe),
    );

  return [...doGrid, ...semPar].toSorted((a, b) =>
    nomeDaEquipe(a.nome).localeCompare(nomeDaEquipe(b.nome), 'pt-BR'),
  );
}

export function useGridDeEquipes(historia: ResumoDaEquipeDTO[] | undefined) {
  const cadastradas = useQuery(listaDeEquipes);
  const pilotos = useQuery(pilotosDoGrid);

  return {
    equipes: montarGrid(historia ?? [], cadastradas.data ?? [], pilotos.data?.itens ?? []),
    carregando: cadastradas.isPending || pilotos.isPending,
  };
}
