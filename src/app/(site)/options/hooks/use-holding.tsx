import { portfolio } from "@/temp/option";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export type TOptionsHolding = (typeof portfolio)[0];
export default function useOptionsHolding(
  userId: string,
  enabled: boolean
): UseQueryResult<TOptionsHolding[], Error> {
  return useQuery({
    queryKey: ["options-holding", userId],
    queryFn: async () => {
      return await new Promise<TOptionsHolding[]>((resolve) =>
        setTimeout(() => resolve(portfolio), 1_000)
      );
    },
    enabled: !!userId && enabled,
  });
}
