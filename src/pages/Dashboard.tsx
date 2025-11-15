import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, TrendingUp, TrendingDown, CheckCircle2, Clock, Target, Book, DollarSign, Activity, Brain, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Calculate date ranges
  const now = new Date();
  const startDate = new Date(now);
  if (timeRange === "week") {
    startDate.setDate(now.getDate() - 7);
  } else if (timeRange === "month") {
    startDate.setDate(now.getDate() - 30);
  } else {
    startDate.setFullYear(now.getFullYear() - 1);
  }
  startDate.setHours(0, 0, 0, 0);

  // Fetch all data
  const tasks = useQuery(api.tasks.list, {});
  const taskStats = useQuery(api.tasks.getStats, {
    startDate: startDate.getTime(),
    endDate: now.getTime(),
  });
  const dailyLogs = useQuery(api.dailyLogs.list, {
    startDate: startDate.getTime(),
    endDate: now.getTime(),
  });
  const dailyStats = useQuery(api.dailyLogs.getStats, {
    startDate: startDate.getTime(),
    endDate: now.getTime(),
  });
  const habits = useQuery(api.habits.list, {});
  const books = useQuery(api.books.list, {});
  const readingStats = useQuery(api.books.getReadingStats, {
    startDate: startDate.getTime(),
    endDate: now.getTime(),
  });
  const financeStats = useQuery(api.finance.getFinanceStats, {
    startDate: startDate.getTime(),
    endDate: now.getTime(),
  });
  const workoutStats = useQuery(api.workouts.getStats, {
    startDate: startDate.getTime(),
    endDate: now.getTime(),
  });
  const waterLogs = useQuery(api.health.listWater, {
    startDate: startDate.getTime(),
    endDate: now.getTime(),
  });
  const sleepLogs = useQuery(api.health.listSleep, {
    startDate: startDate.getTime(),
    endDate: now.getTime(),
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isDataLoading = !tasks || !taskStats || !dailyLogs || !habits || !books || !financeStats || !workoutStats;

  // Prepare chart data
  const taskCompletionData = taskStats
    ? [
        { name: "Completed", value: taskStats.completed, color: "#10b981" },
        { name: "Pending", value: taskStats.pending, color: "#f59e0b" },
      ]
    : [];

  const tasksByAreaData = taskStats
    ? Object.entries(taskStats.byArea).map(([area, count]) => ({
        area,
        count,
      }))
    : [];

  const tasksByPriorityData = taskStats
    ? Object.entries(taskStats.byPriority).map(([priority, count]) => ({
        priority,
        count,
      }))
    : [];

  const productivityTrendData = dailyLogs
    ? dailyLogs
        .slice(-14)
        .map((log) => ({
          date: new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          productivity: log.productivityScore || 0,
          health: log.healthScore || 0,
        }))
    : [];

  const expensesByCategoryData = financeStats
    ? Object.entries(financeStats.expensesByCategory).map(([category, amount]) => ({
        category,
        amount,
      }))
    : [];

  const workoutTrendData = workoutStats?.workouts
    ? workoutStats.workouts.slice(-10).map((workout) => ({
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

  const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="./logo.svg" alt="Logo" className="h-10 w-10 cursor-pointer" onClick={() => navigate("/")} />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">ACCELERA Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user.name || user.email || "User"}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Time Range Selector */}
          <div className="flex justify-end mb-6">
            <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
              <TabsList>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {isDataLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{taskStats?.completionRate.toFixed(0)}%</div>
                    <p className="text-xs text-muted-foreground">
                      {taskStats?.completed} of {taskStats?.total} tasks
                    </p>
                    <Progress value={taskStats?.completionRate || 0} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
                    <Brain className="h-4 w-4 text-muted-foreground" />
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
                    <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${financeStats?.netBalance.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Income: ${financeStats?.totalIncome.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expenses: ${financeStats?.totalExpenses.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reading Progress</CardTitle>
                    <Book className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{readingStats?.totalPages || 0}</div>
                    <p className="text-xs text-muted-foreground">Pages read</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {readingStats?.totalMinutes || 0} minutes
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Task Completion Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Task Completion</CardTitle>
                    <CardDescription>Completed vs Pending Tasks</CardDescription>
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
                    <CardDescription>Distribution across different areas</CardDescription>
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
                    <CardDescription>Spending breakdown</CardDescription>
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

              {/* Habits Overview */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Active Habits</CardTitle>
                  <CardDescription>Your current habit tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {habits && habits.length > 0 ? (
                      habits.map((habit) => (
                        <div key={habit._id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{habit.name}</h4>
                            <Badge style={{ backgroundColor: habit.color || "#8b5cf6" }}>
                              {habit.frequency}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{habit.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground col-span-full text-center py-4">No habits tracked yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Books Overview */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Reading List</CardTitle>
                  <CardDescription>Your current books</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {books && books.length > 0 ? (
                      books.slice(0, 6).map((book) => (
                        <div key={book._id} className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-1">{book.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                          <Progress value={book.progress || 0} className="mb-2" />
                          <p className="text-xs text-muted-foreground">
                            {book.pagesRead || 0} / {book.totalPages || 0} pages
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground col-span-full text-center py-4">No books added yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
