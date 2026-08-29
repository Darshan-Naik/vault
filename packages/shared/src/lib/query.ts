import { useEffect, useState } from "react";
import { useMutate } from "qortex-react";
import { addVault, updateVault, deleteVault, subscribeVaults } from "./actions";
import { TVault } from "./types";

export const useVaults = (userId?: string, masterKey?: string | null) => {
  const [data, setData] = useState<TVault[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(!!userId && !!masterKey);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || !masterKey) {
      setData(undefined);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeVaults(
      userId,
      masterKey,
      (vaults) => {
        setData(vaults);
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [userId, masterKey]);

  return { data, isLoading, error };
};

export const useAddVault = () => {
  return useMutate(addVault);
};

export const useUpdateVault = () => {
  return useMutate(updateVault);
};

export const useDeleteVault = () => {
  return useMutate(deleteVault);
};
