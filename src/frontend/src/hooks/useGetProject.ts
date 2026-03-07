import { useQuery } from "@tanstack/react-query";
import type { Project } from "../backend";
import { useActor } from "./useActor";

export function useGetProject(projectId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Project | null>({
    queryKey: ["project", projectId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProject(projectId);
    },
    enabled: !!actor && !isFetching,
  });
}
