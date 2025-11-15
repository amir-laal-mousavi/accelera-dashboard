import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HabitHeatmapProps {
  habitId: Id<"habits">;
  habitName: string;
  startDate: number;
  endDate: number;
}

export function HabitHeatmap({ habitId, habitName, startDate, endDate }: HabitHeatmapProps) {
  const [viewMode, setViewMode] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  
  const toggleCompletion = useMutation(api.habits.toggleCompletion);

  // Calculate date range based on view mode
  const { rangeStart, rangeEnd } = useMemo(() => {
    const now = new Date();
    
    if (viewMode === "weekly") {
      // Last 7 days: today and 6 previous days
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { rangeStart: start.getTime(), rangeEnd: end.getTime() };
    } else if (viewMode === "monthly") {
      // Selected month only
      const start = new Date(selectedMonth);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { rangeStart: start.getTime(), rangeEnd: end.getTime() };
    } else {
      // Yearly: entire selected year
      const start = new Date(selectedYear, 0, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedYear, 11, 31);
      end.setHours(23, 59, 59, 999);
      return { rangeStart: start.getTime(), rangeEnd: end.getTime() };
    }
  }, [viewMode, selectedMonth, selectedYear]);

  // Memoize query args
  const completionsArgs = useMemo(() => ({
    habitId,
    startDate: rangeStart,
    endDate: rangeEnd,
  }), [habitId, rangeStart, rangeEnd]);

  const completions = useQuery(api.habits.getCompletions, completionsArgs);

  // Build calendar data based on view mode
  const calendarData = useMemo(() => {
    if (!completions) return { weeks: [], stats: { completedDays: 0, totalDays: 0, rate: 0 } };
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const today = now.getTime();
    
    if (viewMode === "weekly") {
      // Weekly: 7 days in a single row
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const timestamp = date.getTime();
        const isFuture = timestamp > today;
        
        const completion = completions.find((c) => {
          const cDate = new Date(c.date).setHours(0, 0, 0, 0);
          return cDate === timestamp;
        });
        
        days.push({
          date,
          timestamp,
          completed: completion?.completed || false,
          inRange: true,
          isFuture,
        });
      }
      
      const completedDays = days.filter(d => d.completed).length;
      const totalDays = 7;
      const rate = (completedDays / totalDays) * 100;
      
      return { weeks: [days], stats: { completedDays, totalDays, rate } };
    } else if (viewMode === "monthly") {
      // Monthly: real calendar grid
      const monthStart = new Date(selectedMonth);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const year = monthStart.getFullYear();
      const month = monthStart.getMonth();
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
      const firstWeekday = monthStart.getDay();
      
      const weeks: Array<Array<{ date: Date; timestamp: number; completed: boolean; inRange: boolean; isFuture: boolean }>> = [];
      let currentWeek: Array<{ date: Date; timestamp: number; completed: boolean; inRange: boolean; isFuture: boolean }> = [];
      
      // Fill empty cells before the 1st
      for (let i = 0; i < firstWeekday; i++) {
        const emptyDate = new Date(year, month, -(firstWeekday - i - 1));
        currentWeek.push({
          date: emptyDate,
          timestamp: emptyDate.getTime(),
          completed: false,
          inRange: false,
          isFuture: false,
        });
      }
      
      // Fill actual days of the month
      let completedCount = 0;
      let validDaysCount = 0;
      
      for (let day = 1; day <= lastDayOfMonth; day++) {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);
        const timestamp = date.getTime();
        const isFuture = timestamp > today;
        
        const completion = completions.find((c) => {
          const cDate = new Date(c.date).setHours(0, 0, 0, 0);
          return cDate === timestamp;
        });
        
        currentWeek.push({
          date,
          timestamp,
          completed: completion?.completed || false,
          inRange: true,
          isFuture,
        });
        
        // Count only non-future days for stats
        if (!isFuture) {
          validDaysCount++;
          if (completion?.completed) {
            completedCount++;
          }
        }
        
        if (date.getDay() === 6 || day === lastDayOfMonth) {
          while (currentWeek.length < 7) {
            const nextDay = new Date(year, month, day + (currentWeek.length - date.getDay()));
            currentWeek.push({
              date: nextDay,
              timestamp: nextDay.getTime(),
              completed: false,
              inRange: false,
              isFuture: false,
            });
          }
          weeks.push([...currentWeek]);
          currentWeek = [];
        }
      }
      
      const rate = validDaysCount > 0 ? (completedCount / validDaysCount) * 100 : 0;
      return { weeks, stats: { completedDays: completedCount, totalDays: validDaysCount, rate } };
    } else {
      // Yearly: 12 months
      const months = [];
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      for (let m = 0; m < 12; m++) {
        const monthDate = new Date(selectedYear, m, 1);
        const isFuture = selectedYear > currentYear || (selectedYear === currentYear && m > currentMonth);
        
        if (isFuture) {
          months.push({
            month: m,
            monthName: monthDate.toLocaleDateString("en-US", { month: "short" }),
            completed: 0,
            total: 0,
            rate: 0,
            isFuture: true,
          });
        } else {
          const monthStart = new Date(selectedYear, m, 1);
          monthStart.setHours(0, 0, 0, 0);
          const monthEnd = new Date(selectedYear, m + 1, 0);
          monthEnd.setHours(23, 59, 59, 999);
          
          const lastDayOfMonth = monthEnd.getDate();
          const isCurrentMonth = selectedYear === currentYear && m === currentMonth;
          const validDays = isCurrentMonth ? now.getDate() : lastDayOfMonth;
          
          const monthCompletions = completions.filter((c) => {
            const cDate = new Date(c.date);
            return cDate.getFullYear() === selectedYear && cDate.getMonth() === m && c.completed;
          });
          
          const rate = validDays > 0 ? (monthCompletions.length / validDays) * 100 : 0;
          
          months.push({
            month: m,
            monthName: monthDate.toLocaleDateString("en-US", { month: "short" }),
            completed: monthCompletions.length,
            total: validDays,
            rate,
            isFuture: false,
          });
        }
      }
      
      const totalCompleted = months.reduce((sum, m) => sum + m.completed, 0);
      const totalDays = months.reduce((sum, m) => sum + m.total, 0);
      const overallRate = totalDays > 0 ? (totalCompleted / totalDays) * 100 : 0;
      
      return { months, stats: { completedDays: totalCompleted, totalDays, rate: overallRate } };
    }
  }, [completions, viewMode, selectedMonth, selectedYear]);

  // Calculate streak for a given day
  const getStreakForDay = (dayTimestamp: number) => {
    if (viewMode !== "weekly" && viewMode !== "monthly") return 0;
    
    const allDays = calendarData.weeks?.flat().filter(d => d.inRange && !d.isFuture) || [];
    const dayIndex = allDays.findIndex(d => d.timestamp === dayTimestamp);
    
    if (dayIndex === -1 || !allDays[dayIndex].completed) return 0;
    
    let streak = 0;
    for (let i = dayIndex; i >= 0; i--) {
      if (allDays[i].completed) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // Get intensity color
  const getIntensityColor = (completed: boolean, streakLength: number, inRange: boolean, isFuture: boolean) => {
    if (!inRange || isFuture) return "bg-muted/30 border-muted/50 cursor-not-allowed";
    if (!completed) return "bg-muted border-border cursor-pointer hover:bg-muted/80";
    
    if (streakLength >= 7) return "bg-cyan-500 border-cyan-600 dark:bg-cyan-400 dark:border-cyan-500 cursor-pointer";
    if (streakLength >= 4) return "bg-teal-500 border-teal-600 dark:bg-teal-400 dark:border-teal-500 cursor-pointer";
    if (streakLength >= 2) return "bg-teal-400 border-teal-500 dark:bg-teal-300 dark:border-teal-400 cursor-pointer";
    return "bg-teal-300 border-teal-400 dark:bg-teal-200 dark:border-teal-300 cursor-pointer";
  };

  const handleDayClick = async (day: { timestamp: number; completed: boolean; inRange: boolean; isFuture?: boolean }) => {
    if (!day.inRange || day.isFuture) return;
    
    try {
      await toggleCompletion({
        habitId,
        date: day.timestamp,
        completed: !day.completed,
      });
      toast.success(day.completed ? "Marked as incomplete" : "Marked as complete!");
    } catch (error) {
      toast.error("Failed to update habit");
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const navigateYear = (direction: "prev" | "next") => {
    setSelectedYear(prev => prev + (direction === "next" ? 1 : -1));
  };

  if (!completions) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const displayTitle = viewMode === "weekly" 
    ? "Last 7 Days"
    : viewMode === "monthly"
    ? selectedMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : `Year ${selectedYear}`;

  return (
    <Card className="border-2 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {habitName} - {displayTitle}
            </CardTitle>
            <CardDescription>
              Completion rate: {calendarData.stats.rate.toFixed(0)}% ({calendarData.stats.completedDays}/{calendarData.stats.totalDays} {viewMode === "yearly" ? "days" : "days"})
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {viewMode === "monthly" && (
              <>
                <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            {viewMode === "yearly" && (
              <>
                <Button variant="outline" size="icon" onClick={() => navigateYear("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigateYear("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="mt-4">
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {viewMode === "yearly" ? (
            // Yearly view: 12 months grid
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {calendarData.months?.map((monthData) => (
                <motion.div
                  key={monthData.month}
                  whileHover={!monthData.isFuture ? { scale: 1.05 } : {}}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center ${
                    monthData.isFuture
                      ? "bg-muted/30 border-muted/50 cursor-not-allowed"
                      : monthData.rate >= 75
                      ? "bg-cyan-500/20 border-cyan-500 dark:bg-cyan-400/20"
                      : monthData.rate >= 50
                      ? "bg-teal-500/20 border-teal-500 dark:bg-teal-400/20"
                      : monthData.rate >= 25
                      ? "bg-teal-400/20 border-teal-400 dark:bg-teal-300/20"
                      : "bg-muted border-border"
                  }`}
                  title={monthData.isFuture ? `${monthData.monthName} (Future)` : `${monthData.monthName}: ${monthData.completed}/${monthData.total} days (${monthData.rate.toFixed(0)}%)`}
                >
                  <span className="text-xs font-semibold">{monthData.monthName}</span>
                  {!monthData.isFuture && (
                    <span className="text-lg font-bold mt-1">{monthData.rate.toFixed(0)}%</span>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <>
              {/* Day labels for weekly/monthly */}
              <div className="flex gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="w-10 text-xs text-center font-semibold text-muted-foreground">
                    {day[0]}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="space-y-1">
                {calendarData.weeks?.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex gap-1">
                    {week.map((day, dayIndex) => {
                      const streak = day.inRange && day.completed && !day.isFuture ? getStreakForDay(day.timestamp) : 0;
                      const dateStr = day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      
                      return (
                        <motion.div
                          key={`${weekIndex}-${dayIndex}`}
                          whileHover={day.inRange && !day.isFuture ? { scale: 1.1 } : {}}
                          whileTap={day.inRange && !day.isFuture ? { scale: 0.95 } : {}}
                          className={`w-10 h-10 rounded-md border-2 transition-all flex items-center justify-center text-xs font-medium ${
                            getIntensityColor(day.completed, streak, day.inRange, day.isFuture || false)
                          } ${day.inRange && !day.isFuture ? "hover:shadow-lg hover:shadow-primary/20" : ""}`}
                          title={day.inRange ? `${dateStr}: ${day.isFuture ? "Future" : day.completed ? "Completed" : "Not completed"}${streak > 0 ? `\nStreak: ${streak} days` : ""}` : ""}
                          onClick={() => day.inRange && !day.isFuture && handleDayClick(day)}
                        >
                          {day.inRange && (
                            <span className={day.completed && !day.isFuture ? "text-white font-bold" : day.isFuture ? "text-muted-foreground/50" : "text-muted-foreground"}>
                              {day.date.getDate()}
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Legend */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded-md bg-muted border-2" />
                <div className="w-4 h-4 rounded-md bg-teal-300 border-2 dark:bg-teal-200" />
                <div className="w-4 h-4 rounded-md bg-teal-400 border-2 dark:bg-teal-300" />
                <div className="w-4 h-4 rounded-md bg-teal-500 border-2 dark:bg-teal-400" />
                <div className="w-4 h-4 rounded-md bg-cyan-500 border-2 dark:bg-cyan-400" />
              </div>
              <span>More</span>
            </div>
            {viewMode !== "yearly" && (
              <div className="text-xs text-muted-foreground">
                Click any day to toggle completion
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}