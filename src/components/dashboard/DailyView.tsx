import { memo, useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Edit, CheckCircle2, Circle, Clock, Droplet, Moon, Dumbbell, Book as BookIcon, Coffee, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TaskForm } from "./TaskForm";
import { ExpenseForm } from "./ExpenseForm";
import { WorkoutForm } from "./WorkoutForm";
import { BookForm } from "./BookForm";
import { HabitCreationForm } from "./HabitCreationForm";
import { DailyLogForm } from "./DailyLogForm";
import { HealthLogForm } from "./HealthLogForm";
import { CalorieCalculator } from "./CalorieCalculator";
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
  const deleteWaterLog = useMutation(api.health.deleteWater);
  const deleteCaffeineLog = useMutation(api.health.deleteCaffeine);
  const deleteSleepLog = useMutation(api.health.deleteSleep);
  const deleteWorkoutLog = useMutation(api.workouts.remove);

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
  const caffeineLogs = useQuery(api.health.listCaffeine, {
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

  const totalWater = useMemo(() => {
    if (!waterLogs || waterLogs.length === 0) return 0;
    return waterLogs.reduce((sum, log) => sum + (log.amount || 0), 0);
  }, [waterLogs]);
  
  const totalCaffeine = useMemo(() => {
    if (!caffeineLogs || caffeineLogs.length === 0) return 0;
    return caffeineLogs.reduce((sum, log) => sum + (log.caffeine || 0), 0);
  }, [caffeineLogs]);
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
      {/* Date Navigation with subtle accent */}
      <Card className="border-2 border-accent-teal/30 neon-card-hover bg-gradient-to-br from-accent-teal/5 to-transparent">
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
                <Button 
                  variant="outline" 
                  onClick={goToToday} 
                  className="border-accent-teal/40 hover:bg-accent-teal/15 hover:shadow-[0_0_12px_rgba(46,234,229,0.2)] transition-all"
                >
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

      {/* Quick Stats with neon highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="neon-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
            <Progress value={taskCompletionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="neon-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Intake</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWater}ml</div>
            <p className="text-xs text-muted-foreground mt-1">
              Goal: {waterLogs && waterLogs.length > 0 && waterLogs[0]?.goal ? waterLogs[0].goal : 2000}ml
            </p>
          </CardContent>
        </Card>

        <Card className="neon-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Caffeine</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCaffeine}mg</div>
            <p className="text-xs text-muted-foreground mt-1">
              {caffeineLogs?.length || 0} drinks
            </p>
          </CardContent>
        </Card>

        <Card className="neon-card-hover">
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

        <Card className="neon-card-hover">
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

      {/* Charts Row with neon ambient glow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="neon-card-hover chart-gradient-teal border-accent-teal/20">
          <CardHeader>
            <CardTitle className="text-accent-purple">Tasks by Area</CardTitle>
            <CardDescription>Distribution for today</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tasksByArea}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.70 0.18 180 / 0.1)" />
                <XAxis dataKey="area" stroke="oklch(0.65 0 0 / 0.6)" />
                <YAxis stroke="oklch(0.65 0 0 / 0.6)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'oklch(0.12 0 0 / 0.95)', 
                    border: '1px solid oklch(0.70 0.18 180 / 0.3)',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="count" fill="url(#purpleGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A67DFF" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6E4AFF" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="neon-card-hover chart-gradient-purple border-accent-purple/20">
          <CardHeader>
            <CardTitle className="text-accent-cyan">Time Distribution</CardTitle>
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
                  stroke="oklch(0.12 0 0)"
                  strokeWidth={2}
                >
                  {timeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'oklch(0.12 0 0 / 0.95)', 
                    border: '1px solid oklch(0.65 0.22 285 / 0.3)',
                    borderRadius: '8px'
                  }} 
                />
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
              <div className="flex items-center gap-2">
                <CalorieCalculator />
                <WorkoutForm />
              </div>
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{workout.session}</p>
                        <p className="text-sm text-muted-foreground">{workout.exercise}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {workout.duration && <span>{workout.duration}min</span>}
                          {workout.calories && <span>{workout.calories}cal</span>}
                          {workout.intensity && <Badge variant="outline">{workout.intensity}</Badge>}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={async () => {
                          if (confirm("Delete this workout?")) {
                            try {
                              await deleteWorkoutLog({ id: workout._id });
                              toast.success("Workout deleted");
                            } catch (error) {
                              toast.error("Failed to delete workout");
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
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
            <div className="space-y-2">
              {/* Water Logs */}
              {waterLogs && waterLogs.length > 0 ? (
                waterLogs.map((log) => (
                  <div key={log._id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">{log.amount}ml</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={async () => {
                        if (confirm("Delete this water log?")) {
                          try {
                            await deleteWaterLog({ id: log._id });
                            toast.success("Water log deleted");
                          } catch (error) {
                            toast.error("Failed to delete water log");
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Water</span>
                  </div>
                  <span className="text-sm text-muted-foreground">0ml</span>
                </div>
              )}

              {/* Caffeine Logs */}
              {caffeineLogs && caffeineLogs.length > 0 ? (
                caffeineLogs.map((log) => (
                  <div key={log._id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">{log.drink} ({log.caffeine}mg)</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={async () => {
                        if (confirm("Delete this caffeine log?")) {
                          try {
                            await deleteCaffeineLog({ id: log._id });
                            toast.success("Caffeine log deleted");
                          } catch (error) {
                            toast.error("Failed to delete caffeine log");
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">Caffeine</span>
                  </div>
                  <span className="text-sm text-muted-foreground">0mg</span>
                </div>
              )}

              {/* Sleep Logs */}
              {sleepLogs && sleepLogs.length > 0 ? (
                sleepLogs.map((log) => (
                  <div key={log._id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">{log.duration}h</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={async () => {
                        if (confirm("Delete this sleep log?")) {
                          try {
                            await deleteSleepLog({ id: log._id });
                            toast.success("Sleep log deleted");
                          } catch (error) {
                            toast.error("Failed to delete sleep log");
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Sleep</span>
                  </div>
                  <span className="text-sm text-muted-foreground">0h</span>
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