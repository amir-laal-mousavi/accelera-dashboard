import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { 
  syncTaskEdit, 
  syncTaskCreate, 
  syncTaskDelete,
  isOnline,
  processPendingTaskOperations 
} from "@/lib/offline-sync";
import { useEffect } from "react";

export function useOfflineTasks() {
  const createTaskMutation = useMutation(api.tasks.create);
  const updateTaskMutation = useMutation(api.tasks.update);
  const deleteTaskMutation = useMutation(api.tasks.remove);

  // Sync pending operations when online
  useEffect(() => {
    if (isOnline()) {
      processPendingTaskOperations(async (name: string, args: any) => {
        const [module, fn] = name.split(":");
        if (module === "tasks") {
          if (fn === "create") return await createTaskMutation(args);
          if (fn === "update") return await updateTaskMutation(args);
          if (fn === "remove") return await deleteTaskMutation(args);
        }
      });
    }
  }, [createTaskMutation, updateTaskMutation, deleteTaskMutation]);

  const createTask = async (args: any) => {
    try {
      if (isOnline()) {
        const result = await createTaskMutation(args);
        toast.success("Task created");
        return result;
      } else {
        const result = await syncTaskCreate(args);
        toast.info("Task saved offline. Will sync when online.");
        return result;
      }
    } catch (error) {
      toast.error("Failed to create task");
      throw error;
    }
  };

  const updateTask = async (args: { id: Id<"tasks">; [key: string]: any }) => {
    try {
      if (isOnline()) {
        await updateTaskMutation(args);
        toast.success("Task updated");
      } else {
        await syncTaskEdit(args.id, args);
        toast.info("Task updated offline. Will sync when online.");
      }
    } catch (error) {
      toast.error("Failed to update task");
      throw error;
    }
  };

  const deleteTask = async (id: Id<"tasks">) => {
    try {
      if (isOnline()) {
        await deleteTaskMutation({ id });
        toast.success("Task deleted");
      } else {
        await syncTaskDelete(id);
        toast.info("Task deleted offline. Will sync when online.");
      }
    } catch (error) {
      toast.error("Failed to delete task");
      throw error;
    }
  };

  return {
    createTask,
    updateTask,
    deleteTask,
  };
}
