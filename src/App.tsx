import Auth from "./components/Auth";
import { useAuth } from "./components/AuthProvider";
import { useLock } from "./components/LockProvider";
import Main from "./components/Main";
import LockScreen from "./components/LockScreen";
import { Skeleton } from "./components/ui/skeleton";

function App() {
  const { user, loading } = useAuth();
  const { isLocked } = useLock();

  if (loading) return <Skeleton className="h-24 w-24" />;

  if (!user) {
    return <Auth />;
  }

  if (isLocked) {
    return <LockScreen />;
  }

  return <Main />;
}

export default App;
