import { useQueryClient } from "@tanstack/react-query";

const useQueryInvalidate = () => {
  const client = useQueryClient();

  const invalidateKey = (key: string[]) => {
    key.forEach((k) => {
      client.invalidateQueries({
        queryKey: [k],
        exact: false,
        refetchType: "active",
      });
    });
  };

  return { invalidateKey };
};

export default useQueryInvalidate;
