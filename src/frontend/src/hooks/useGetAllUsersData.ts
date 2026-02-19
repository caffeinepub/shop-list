import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { AllUserData } from '../backend';

export function useGetAllUsersData() {
  const { actor, isFetching } = useActor();

  return useQuery<AllUserData[]>({
    queryKey: ['allUsersData'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsersData();
    },
    enabled: !!actor && !isFetching,
  });
}
