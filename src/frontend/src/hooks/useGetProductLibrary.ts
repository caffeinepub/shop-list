import { useQuery } from "@tanstack/react-query";
import type { ProductLibrary } from "../backend";
import { useActor } from "./useActor";

export function useGetProductLibrary() {
  const { actor, isFetching } = useActor();

  return useQuery<ProductLibrary[]>({
    queryKey: ["productLibrary"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProductLibrary();
    },
    enabled: !!actor && !isFetching,
  });
}
