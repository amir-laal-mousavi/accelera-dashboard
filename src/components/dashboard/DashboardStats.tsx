import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Brain, DollarSign, Book, TrendingUp, TrendingDown } from "lucide-react";
import { TaskForm } from "./TaskForm";
import { ExpenseForm } from "./ExpenseForm";
import { WorkoutForm } from "./WorkoutForm";
import { BookForm } from "./BookForm";

interface DashboardStatsProps {
  tasks: any[];
  taskStats: any;
  dailyStats: any;
  financeStats: any;
  readingStats: any;
  books: any[];
  filters: any;
  startDate: number;
  endDate: number;
}

const DashboardStats = memo(function DashboardStats({
  tasks,
  taskStats,
  dailyStats,
  financeStats,
  readingStats,
  books,
  filters,
  startDate,
  endDate,
}: DashboardStatsProps) {
  // Apply filters
  const filteredTasks = tasks?.filter((task) => {
    const dateInRange = task.scheduled && task.scheduled >= startDate && task.scheduled <= endDate;
    const areaMatch = filters.taskAreaFilter === "all" || task.area === filters.taskAreaFilter;
    const statusMatch = filters.taskStatusFilter === "all" || task.status === filters.taskStatusFilter;
    const priorityMatch = filters.taskPriorityFilter === "all" || task.priority === filters.taskPriorityFilter;
    return dateInRange && areaMatch && statusMatch && priorityMatch;
  }) || [];

  const filteredBooks = books?.filter((book) => {
    return filters.bookStatusFilter === "all" || book.status === filters.bookStatusFilter;
  }) || [];

  const filteredExpenses = financeStats?.expenses?.filter((expense: any) => {
    return filters.expenseCategoryFilter === "all" || expense.category === filters.expenseCategoryFilter;
  }) || [];

  const filteredTaskStats = {
    total: filteredTasks.length,
    completed: filteredTasks.filter((t) => t.done).length,
    pending: filteredTasks.filter((t) => !t.done).length,
    completionRate: filteredTasks.length > 0 ? (filteredTasks.filter((t) => t.done).length / filteredTasks.length) * 100 : 0,
  };

  const filteredExpenseTotal = filteredExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
          <TaskForm />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{filteredTaskStats.completionRate.toFixed(0)}%</div>
          <p className="text-xs text-muted-foreground">
            {filteredTaskStats.completed} of {filteredTaskStats.total} tasks
          </p>
          <Progress value={filteredTaskStats.completionRate || 0} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dailyStats?.avgProductivity.toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">Average score</p>
          <div className="flex items-center mt-2">
            {dailyStats && dailyStats.avgProductivity > 75 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-orange-500 mr-1" />
            )}
            <span className="text-xs text-muted-foreground">
              {dailyStats && dailyStats.avgProductivity > 75 ? "Excellent" : "Room for improvement"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Filtered Expenses</CardTitle>
          <ExpenseForm />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${filteredExpenseTotal.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {filteredExpenses.length} expenses
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Net: ${financeStats?.netBalance.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reading Progress</CardTitle>
          <BookForm />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{readingStats?.totalPages || 0}</div>
          <p className="text-xs text-muted-foreground">Pages read</p>
          <p className="text-xs text-muted-foreground mt-1">
            {filteredBooks.length} books
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

export default DashboardStats;