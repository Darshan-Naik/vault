import { useQuery, useMutate } from "qortex-react";
import { getVaults, addVault, updateVault, deleteVault } from "./actions";

export const useVaults = (userId?: string, masterKey?: string | null) => {
  return useQuery(["vaults", userId], {
    fetcher: () => getVaults(userId as string, masterKey as string),
    enabled: !!userId && !!masterKey,
  });
};

export const useAddVault = () => {
  return useMutate(addVault, {
    queryKey: ["vaults"],
  });
};

export const useUpdateVault = () => {
  return useMutate(updateVault, {
    queryKey: ["vaults"],
  });
};

export const useDeleteVault = () => {
  return useMutate(deleteVault, {
    queryKey: ["vaults"],
  });
};
