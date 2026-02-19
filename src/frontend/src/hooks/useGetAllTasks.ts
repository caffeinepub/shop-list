import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Task } from '../backend';

export function useGetAllTasks(projectId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['tasks', projectId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks(projectId);
    },
    enabled: !!actor && !isFetching,
  });
}
