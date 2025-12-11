import { listed } from "@/temp/option";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export type TOptionsListed = (typeof listed)[0];
export default function useOptionsListed(
  userId: string,
  enabled: boolean
): UseQueryResult<TOptionsListed[], Error> {
  return useQuery({
    queryKey: ["options-listed", userId],
    queryFn: async () => {
      return await new Promise<TOptionsListed[]>((resolve) =>
        setTimeout(() => resolve(listed), 1_000)
      );
    },
    enabled: !!userId && enabled,
  });
}
