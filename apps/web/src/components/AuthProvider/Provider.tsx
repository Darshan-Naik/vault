import { auth } from "@vault/shared";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { AuthContext } from "./Context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);

      // Share auth session state with extension perfectly (including tokens natively)
      if (user) {
        const userJson = (user as any).toJSON();
        const apiKey = auth.app.options.apiKey;
        window.postMessage(
          {
            type: "USER_AUTHENTICATED",
            payload: { userJson, apiKey },
          },
          "*"
        );
      } else {
        window.postMessage(
          {
            type: "USER_LOGGED_OUT",
          },
          "*"
        );
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
