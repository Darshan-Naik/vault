import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
import AppLayout from "@/components/AppLayout";

// Lazy-loaded page components for code splitting
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const SetupPage = lazy(() => import("@/pages/SetupPage"));
const UnlockPage = lazy(() => import("@/pages/UnlockPage"));
const RecoveryPage = lazy(() => import("@/pages/RecoveryPage"));
const LockPage = lazy(() => import("@/pages/LockPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const AddNewPage = lazy(() => import("@/pages/AddNewPage"));
const SecuritySettingsPage = lazy(() => import("@/pages/SecuritySettingsPage"));
const LockSettingsPage = lazy(() => import("@/pages/LockSettingsPage"));
const SecurityInfoPage = lazy(() => import("@/pages/SecurityInfoPage"));

function SuspenseWrapper() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                    <div className="flash-loading">
                        <img src="/logo.jpeg" alt="Vault" />
                    </div>
                </div>
            }
        >
            <Outlet />
        </Suspense>
    );
}

export const router = createBrowserRouter([
    {
        element: <SuspenseWrapper />,
        children: [
            // Public routes (redirect to dashboard if already logged in)
            {
                element: <PublicRoute />,
                children: [
                    { path: "/login", element: <LoginPage /> },
                ],
            },

            // Public routes (accessible regardless of auth state)
            { path: "/privacy", element: <PrivacyPage /> },
            { path: "/about", element: <AboutPage /> },
            { path: "/security", element: <SecurityInfoPage /> },

            // Protected routes (require authentication)
            {
                element: <ProtectedRoute />,
                children: [
                    // Auth flow pages (no shared header)
                    { path: "/setup", element: <SetupPage /> },
                    { path: "/unlock", element: <UnlockPage /> },
                    { path: "/recovery", element: <RecoveryPage /> },
                    { path: "/lock", element: <LockPage /> },

                    // Fully authenticated pages with shared Header via AppLayout
                    {
                        element: <AppLayout />,
                        children: [
                            { path: "/", element: <DashboardPage /> },
                            { path: "/vault/:id", element: <DashboardPage /> },
                            { path: "/new", element: <AddNewPage /> },
                            { path: "/settings/security", element: <SecuritySettingsPage /> },
                            { path: "/settings/lock", element: <LockSettingsPage /> },
                        ],
                    },
                ],
            },

            // Catch-all — redirect to login
            { path: "*", element: <LoginPage /> },
        ],
    },
]);
