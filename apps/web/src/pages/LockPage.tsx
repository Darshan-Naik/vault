import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useLock } from "@/components/LockProvider";
import LockScreen from "@/components/LockScreen";

export default function LockPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isLocked } = useLock();
    const returnTo = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";
    const wasLocked = useRef(true);

    // When lock state changes from locked → unlocked, navigate back
    useEffect(() => {
        if (wasLocked.current && !isLocked) {
            navigate(returnTo, { replace: true });
        }
        wasLocked.current = isLocked;
    }, [isLocked, navigate, returnTo]);

    return <LockScreen />;
}
