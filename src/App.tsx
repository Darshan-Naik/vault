import Auth from "./components/Auth";
import { useAuth } from "./components/AuthProvider";
import Main from "./components/Main";
import { Skeleton } from "./components/ui/skeleton";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <Skeleton className="h-24 w-24" />;

  if (user) {
    return <Main />;
  }
  return <Auth />;
}

export default App;
