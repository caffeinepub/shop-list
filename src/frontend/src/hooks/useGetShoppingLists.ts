import { useQuery } from "@tanstack/react-query";
import type { ShoppingList } from "../backend";
import { useActor } from "./useActor";

export function useGetShoppingLists() {
  const { actor, isFetching } = useActor();

  return useQuery<ShoppingList[]>({
    queryKey: ["shoppingLists"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getShoppingLists();
    },
    enabled: !!actor && !isFetching,
  });
}
