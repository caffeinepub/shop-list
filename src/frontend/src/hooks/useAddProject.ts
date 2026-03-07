import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Room } from "../backend";
import { useActor } from "./useActor";

export function useAddProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      name: string;
      clientId: bigint;
      timeline: string;
      budget: bigint;
      status: string;
      rooms: Room[];
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addProject(
        params.id,
        params.name,
        params.clientId,
        params.timeline,
        params.budget,
        params.status,
        params.rooms,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProjects"] });
    },
  });
}
