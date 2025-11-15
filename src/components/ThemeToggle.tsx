import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "system";
    }
    return "system";
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          <Button 
            variant="outline" 
            size="icon" 
            className="relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme === "dark" ? "moon" : "sun"}
                initial={{ y: -20, opacity: 0, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 20, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {theme === "dark" ? (
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                )}
              </motion.div>
            </AnimatePresence>
            <span className="sr-only">Toggle theme</span>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-36 backdrop-blur-xl bg-card/95 border-2"
        asChild
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          <DropdownMenuItem 
            onClick={() => handleThemeChange("light")} 
            className="cursor-pointer transition-all duration-150 hover:bg-accent/80"
          >
            <motion.div
              className="flex items-center w-full"
              whileHover={{ x: 2 }}
              transition={{ duration: 0.15 }}
            >
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
              {theme === "light" && (
                <motion.div
                  layoutId="theme-indicator"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.div>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleThemeChange("dark")} 
            className="cursor-pointer transition-all duration-150 hover:bg-accent/80"
          >
            <motion.div
              className="flex items-center w-full"
              whileHover={{ x: 2 }}
              transition={{ duration: 0.15 }}
            >
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
              {theme === "dark" && (
                <motion.div
                  layoutId="theme-indicator"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.div>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleThemeChange("system")} 
            className="cursor-pointer transition-all duration-150 hover:bg-accent/80"
          >
            <motion.div
              className="flex items-center w-full"
              whileHover={{ x: 2 }}
              transition={{ duration: 0.15 }}
            >
              <Monitor className="mr-2 h-4 w-4" />
              <span>System</span>
              {theme === "system" && (
                <motion.div
                  layoutId="theme-indicator"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.div>
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}