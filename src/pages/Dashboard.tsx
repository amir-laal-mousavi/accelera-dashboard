import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState, lazy, Suspense } from "react";
import { TrialBanner } from "@/components/TrialBanner";
import { motion } from "framer-motion";
import { Loader2, TrendingUp, TrendingDown, CheckCircle2, Clock, Target, Book, DollarSign, Activity, Brain, Calendar, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { HabitsSection } from "@/components/dashboard/HabitsSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoDropdown } from "@/components/LogoDropdown";
import { useMobile } from "@/hooks/use-mobile";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  
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

  // Apply filters
  const filteredTasks = tasks?.filter((task) => {
    const dateInRange = task.scheduled && task.scheduled >= startDate.getTime() && task.scheduled <= now.getTime();
    const areaMatch = taskAreaFilter === "all" || task.area === taskAreaFilter;
    const statusMatch = taskStatusFilter === "all" || task.status === taskStatusFilter;
    const priorityMatch = taskPriorityFilter === "all" || task.priority === taskPriorityFilter;
    return dateInRange && areaMatch && statusMatch && priorityMatch;
  }) || [];

  const filteredHabits = habits?.filter((habit) => {
    return habitFrequencyFilter === "all" || habit.frequency === habitFrequencyFilter;
  }) || [];

  const filteredBooks = books?.filter((book) => {
    return bookStatusFilter === "all" || book.status === bookStatusFilter;
  }) || [];

  const filteredExpenses = financeStats?.expenses?.filter((expense) => {
    return expenseCategoryFilter === "all" || expense.category === expenseCategoryFilter;
  }) || [];

  // Recalculate stats based on filtered data
  const filteredTaskStats = {
    total: filteredTasks.length,
    completed: filteredTasks.filter((t) => t.done).length,
    pending: filteredTasks.filter((t) => !t.done).length,
    completionRate: filteredTasks.length > 0 ? (filteredTasks.filter((t) => t.done).length / filteredTasks.length) * 100 : 0,
    byArea: filteredTasks.reduce((acc, task) => {
      acc[task.area] = (acc[task.area] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byPriority: filteredTasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  const filteredExpenseTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const filteredExpensesByCategory = filteredExpenses.reduce((acc, e) => {
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

  const tasksByPriorityData = Object.entries(filteredTaskStats.byPriority).map(([priority, count]) => ({
    priority,
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

  // Get unique categories for filters
  const expenseCategories = Array.from(new Set(financeStats?.expenses?.map((e) => e.category) || []));
  const taskAreas = ["Work", "Study", "Programming", "Fitness", "Finance", "Book", "Studying", "Self", "Research", "Startup", "Other"];
  const taskStatuses = ["Not Started", "In Progress", "Done", "Blocked"];
  const taskPriorities = ["Critical", "High", "Medium", "Low"];
  const habitFrequencies = Array.from(new Set(habits?.map((h) => h.frequency) || []));
  const bookStatuses = Array.from(new Set(books?.map((b) => b.status || "Reading") || []));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <img src="./logo.svg" alt="Logo" className="h-8 w-8 md:h-10 md:w-10 cursor-pointer" onClick={() => navigate("/")} />
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
          {/* Time Range Selector */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Filters Active</span>
            </div>
            <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
              <TabsList>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Filter Controls */}
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
                  onClick={() => {
                    setTaskAreaFilter("all");
                    setTaskStatusFilter("all");
                    setTaskPriorityFilter("all");
                    setExpenseCategoryFilter("all");
                    setHabitFrequencyFilter("all");
                    setBookStatusFilter("all");
                  }}
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
                  <Select value={taskAreaFilter} onValueChange={setTaskAreaFilter}>
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
                  <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
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
                  <Select value={taskPriorityFilter} onValueChange={setTaskPriorityFilter}>
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
                  <Select value={expenseCategoryFilter} onValueChange={setExpenseCategoryFilter}>
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
                  <Select value={habitFrequencyFilter} onValueChange={setHabitFrequencyFilter}>
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="All Frequencies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Frequencies</SelectItem>
                      {habitFrequencies.map((frequency) => (
                        <SelectItem key={frequency} value={frequency}>
                          {frequency}
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
                  <Select value={bookStatusFilter} onValueChange={setBookStatusFilter}>
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {bookStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {isDataLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
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
                    <CardTitle className="text-sm font-medium">Filtered Expenses</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
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
                    <Book className="h-4 w-4 text-muted-foreground" />
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

              {/* Charts Grid */}
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

              {/* Habits Overview with Heatmaps */}
              <HabitsSection 
                habits={filteredHabits} 
                startDate={startDate.getTime()} 
                endDate={now.getTime()} 
              />

              {/* Books Overview */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Reading List</CardTitle>
                  <CardDescription>Your current books (Filtered: {filteredBooks.length} books)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBooks.length > 0 ? (
                      filteredBooks.slice(0, 6).map((book) => (
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
                      <p className="text-muted-foreground col-span-full text-center py-4">No books match the current filter</p>
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