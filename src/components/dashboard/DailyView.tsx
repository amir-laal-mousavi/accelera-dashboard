import { memo, useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Edit, CheckCircle2, Circle, Clock, Droplet, Moon, Dumbbell, Book as BookIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TaskForm } from "./TaskForm";
import { ExpenseForm } from "./ExpenseForm";
import { WorkoutForm } from "./WorkoutForm";
import { BookForm } from "./BookForm";
import { HabitCreationForm } from "./HabitCreationForm";
import { DailyLogForm } from "./DailyLogForm";
import { HealthLogForm } from "./HealthLogForm";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
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

const DailyView = memo(function DailyView() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
  });

  const toggleTaskDone = useMutation(api.tasks.update);
  const toggleHabitCompletion = useMutation(api.habits.toggleCompletion);

  // Calculate date range for the selected day
  const { startOfDay, endOfDay } = useMemo(() => {
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);
    return {
      startOfDay: start.getTime(),
      endOfDay: end.getTime(),
    };
  }, [selectedDate]);

  // Fetch data for the selected day
  const tasks = useQuery(api.tasks.list, {});
  const dailyLog = useQuery(api.dailyLogs.getByDate, { date: selectedDate });
  const habits = useQuery(api.habits.list, {});
  const habitCompletions = useQuery(api.habits.getAggregatedStats, {
    startDate: startOfDay,
    endDate: endOfDay,
  });
  const waterLogs = useQuery(api.health.listWater, {
    startDate: startOfDay,
    endDate: endOfDay,
  });
  const sleepLogs = useQuery(api.health.listSleep, {
    startDate: startOfDay,
    endDate: endOfDay,
  });
  const workouts = useQuery(api.workouts.list, {
    startDate: startOfDay,
    endDate: endOfDay,
  });
  const readingSessions = useQuery(api.books.listSessions, {
    startDate: startOfDay,
    endDate: endOfDay,
  });

  // Filter tasks for the selected day
  const dailyTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((task) => {
      if (!task.scheduled) return false;
      const taskDate = new Date(task.scheduled);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === selectedDate;
    });
  }, [tasks, selectedDate]);

  // Navigation handlers
  const goToPreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    prevDay.setHours(0, 0, 0, 0);
    setSelectedDate(prevDay.getTime());
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);
    setSelectedDate(nextDay.getTime());
  };

  const goToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setSelectedDate(today.getTime());
  };

  // Calculate stats
  const completedTasks = dailyTasks.filter((t) => t.done).length;
  const totalTasks = dailyTasks.length;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const totalWater = waterLogs?.reduce((sum, log) => sum + log.amount, 0) || 0;
  const totalWorkoutMinutes = workouts?.reduce((sum, w) => sum + (w.duration || 0), 0) || 0;
  const totalReadingMinutes = readingSessions?.reduce((sum, s) => sum + s.minutes, 0) || 0;

  // Prepare chart data - tasks by area
  const tasksByArea = useMemo(() => {
    const areaCount: Record<string, number> = {};
    dailyTasks.forEach((task) => {
      areaCount[task.area] = (areaCount[task.area] || 0) + 1;
    });
    return Object.entries(areaCount).map(([area, count]) => ({ area, count }));
  }, [dailyTasks]);

  // Time distribution pie chart
  const timeDistribution = useMemo(() => {
    const data = [
      { name: "Work", value: totalWorkoutMinutes, color: "#A67DFF" },
      { name: "Reading", value: totalReadingMinutes, color: "#2CEAE5" },
      { name: "Tasks", value: dailyTasks.length * 30, color: "#49D3FF" }, // Estimate 30 min per task
    ].filter((item) => item.value > 0);
    return data;
  }, [totalWorkoutMinutes, totalReadingMinutes, dailyTasks.length]);

  const handleToggleTask = async (taskId: string, currentDone: boolean) => {
    try {
      await toggleTaskDone({ id: taskId as any, done: !currentDone });
      toast.success(currentDone ? "Task marked as incomplete" : "Task completed!");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleToggleHabit = async (habitId: string, completed: boolean) => {
    try {
      await toggleHabitCompletion({
        habitId: habitId as any,
        date: selectedDate,
        completed: !completed,
      });
      toast.success(completed ? "Habit marked as incomplete" : "Habit completed!");
    } catch (error) {
      toast.error("Failed to update habit");
    }
  };

  const isToday = new Date(selectedDate).toDateString() === new Date().toDateString();

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <Card className="border-2 border-accent-teal/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Daily View</CardTitle>
              <CardDescription>
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {!isToday && (
                <Button variant="outline" onClick={goToToday} className="border-accent-teal/30 hover:bg-accent-teal/10">
                  Today
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={goToNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
            <Progress value={taskCompletionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Intake</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWater}ml</div>
            <p className="text-xs text-muted-foreground mt-1">
              Goal: {waterLogs?.[0]?.goal || 2000}ml
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workout</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkoutMinutes}min</div>
            <p className="text-xs text-muted-foreground mt-1">
              {workouts?.length || 0} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reading</CardTitle>
            <BookIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReadingMinutes}min</div>
            <p className="text-xs text-muted-foreground mt-1">
              {readingSessions?.reduce((sum, s) => sum + (s.endPage - s.startPage), 0) || 0} pages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Area</CardTitle>
            <CardDescription>Distribution for today</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tasksByArea}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6E4AFF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time Distribution</CardTitle>
            <CardDescription>How you spent your day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={timeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}min`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {timeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tasks for Today</CardTitle>
              <CardDescription>{dailyTasks.length} tasks scheduled</CardDescription>
            </div>
            <TaskForm />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dailyTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No tasks scheduled for this day
              </p>
            ) : (
              dailyTasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleTask(task._id, task.done)}
                    >
                      {task.done ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <p className={`font-medium ${task.done ? "line-through text-muted-foreground" : ""}`}>
                        {task.task}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {task.area}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <TaskForm task={task} />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Habits Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Habits</CardTitle>
              <CardDescription>Track your daily habits</CardDescription>
            </div>
            <HabitCreationForm />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {!habits || habits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No habits created yet
              </p>
            ) : (
              habits
                .filter((h) => h.frequency === "daily" || h.frequency === "Daily")
                .map((habit) => {
                  const isCompleted = (habitCompletions?.dailyCompletions?.[selectedDate] || 0) > 0;
                  return (
                    <div
                      key={habit._id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleHabit(habit._id, isCompleted)}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <p className="font-medium">{habit.name}</p>
                          {habit.description && (
                            <p className="text-sm text-muted-foreground">{habit.description}</p>
                          )}
                        </div>
                      </div>
                      <Badge
                        style={{ backgroundColor: habit.color || "#8b5cf6" }}
                        className="text-white"
                      >
                        {habit.category || "General"}
                      </Badge>
                    </div>
                  );
                })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Daily Log Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daily Log</CardTitle>
              <CardDescription>Mood, productivity, and notes</CardDescription>
            </div>
            <DailyLogForm date={selectedDate} existingLog={dailyLog} />
          </div>
        </CardHeader>
        <CardContent>
          {dailyLog ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mood</p>
                  <p className="text-lg font-semibold">{dailyLog.mood || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Productivity</p>
                  <p className="text-lg font-semibold">{dailyLog.productivityScore || 0}/100</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Health</p>
                  <p className="text-lg font-semibold">{dailyLog.healthScore || 0}/100</p>
                </div>
              </div>
              {dailyLog.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm mt-1">{dailyLog.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No log entry for this day
            </p>
          )}
        </CardContent>
      </Card>

      {/* Health & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Workouts</CardTitle>
                <CardDescription>{workouts?.length || 0} sessions today</CardDescription>
              </div>
              <WorkoutForm />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {!workouts || workouts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No workouts logged
                </p>
              ) : (
                workouts.map((workout) => (
                  <div
                    key={workout._id}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <p className="font-medium">{workout.session}</p>
                    <p className="text-sm text-muted-foreground">{workout.exercise}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {workout.duration && <span>{workout.duration}min</span>}
                      {workout.calories && <span>{workout.calories}cal</span>}
                      {workout.intensity && <Badge variant="outline">{workout.intensity}</Badge>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Health Metrics</CardTitle>
                <CardDescription>Water, sleep, and more</CardDescription>
              </div>
              <HealthLogForm date={selectedDate} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Water</span>
                </div>
                <span className="text-sm font-semibold">{totalWater}ml</span>
              </div>
              {sleepLogs && sleepLogs.length > 0 && (
                <div className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Sleep</span>
                  </div>
                  <span className="text-sm font-semibold">{sleepLogs[0].duration}h</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export default DailyView;
