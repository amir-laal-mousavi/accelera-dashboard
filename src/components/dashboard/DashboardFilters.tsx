import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter, Target, Clock, TrendingUp, DollarSign, Activity, Book } from "lucide-react";

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
  const expenseCategories = Array.from(new Set(financeStats?.expenses?.map((e: any) => e.category) || []));
  const taskAreas = ["Work", "Study", "Programming", "Fitness", "Finance", "Book", "Studying", "Self", "Research", "Startup", "Other"];
  const taskStatuses = ["Not Started", "In Progress", "Done", "Blocked"];
  const taskPriorities = ["Critical", "High", "Medium", "Low"];
  const habitFrequencies = Array.from(new Set(habits?.map((h) => h.frequency) || []));
  const bookStatuses = Array.from(new Set(books?.map((b) => b.status || "Reading") || []));

  return (
    <Card className="mb-6 border-2">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Data Filters</CardTitle>
            <CardDescription className="mt-1">Refine your dashboard data by various criteria</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Reset All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Task Filters */}
          <div className="space-y-2 p-4 rounded-lg border bg-card/50">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-primary" />
              <label className="text-sm font-semibold">Task Area</label>
            </div>
            <Select value={filters.taskAreaFilter} onValueChange={filters.setTaskAreaFilter}>
              <SelectTrigger className="border-2">
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

          <div className="space-y-2 p-4 rounded-lg border bg-card/50">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-primary" />
              <label className="text-sm font-semibold">Task Status</label>
            </div>
            <Select value={filters.taskStatusFilter} onValueChange={filters.setTaskStatusFilter}>
              <SelectTrigger className="border-2">
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

          <div className="space-y-2 p-4 rounded-lg border bg-card/50">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <label className="text-sm font-semibold">Task Priority</label>
            </div>
            <Select value={filters.taskPriorityFilter} onValueChange={filters.setTaskPriorityFilter}>
              <SelectTrigger className="border-2">
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

          {/* Expense Filter */}
          <div className="space-y-2 p-4 rounded-lg border bg-card/50">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-primary" />
              <label className="text-sm font-semibold">Expense Category</label>
            </div>
            <Select value={filters.expenseCategoryFilter} onValueChange={filters.setExpenseCategoryFilter}>
              <SelectTrigger className="border-2">
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

          {/* Habit Filter */}
          <div className="space-y-2 p-4 rounded-lg border bg-card/50">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-primary" />
              <label className="text-sm font-semibold">Habit Frequency</label>
            </div>
            <Select value={filters.habitFrequencyFilter} onValueChange={filters.setHabitFrequencyFilter}>
              <SelectTrigger className="border-2">
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

          {/* Book Filter */}
          <div className="space-y-2 p-4 rounded-lg border bg-card/50">
            <div className="flex items-center gap-2 mb-3">
              <Book className="h-4 w-4 text-primary" />
              <label className="text-sm font-semibold">Book Status</label>
            </div>
            <Select value={filters.bookStatusFilter} onValueChange={filters.setBookStatusFilter}>
              <SelectTrigger className="border-2">
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
        </div>
      </CardContent>
    </Card>
  );
});

export default DashboardFilters;
