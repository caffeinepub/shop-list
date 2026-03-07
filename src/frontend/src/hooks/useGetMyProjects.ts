import { useQuery } from "@tanstack/react-query";
import type { Project } from "../backend";
import { useActor } from "./useActor";

export function useGetMyProjects() {
  const { actor, isFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: ["myProjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyProjects();
    },
    enabled: !!actor && !isFetching,
  });
}
