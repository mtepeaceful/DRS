import { useQuery } from '@tanstack/react-query';
import { semAcento } from '../../shared/lib/texto';
import { equipesDaHistoria } from '../dicionario/api';
import { useLinkDoPiloto } from '../pilotos-da-historia/api';
import { pilotosDoGrid } from '../pilotos/api';

/**
 * Liga os nomes da classificação aos perfis. O piloto vai para o perfil do grid
 * quando está cadastrado e, se não estiver, para a ficha da história da F1. A
 * equipe vai para a ficha do dicionário. Sem perfil, não há link.
 */
export function useLinksDaClassificacao() {
  const { data: doGrid } = useQuery({
    ...pilotosDoGrid,
    select: (pagina) => new Map(pagina.itens.map((piloto) => [semAcento(piloto.nome), piloto.id])),
  });
  const { data: equipes } = useQuery({
    ...equipesDaHistoria,
    select: (lista) => new Map(lista.map((equipe) => [semAcento(equipe.nome), equipe.id])),
  });
  const daHistoria = useLinkDoPiloto();

  return {
    piloto(nome: string) {
      const id = doGrid?.get(semAcento(nome));

      return id ? `/pilotos/${id}` : daHistoria(nome);
    },
    equipe(nome: string) {
      const id = equipes?.get(semAcento(nome));

      return id ? `/equipes/${encodeURIComponent(id)}` : null;
    },
  };
}
