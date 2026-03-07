import { useQuery } from "@tanstack/react-query";
import type { AllUserData } from "../backend";
import { useActor } from "./useActor";

export function useGetAllUsersData() {
  const { actor, isFetching } = useActor();

  return useQuery<AllUserData[]>({
    queryKey: ["allUsersData"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsersData();
    },
    enabled: !!actor && !isFetching,
  });
}
