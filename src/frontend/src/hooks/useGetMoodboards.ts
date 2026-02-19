import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Moodboard } from '../backend';

export function useGetMoodboards(projectId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Moodboard[]>({
    queryKey: ['moodboards', projectId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const userData = await actor.getAllUserData();
      return userData.moodboards.filter((m) => m.projectId === projectId);
    },
    enabled: !!actor && !isFetching,
  });
}
