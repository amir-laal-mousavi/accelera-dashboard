import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, LayoutDashboard, LogOut, Menu, Shield, User } from "lucide-react";

export function LogoDropdown() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem onClick={() => navigate("/")}>
          <Home className="mr-2 h-4 w-4" />
          Home
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/dashboard")}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/admin")}>
              <Shield className="mr-2 h-4 w-4" />
              Admin Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/admin/users")}>
              <User className="mr-2 h-4 w-4" />
              User Management
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}