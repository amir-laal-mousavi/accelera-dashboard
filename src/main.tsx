import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";
import NotFound from "./pages/NotFound.tsx";
import "./types/global.d.ts";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/contexts/AuthContext.tsx";

// Defer Convex client creation to runtime and guard missing envs
function RootApp() {
  const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
  if (!convexUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-lg font-semibold">Missing Convex URL</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please set VITE_CONVEX_URL in Integrations or API Keys to load the app.
          </p>
        </div>
      </div>
    );
  }
  const convex = new ConvexReactClient(convexUrl);
  return (
    <>
      <VlyToolbar />
      <InstrumentationProvider>
        <ConvexAuthProvider client={convex}>
          <AuthProvider>
            <BrowserRouter>
              <RouteSyncer />
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/auth" element={<AuthPage redirectAfterAuth="/dashboard" />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
            <Toaster />
          </AuthProvider>
        </ConvexAuthProvider>
      </InstrumentationProvider>
    </>
  );
}

// Lazy load pages for better performance
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("@/pages/Auth.tsx"));
const Dashboard = lazy(() => import("@/pages/Dashboard.tsx"));
const Settings = lazy(() => import("@/pages/Settings.tsx"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard.tsx"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement.tsx"));

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
);