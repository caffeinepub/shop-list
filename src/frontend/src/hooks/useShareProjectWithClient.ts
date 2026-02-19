import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';

export function useShareProjectWithClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { projectId: bigint; clientPrincipal: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.shareProjectWithClient(params.projectId, params.clientPrincipal);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['myProjects'] });
    },
  });
}
