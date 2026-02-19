import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useAddToProductLibrary() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      name: string;
      image: string;
      price: bigint;
      shop: string;
      description: string;
      type_: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToProductLibrary(
        params.id,
        params.name,
        params.image,
        params.price,
        params.shop,
        params.description,
        params.type_
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productLibrary'] });
    },
  });
}
