import { useQuery, QueryClient, useMutation } from "@tanstack/react-query";
import { getVaults, addVault, updateVault, deleteVault } from "./actions";

// Create a new QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
    },
  },
});

export const useVaults = (userId?: string) => {
  return useQuery({
    queryKey: ["vaults"],
    queryFn: () => getVaults(userId as string),
    enabled: !!userId,
  });
};

export const useAddVault = () => {
  return useMutation({
    mutationFn: addVault,
    onSettled: () => {
      // Invalidate and refetch the vaults query
      queryClient.invalidateQueries({ queryKey: ["vaults"] });
    },
  });
};

export const useUpdateVault = () => {
  return useMutation({
    mutationFn: updateVault,
    onSettled: () => {
      // Invalidate and refetch the vaults query
      queryClient.invalidateQueries({ queryKey: ["vaults"] });
    },
  });
};

export const useDeleteVault = () => {
  return useMutation({
    mutationFn: deleteVault,
    onSettled: () => {
      // Invalidate and refetch the vaults query
      queryClient.invalidateQueries({ queryKey: ["vaults"] });
    },
  });
};
