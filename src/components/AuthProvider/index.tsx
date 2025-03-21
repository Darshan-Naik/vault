import { useContext } from "react";
import { AuthContext } from "./Context";

export function useAuth() {
  return useContext(AuthContext);
}
