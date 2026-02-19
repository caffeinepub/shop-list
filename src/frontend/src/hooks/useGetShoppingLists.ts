import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ShoppingList } from '../backend';

export function useGetShoppingLists() {
  const { actor, isFetching } = useActor();

  return useQuery<ShoppingList[]>({
    queryKey: ['shoppingLists'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getShoppingLists();
    },
    enabled: !!actor && !isFetching,
  });
}
