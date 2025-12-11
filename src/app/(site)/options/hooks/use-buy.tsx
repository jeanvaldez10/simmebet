import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { options } from "@/temp/option";

export type TOptionsBuy = (typeof options)[0];

export default function useOptionsBuy(): UseQueryResult<TOptionsBuy[], Error> {
  return useQuery({
    queryKey: ["options-buy"],
    queryFn: async () => {
      const response = await fetch('/api/options');
      if (!response.ok) {
        throw new Error('Failed to fetch options');
      }
      
      const { options } = await response.json();
      return options;
    },
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
  });
}
