import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DashboardChartsProps {
  tasks: any[];
  dailyLogs: any[];
  financeStats: any;
  workoutStats: any;
  sleepLogs: any[];
  filters: any;
  startDate: number;
  endDate: number;
}

const DashboardCharts = memo(function DashboardCharts({
  tasks,
  dailyLogs,
  financeStats,
  workoutStats,
  sleepLogs,
  filters,
  startDate,
  endDate,
}: DashboardChartsProps) {
  // Apply filters
  const filteredTasks = tasks?.filter((task) => {
    const dateInRange = task.scheduled && task.scheduled >= startDate && task.scheduled <= endDate;
    const areaMatch = filters.taskAreaFilter === "all" || task.area === filters.taskAreaFilter;
    const statusMatch = filters.taskStatusFilter === "all" || task.status === filters.taskStatusFilter;
    const priorityMatch = filters.taskPriorityFilter === "all" || task.priority === filters.taskPriorityFilter;
    return dateInRange && areaMatch && statusMatch && priorityMatch;
  }) || [];

  const filteredExpenses = financeStats?.expenses?.filter((expense: any) => {
    return filters.expenseCategoryFilter === "all" || expense.category === filters.expenseCategoryFilter;
  }) || [];

  // Recalculate stats based on filtered data
  const filteredTaskStats = {
    total: filteredTasks.length,
    completed: filteredTasks.filter((t) => t.done).length,
    pending: filteredTasks.filter((t) => !t.done).length,
    byArea: filteredTasks.reduce((acc, task) => {
      acc[task.area] = (acc[task.area] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byPriority: filteredTasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  const filteredExpensesByCategory = filteredExpenses.reduce((acc: any, e: any) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  // Prepare chart data
  const taskCompletionData = [
    { name: "Completed", value: filteredTaskStats.completed, color: "#10b981" },
    { name: "Pending", value: filteredTaskStats.pending, color: "#f59e0b" },
  ];

  const tasksByAreaData = Object.entries(filteredTaskStats.byArea).map(([area, count]) => ({
    area,
    count,
  }));

  const productivityTrendData = dailyLogs
    ? dailyLogs
        .slice(-14)
        .map((log) => ({
          date: new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          productivity: log.productivityScore || 0,
          health: log.healthScore || 0,
        }))
    : [];

  const expensesByCategoryData = Object.entries(filteredExpensesByCategory).map(([category, amount]) => ({
    category,
    amount,
  }));

  const workoutTrendData = workoutStats?.workouts
    ? workoutStats.workouts.slice(-10).map((workout: any) => ({
        date: new Date(workout.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        duration: workout.duration || 0,
        calories: workout.calories || 0,
      }))
    : [];

  const sleepTrendData = sleepLogs
    ? sleepLogs.slice(-14).map((log) => ({
        date: new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        hours: log.duration,
      }))
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {/* Task Completion Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Task Completion</CardTitle>
          <CardDescription>Completed vs Pending Tasks (Filtered)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskCompletionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {taskCompletionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tasks by Area */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks by Area</CardTitle>
          <CardDescription>Distribution across different areas (Filtered)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tasksByAreaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="area" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Productivity Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity & Health Trend</CardTitle>
          <CardDescription>Last 14 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={productivityTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="productivity" stroke="#8b5cf6" strokeWidth={2} />
              <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expenses by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
          <CardDescription>Spending breakdown (Filtered)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expensesByCategoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="amount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Workout Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Activity</CardTitle>
          <CardDescription>Duration and calories burned</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={workoutTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="duration" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
              <Area type="monotone" dataKey="calories" stackId="2" stroke="#ef4444" fill="#ef4444" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sleep Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Sleep Pattern</CardTitle>
          <CardDescription>Hours of sleep per night</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sleepTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="hours" stroke="#14b8a6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
});

export default DashboardCharts;
