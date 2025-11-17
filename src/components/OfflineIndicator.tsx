import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { watchOnlineStatus, getPendingOperations } from "@/lib/offline-sync";
import { processPendingTaskOperations } from "@/lib/offline-sync";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  
  const createTaskMutation = useMutation((api as any).tasks.create);
  const updateTaskMutation = useMutation((api as any).tasks.update);
  const deleteTaskMutation = useMutation((api as any).tasks.remove);

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
    try {
      await processPendingTaskOperations(async (name: string, args: any) => {
        const [module, fn] = name.split(":");
        if (module === "tasks") {
          if (fn === "create") return await createTaskMutation(args);
          if (fn === "update") return await updateTaskMutation(args);
          if (fn === "remove") return await deleteTaskMutation(args);
        }
      });
      await updatePendingCount();
      toast.success("All changes synced!");
    } catch (error) {
      toast.error("Failed to sync some changes");
    }
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