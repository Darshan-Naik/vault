import { useContext } from "react";
import { LockContext } from "./Context";

export const useLock = () => {
  const context = useContext(LockContext);
  if (!context) {
    throw new Error("useLock must be used within LockProvider");
  }
  return context;
};

