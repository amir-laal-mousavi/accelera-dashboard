import { memo, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter, Target, Clock, TrendingUp, DollarSign, Activity, Book, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardFiltersProps {
  filters: any;
  resetFilters: () => void;
  financeStats: any;
  habits: any[] | undefined;
  books: any[] | undefined;
}

const DashboardFilters = memo(function DashboardFilters({
  filters,
  resetFilters,
  financeStats,
  habits,
  books,
}: DashboardFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetFilters = useCallback(() => {
    setIsResetting(true);
    resetFilters();
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsResetting(false);
    }, 600);
  }, [resetFilters]);

  const expenseCategories = Array.from(new Set(financeStats?.expenses?.map((e: any) => e.category) || []));
  const taskAreas = ["Work", "Study", "Programming", "Fitness", "Finance", "Book", "Studying", "Self", "Research", "Startup", "Other"];
  const taskStatuses = ["Not Started", "In Progress", "Done", "Blocked"];
  const taskPriorities = ["Critical", "High", "Medium", "Low"];
  const habitFrequencies = Array.from(new Set(habits?.map((h) => h.frequency) || []));
  const bookStatuses = Array.from(new Set(books?.map((b) => b.status || "Reading") || []));

  // Check if any filters are active
  const hasActiveFilters = 
    filters.taskAreaFilter !== "all" ||
    filters.taskStatusFilter !== "all" ||
    filters.taskPriorityFilter !== "all" ||
    filters.expenseCategoryFilter !== "all" ||
    filters.habitFrequencyFilter !== "all" ||
    filters.bookStatusFilter !== "all";

  return (
    <Card className="mb-6 border-2 overflow-hidden neon-card-hover">
      {/* Compact Header Bar - Always Visible */}
      <CardHeader className="pb-3 pt-4 bg-gradient-to-r from-card via-card to-accent/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold tracking-tight">Data Filters</CardTitle>
              {hasActiveFilters && (
                <CardDescription className="text-xs mt-0.5 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {Object.values(filters).filter((v: any) => v !== "all").length} active filter{Object.values(filters).filter((v: any) => v !== "all").length !== 1 ? 's' : ''}
                  </span>
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-xs gap-1.5 h-8"
                  disabled={isResetting}
                >
                  {isResetting ? "Resetting..." : "Reset All"}
                </Button>
              </motion.div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-2 h-8 border-primary/30 hover:bg-primary/10"
            >
              {isExpanded ? (
                <>
                  Hide <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Expandable Filter Grid */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: "auto", 
              opacity: 1,
              scale: isResetting ? 0.98 : 1
            }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <CardContent className="pt-0 pb-4">
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                animate={isResetting ? {
                  opacity: [1, 0.5, 1],
                  scale: [1, 0.98, 1]
                } : {}}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {/* Task Area Filter */}
                <div className="space-y-1.5 p-3 rounded-lg border bg-card/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    <label className="text-xs font-semibold">Task Area</label>
                  </div>
                  <Select value={filters.taskAreaFilter} onValueChange={filters.setTaskAreaFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Areas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Areas</SelectItem>
                      {taskAreas.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Task Status Filter */}
                <div className="space-y-1.5 p-3 rounded-lg border bg-card/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <label className="text-xs font-semibold">Task Status</label>
                  </div>
                  <Select value={filters.taskStatusFilter} onValueChange={filters.setTaskStatusFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {taskStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Task Priority Filter */}
                <div className="space-y-1.5 p-3 rounded-lg border bg-card/50">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    <label className="text-xs font-semibold">Task Priority</label>
                  </div>
                  <Select value={filters.taskPriorityFilter} onValueChange={filters.setTaskPriorityFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      {taskPriorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Expense Category Filter */}
                <div className="space-y-1.5 p-3 rounded-lg border bg-card/50">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-3.5 w-3.5 text-primary" />
                    <label className="text-xs font-semibold">Expense Category</label>
                  </div>
                  <Select value={filters.expenseCategoryFilter} onValueChange={filters.setExpenseCategoryFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {expenseCategories.map((category) => (
                        <SelectItem key={String(category)} value={String(category)}>
                          {String(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Habit Frequency Filter */}
                <div className="space-y-1.5 p-3 rounded-lg border bg-card/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                    <label className="text-xs font-semibold">Habit Frequency</label>
                  </div>
                  <Select value={filters.habitFrequencyFilter} onValueChange={filters.setHabitFrequencyFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Frequencies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Frequencies</SelectItem>
                      {habitFrequencies.map((frequency) => (
                        <SelectItem key={String(frequency)} value={String(frequency)}>
                          {String(frequency)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Book Status Filter */}
                <div className="space-y-1.5 p-3 rounded-lg border bg-card/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Book className="h-3.5 w-3.5 text-primary" />
                    <label className="text-xs font-semibold">Book Status</label>
                  </div>
                  <Select value={filters.bookStatusFilter} onValueChange={filters.setBookStatusFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {bookStatuses.map((status) => (
                        <SelectItem key={String(status)} value={String(status)}>
                          {String(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
});

export default DashboardFilters;