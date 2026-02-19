import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Project } from '../backend';

export function useGetMyProjects() {
  const { actor, isFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: ['myProjects'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyProjects();
    },
    enabled: !!actor && !isFetching,
  });
}
