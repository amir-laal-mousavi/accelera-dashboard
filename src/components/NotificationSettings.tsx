import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BellOff, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function NotificationSettings() {
  const { permission, requestPermission, isSupported } = useNotifications();

  if (!isSupported) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Push notifications are not supported in this browser.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get reminders for tasks, habits, and important events
        </CardDescription>
      </CardHeader>
      <CardContent>
        {permission === "default" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enable notifications to receive timely reminders for your tasks and habits.
            </p>
            <Button onClick={requestPermission} className="w-full gap-2">
              <Bell className="h-4 w-4" />
              Enable Notifications
            </Button>
          </div>
        )}
        
        {permission === "granted" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Bell className="h-4 w-4" />
              <span className="text-sm font-medium">Notifications enabled</span>
            </div>
            <p className="text-xs text-muted-foreground">
              You'll receive reminders for tasks and habits at the times you set.
            </p>
          </div>
        )}
        
        {permission === "denied" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-destructive">
              <BellOff className="h-4 w-4" />
              <span className="text-sm font-medium">Notifications blocked</span>
            </div>
            <p className="text-xs text-muted-foreground">
              To enable notifications, please update your browser settings and refresh the page.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
