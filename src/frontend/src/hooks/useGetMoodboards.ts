import { useQuery } from "@tanstack/react-query";
import type { Moodboard } from "../backend";
import { useActor } from "./useActor";

export function useGetMoodboards(projectId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Moodboard[]>({
    queryKey: ["moodboards", projectId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const userData = await actor.getAllUserData();
      return userData.moodboards.filter((m) => m.projectId === projectId);
    },
    enabled: !!actor && !isFetching,
  });
}
