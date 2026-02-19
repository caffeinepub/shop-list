import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ProductLibrary } from '../backend';

export function useGetProductLibrary() {
  const { actor, isFetching } = useActor();

  return useQuery<ProductLibrary[]>({
    queryKey: ['productLibrary'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProductLibrary();
    },
    enabled: !!actor && !isFetching,
  });
}
