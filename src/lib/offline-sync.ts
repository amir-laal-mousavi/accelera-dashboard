import { openDB, type DBSchema, type IDBPDatabase } from "idb";

interface OfflineDB extends DBSchema {
  tasks: {
    key: string;
    value: any;
  };
  habits: {
    key: string;
    value: any;
  };
  pendingOperations: {
    key: number;
    value: {
      id: number;
      type: "create" | "update" | "delete";
      entity: string;
      payload: any;
      timestamp: number;
    };
    indexes: { timestamp: number };
  };
  metadata: {
    key: string;
    value: {
      lastSync: number;
      isOnline: boolean;
    };
  };
}

let db: IDBPDatabase<OfflineDB> | null = null;

export async function initOfflineDB() {
  if (db) return db;

  db = await openDB<OfflineDB>("accelera-offline", 1, {
    upgrade(database) {
      // Create object stores
      if (!database.objectStoreNames.contains("tasks")) {
        database.createObjectStore("tasks");
      }
      if (!database.objectStoreNames.contains("habits")) {
        database.createObjectStore("habits");
      }
      if (!database.objectStoreNames.contains("metadata")) {
        database.createObjectStore("metadata");
      }
      if (!database.objectStoreNames.contains("pendingOperations")) {
        const store = database.createObjectStore("pendingOperations", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("timestamp", "timestamp");
      }
    },
  });

  return db;
}

export async function cacheData(storeName: "tasks" | "habits", key: string, data: any) {
  const database = await initOfflineDB();
  await database.put(storeName, data, key);
}

export async function getCachedData(storeName: "tasks" | "habits", key: string) {
  const database = await initOfflineDB();
  return await database.get(storeName, key);
}

export async function getAllCachedData(storeName: "tasks" | "habits") {
  const database = await initOfflineDB();
  return await database.getAll(storeName);
}

export async function queueOperation(
  type: "create" | "update" | "delete",
  entity: string,
  payload: any
) {
  const database = await initOfflineDB();
  await database.add("pendingOperations", {
    id: Date.now(),
    type,
    entity,
    payload,
    timestamp: Date.now(),
  });
}

export async function getPendingOperations() {
  const database = await initOfflineDB();
  return await database.getAll("pendingOperations");
}

export async function clearPendingOperation(id: number) {
  const database = await initOfflineDB();
  await database.delete("pendingOperations", id);
}

export async function updateMetadata(key: string, value: any) {
  const database = await initOfflineDB();
  await database.put("metadata", value, key);
}

export async function getMetadata(key: string) {
  const database = await initOfflineDB();
  return await database.get("metadata", key);
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function watchOnlineStatus(callback: (isOnline: boolean) => void) {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

export async function syncTaskEdit(taskId: string, updates: any) {
  if (isOnline()) {
    return updates;
  }
  
  await queueOperation("update", "tasks", { id: taskId, ...updates });
  await cacheData("tasks", taskId, updates);
  return updates;
}

export async function syncTaskCreate(task: any) {
  if (isOnline()) {
    return task;
  }
  
  const tempId = `temp_${Date.now()}`;
  await queueOperation("create", "tasks", { ...task, tempId });
  await cacheData("tasks", tempId, task);
  return { ...task, _id: tempId };
}

export async function syncTaskDelete(taskId: string) {
  if (isOnline()) {
    return true;
  }
  
  await queueOperation("delete", "tasks", { id: taskId });
  return true;
}

export async function processPendingTaskOperations(
  convexMutation: (name: string, args: any) => Promise<any>
) {
  const operations = await getPendingOperations();
  
  for (const op of operations) {
    if (op.entity !== "tasks") continue;
    
    try {
      switch (op.type) {
        case "create":
          await convexMutation("tasks:create", op.payload);
          break;
        case "update":
          await convexMutation("tasks:update", op.payload);
          break;
        case "delete":
          await convexMutation("tasks:remove", { id: op.payload.id });
          break;
      }
      
      await clearPendingOperation(op.id);
    } catch (error) {
      console.error("Failed to sync operation:", error);
    }
  }
}