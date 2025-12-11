import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthProvider";
import api from "@/services/api/config";

export function useUserVolumeTraded() {
  const { dbUser } = useAuthContext();

  return useQuery({
    queryKey: ["user-volume-traded", dbUser?.id],
    queryFn: async () => {
      const response = await api.get('/api/users/volume');
      return response.data.totalVolume;
    },
    enabled: !!dbUser?.id,
  });
}

