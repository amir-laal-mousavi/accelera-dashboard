import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationSettings } from "@/components/NotificationSettings";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect } from "react";

export default function Settings() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">Settings</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Page Title */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Preferences</h2>
            <p className="text-muted-foreground">
              Manage your notification settings and app preferences
            </p>
          </div>

          {/* Notifications Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Notifications</h3>
            <NotificationSettings />
          </div>

          {/* Additional Settings Sections */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Appearance</h3>
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>
                  Choose your preferred color scheme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current theme</span>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data & Privacy */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Data & Privacy</h3>
            <Card>
              <CardHeader>
                <CardTitle>Offline Data</CardTitle>
                <CardDescription>
                  Your data is stored locally for offline access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tasks and habits are automatically synced when you're online. 
                  Changes made offline will be uploaded once connection is restored.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">About</h3>
            <Card>
              <CardHeader>
                <CardTitle>ACCELERA Planner</CardTitle>
                <CardDescription>Version 1.0.0</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Your all-in-one productivity dashboard for tracking tasks, habits, 
                  health, workouts, reading, and finances.
                </p>
                <p className="text-xs text-muted-foreground">
                  Powered by{" "}
                  <a
                    href="https://vly.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-primary transition-colors"
                  >
                    vly.ai
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}