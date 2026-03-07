import { useQuery } from "@tanstack/react-query";
import type { Task } from "../backend";
import { useActor } from "./useActor";

export function useGetAllTasks(projectId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ["tasks", projectId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks(projectId);
    },
    enabled: !!actor && !isFetching,
  });
}
