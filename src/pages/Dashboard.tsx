// Cache-bust: v1.0.13 - Force cache invalidation for Router context fix
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState, useMemo } from "react";
import { TrialBanner } from "@/components/TrialBanner";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { motion } from "framer-motion";
import { Loader2, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoDropdown } from "@/components/LogoDropdown";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import HabitsSection from "@/components/dashboard/HabitsSection";
import DailyView from "@/components/dashboard/DailyView";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  // Force Daily as default - no conditional logic
  const [timeRange, setTimeRange] = useState<"daily" | "week" | "month" | "year">("daily");
  const [isInitialized, setIsInitialized] = useState(false);

  // Ensure Daily tab is always rendered first, even before data loads
  useEffect(() => {
    setIsInitialized(true);
  }, []);
  
  // Filter states
  const [taskAreaFilter, setTaskAreaFilter] = useState<string>("all");
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>("all");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>("all");
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>("all");
  const [habitFrequencyFilter, setHabitFrequencyFilter] = useState<string>("all");
  const [bookStatusFilter, setBookStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Calculate date ranges - memoized to prevent infinite loops
  const { startDate: startDateTime, endDateTime } = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now);
    if (timeRange === "daily") {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeRange === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === "month") {
      startDate.setDate(now.getDate() - 30);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }
    startDate.setHours(0, 0, 0, 0);
    
    return {
      startDate: startDate.getTime(),
      endDateTime: now.getTime(),
    };
  }, [timeRange]);

  // Fetch all data
  const tasks = useQuery((api as any).tasks.list, {});
  const taskStats = useQuery((api as any).tasks.getStats, {
    startDate: startDateTime,
    endDate: endDateTime,
  });
  const dailyLogs = useQuery((api as any).dailyLogs.list, {
    startDate: startDateTime,
    endDate: endDateTime,
  });
  const dailyStats = useQuery((api as any).dailyLogs.getStats, {
    startDate: startDateTime,
    endDate: endDateTime,
  });
  const habits = useQuery((api as any).habits.list, {});
  const books = useQuery((api as any).books.list, {});
  const readingStats = useQuery((api as any).books.getReadingStats, {
    startDate: startDateTime,
    endDate: endDateTime,
  });
  const financeStats = useQuery((api as any).finance.getFinanceStats, {
    startDate: startDateTime,
    endDate: endDateTime,
  });
  const workoutStats = useQuery((api as any).workouts.getStats, {
    startDate: startDateTime,
    endDate: endDateTime,
  });
  const waterLogs = useQuery((api as any).health.listWater, {
    startDate: startDateTime,
    endDate: endDateTime,
  });
  const sleepLogs = useQuery((api as any).health.listSleep, {
    startDate: startDateTime,
    endDate: endDateTime,
  });

  // Memoize filtered habits to prevent infinite loops
  const filteredHabits = useMemo(() => {
    if (!habits) return [];
    return habits.filter((habit: any) => {
      return habitFrequencyFilter === "all" || habit.frequency === habitFrequencyFilter;
    });
  }, [habits, habitFrequencyFilter]);

  // Show loading only for auth, not for data
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Allow rendering even if data is still loading - Daily tab must show immediately
  const isDataLoading = !tasks || !taskStats || !dailyLogs || !habits || !books || !financeStats || !workoutStats;

  const filters = {
    taskAreaFilter,
    setTaskAreaFilter,
    taskStatusFilter,
    setTaskStatusFilter,
    taskPriorityFilter,
    setTaskPriorityFilter,
    expenseCategoryFilter,
    setExpenseCategoryFilter,
    habitFrequencyFilter,
    setHabitFrequencyFilter,
    bookStatusFilter,
    setBookStatusFilter,
  };

  const resetFilters = () => {
    setTaskAreaFilter("all");
    setTaskStatusFilter("all");
    setTaskPriorityFilter("all");
    setExpenseCategoryFilter("all");
    setHabitFrequencyFilter("all");
    setBookStatusFilter("all");
  };

  // Show Daily View when daily tab is selected
  const showDailyView = timeRange === "daily";

  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <img src="./logo.svg" alt="Logo" className="h-8 w-8 md:h-10 md:w-10 cursor-pointer" onClick={() => navigate("/")} loading="eager" />
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-2xl font-bold tracking-tight">ACCELERA Dashboard</h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden md:block">Welcome back, {user.name || user.email || "User"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => signOut()}>
              Sign Out
            </Button>
            <LogoDropdown />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:py-8 pb-20 md:pb-8">
        <TrialBanner />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-4">
          {/* Time Range Selector - Daily is ALWAYS first and emphasized with neon glow */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">View Mode</span>
            </div>
            <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
              <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50">
                <TabsTrigger value="daily" className="hover:bg-accent/30 transition-all">
                  Daily
                </TabsTrigger>
                <TabsTrigger value="week" className="hover:bg-accent/30 transition-all">Week</TabsTrigger>
                <TabsTrigger value="month" className="hover:bg-accent/30 transition-all">Month</TabsTrigger>
                <TabsTrigger value="year" className="hover:bg-accent/30 transition-all">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* ALWAYS render Daily view first - no conditional delays */}
          {timeRange === "daily" ? (
            <DailyView />
          ) : (
            <>
              <DashboardFilters 
                filters={filters}
                resetFilters={resetFilters}
                financeStats={financeStats}
                habits={habits}
                books={books}
              />

              {isDataLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <DashboardStats
                    tasks={tasks || []}
                    taskStats={taskStats}
                    dailyStats={dailyStats}
                    financeStats={financeStats}
                    readingStats={readingStats}
                    books={books || []}
                    filters={filters}
                    startDate={startDateTime}
                    endDate={endDateTime}
                  />

                  <DashboardCharts
                    tasks={tasks || []}
                    dailyLogs={dailyLogs || []}
                    financeStats={financeStats}
                    workoutStats={workoutStats}
                    sleepLogs={sleepLogs || []}
                    filters={filters}
                    startDate={startDateTime}
                    endDate={endDateTime}
                  />

                  <HabitsSection 
                    habits={filteredHabits} 
                    startDate={startDateTime} 
                    endDate={endDateTime} 
                  />
                </>
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}