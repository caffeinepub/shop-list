import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Product } from '../backend';

export function useAddShoppingList() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      name: string;
      total: bigint;
      discount: bigint;
      shop: string;
      products: Product[];
      status: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addShoppingList(
        params.id,
        params.name,
        params.total,
        params.discount,
        params.shop,
        params.products,
        params.status
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingLists'] });
    },
  });
}
