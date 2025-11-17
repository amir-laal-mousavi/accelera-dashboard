// This file is now deprecated - use the AuthContext instead
// Keeping for backward compatibility
import { useAuth as useAuthContext } from "@/contexts/AuthContext";

export function useAuth() {
  return useAuthContext();
}