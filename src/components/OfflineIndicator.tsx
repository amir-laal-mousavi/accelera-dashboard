import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { watchOnlineStatus, getPendingOperations } from "@/lib/offline-sync";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const cleanup = watchOnlineStatus((online) => {
      setIsOnline(online);
      if (online) {
        toast.success("Back online! Syncing changes...");
        syncPendingOperations();
      } else {
        toast.warning("You're offline. Changes will sync when reconnected.");
      }
    });

    updatePendingCount();

    return cleanup;
  }, []);

  const updatePendingCount = async () => {
    const operations = await getPendingOperations();
    setPendingCount(operations.length);
  };

  const syncPendingOperations = async () => {
    await updatePendingCount();
    // Trigger sync logic here
  };

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge
        variant={isOnline ? "default" : "destructive"}
        className="flex items-center gap-2 px-3 py-2 shadow-lg"
      >
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>Online</span>
            {pendingCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 ml-2"
                onClick={syncPendingOperations}
              >
                Sync {pendingCount}
              </Button>
            )}
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Offline</span>
            {pendingCount > 0 && <span className="ml-1">({pendingCount} pending)</span>}
          </>
        )}
      </Badge>
    </div>
  );
}
