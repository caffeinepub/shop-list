import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserProfile } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.getCallerUserProfile();
      return result;
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Custom loading state that properly reflects actor dependency
  const isLoading = actorFetching || (!!actor && query.isLoading);
  const isFetched = !actorFetching && !!actor && query.isFetched;

  return {
    ...query,
    isLoading,
    isFetched,
  };
}
