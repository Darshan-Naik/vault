import { Outlet } from "react-router-dom";
import Header from "@/components/Main/Header";

/**
 * Shared layout for all authenticated pages.
 * Provides the Header + page body wrapper.
 */
export default function AppLayout() {
    return (
        <div className="h-screen flex flex-col overflow-hidden w-screen bg-background">
            <Header />
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
}
