import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Product } from '../backend';

export function useAddRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      projectId: bigint;
      id: bigint;
      name: string;
      area: bigint;
      notes: string;
      category: string;
      budget: bigint;
      products: Product[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addRoom(
        params.projectId,
        params.id,
        params.name,
        params.area,
        params.notes,
        params.category,
        params.budget,
        params.products
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['myProjects'] });
    },
  });
}
