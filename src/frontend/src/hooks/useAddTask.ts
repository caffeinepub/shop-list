import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useAddTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      title: string;
      description: string;
      status: string;
      deadline: string;
      projectId: bigint;
      roomId: bigint;
      type_: string;
      assigned: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTask(
        params.id,
        params.title,
        params.description,
        params.status,
        params.deadline,
        params.projectId,
        params.roomId,
        params.type_,
        params.assigned
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId.toString()] });
    },
  });
}
