import { painelSchema } from '@drs/contracts';
import { queryOptions } from '@tanstack/react-query';
import { buscar } from '../../shared/api/http';

export const painel = queryOptions({
  queryKey: ['painel'],
  queryFn: ({ signal }) => buscar('/painel', painelSchema, { signal }),
  staleTime: 5 * 60_000,
});
