import { historiaDosCampeoesSchema, temporadaHistoricaSchema } from '@drs/contracts';
import { queryOptions } from '@tanstack/react-query';
import { buscar } from '../../shared/api/http';

const DEZ_SEGUNDOS = 10_000;

export const campeoesDaHistoria = queryOptions({
  queryKey: ['historia', 'campeoes'],
  queryFn: ({ signal }) => buscar('/historia/campeoes', historiaDosCampeoesSchema, { signal }),
  staleTime: 60 * 60_000,
  refetchInterval: (consulta) => ((consulta.state.data?.faltando ?? 0) > 0 ? DEZ_SEGUNDOS : false),
});

export function temporadaHistorica(ano: string) {
  return queryOptions({
    queryKey: ['historia', 'temporada', ano],
    queryFn: ({ signal }) =>
      buscar(`/historia/${encodeURIComponent(ano)}`, temporadaHistoricaSchema, { signal }),
    staleTime: 24 * 60 * 60_000,
  });
}
