// This file is now deprecated - use the AuthContext instead
// Keeping for backward compatibility
// Last updated: 2025-01-14
import { useAuth as useAuthContext } from "@/contexts/AuthContext";

export function useAuth() {
  return useAuthContext();
}