import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Project } from '../backend';

export function useGetProject(projectId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Project | null>({
    queryKey: ['project', projectId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProject(projectId);
    },
    enabled: !!actor && !isFetching,
  });
}
