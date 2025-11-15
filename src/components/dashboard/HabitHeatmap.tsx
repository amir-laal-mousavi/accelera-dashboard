import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useMemo } from "react";

interface HabitHeatmapProps {
  habitId: Id<"habits">;
  habitName: string;
  startDate: number;
  endDate: number;
}

export function HabitHeatmap({ habitId, habitName, startDate, endDate }: HabitHeatmapProps) {
  // Memoize query args to prevent infinite loops
  const completionsArgs = useMemo(() => ({
    habitId,
    startDate,
    endDate,
  }), [habitId, startDate, endDate]);

  const completions = useQuery(api.habits.getCompletions, completionsArgs);
  const toggleCompletion = useMutation(api.habits.toggleCompletion);

  if (!completions) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Build real calendar structure for the month
  const calendarData = useMemo(() => {
    const monthStart = new Date(startDate);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthEnd = new Date(endDate);
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    
    // Get the last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    
    // Get the weekday of the 1st (0 = Sunday, 6 = Saturday)
    const firstWeekday = monthStart.getDay();
    
    // Build calendar grid
    const weeks: Array<Array<{ date: Date; timestamp: number; completed: boolean; inMonth: boolean }>> = [];
    let currentWeek: Array<{ date: Date; timestamp: number; completed: boolean; inMonth: boolean }> = [];
    
    // Fill empty cells before the 1st of the month
    for (let i = 0; i < firstWeekday; i++) {
      const emptyDate = new Date(year, month, -(firstWeekday - i - 1));
      currentWeek.push({
        date: emptyDate,
        timestamp: emptyDate.getTime(),
        completed: false,
        inMonth: false,
      });
    }
    
    // Fill actual days of the month
    for (let day = 1; day <= lastDayOfMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      const timestamp = date.getTime();
      
      const completion = completions.find((c) => {
        const cDate = new Date(c.date).setHours(0, 0, 0, 0);
        return cDate === timestamp;
      });
      
      currentWeek.push({
        date,
        timestamp,
        completed: completion?.completed || false,
        inMonth: true,
      });
      
      // If Sunday (end of week) or last day of month, push week and start new
      if (date.getDay() === 6 || day === lastDayOfMonth) {
        // Fill remaining cells in the last week if needed
        while (currentWeek.length < 7) {
          const nextDay = new Date(year, month, day + (currentWeek.length - date.getDay()));
          currentWeek.push({
            date: nextDay,
            timestamp: nextDay.getTime(),
            completed: false,
            inMonth: false,
          });
        }
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }
    
    return weeks;
  }, [startDate, endDate, completions]);

  // Calculate completion rate for days in the month only
  const completionStats = useMemo(() => {
    const daysInMonth = calendarData.flat().filter(day => day.inMonth);
    const completedDays = daysInMonth.filter(day => day.completed).length;
    const totalDays = daysInMonth.length;
    const rate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
    
    return { completedDays, totalDays, rate };
  }, [calendarData]);

  const handleDayClick = async (day: { date: Date; timestamp: number; completed: boolean; inMonth: boolean }) => {
    if (!day.inMonth) return; // Don't allow toggling days outside the month
    
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

  // Calculate streak for a given day (only counting backwards from that day)
  const getStreakForDay = (dayTimestamp: number) => {
    const allDays = calendarData.flat().filter(d => d.inMonth);
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

  // Calculate intensity for gradient
  const getIntensityColor = (completed: boolean, streakLength: number, inMonth: boolean) => {
    if (!inMonth) return "bg-muted/30 border-muted/50 cursor-not-allowed";
    if (!completed) return "bg-muted border-border cursor-pointer";
    
    if (streakLength >= 7) return "bg-cyan-500 border-cyan-600 dark:bg-cyan-400 dark:border-cyan-500 cursor-pointer";
    if (streakLength >= 4) return "bg-teal-500 border-teal-600 dark:bg-teal-400 dark:border-teal-500 cursor-pointer";
    if (streakLength >= 2) return "bg-teal-400 border-teal-500 dark:bg-teal-300 dark:border-teal-400 cursor-pointer";
    return "bg-teal-300 border-teal-400 dark:bg-teal-200 dark:border-teal-300 cursor-pointer";
  };

  const monthName = new Date(startDate).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <Card className="border-2 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {habitName} - {monthName}
        </CardTitle>
        <CardDescription>
          Completion rate: {completionStats.rate.toFixed(0)}% ({completionStats.completedDays}/{completionStats.totalDays} days)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Day labels */}
          <div className="flex gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="w-10 text-xs text-center font-semibold text-muted-foreground">
                {day[0]}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="space-y-1">
            {calendarData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex gap-1">
                {week.map((day, dayIndex) => {
                  const streak = day.inMonth && day.completed ? getStreakForDay(day.timestamp) : 0;
                  const dateStr = day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  
                  return (
                    <motion.div
                      key={`${weekIndex}-${dayIndex}`}
                      whileHover={day.inMonth ? { scale: 1.1 } : {}}
                      whileTap={day.inMonth ? { scale: 0.95 } : {}}
                      className={`w-10 h-10 rounded-md border-2 transition-all flex items-center justify-center text-xs font-medium ${
                        getIntensityColor(day.completed, streak, day.inMonth)
                      } ${day.inMonth ? "hover:shadow-lg hover:shadow-primary/20" : ""}`}
                      title={day.inMonth ? `${dateStr}: ${day.completed ? "Completed" : "Not completed"}${streak > 0 ? `\nStreak: ${streak} days` : ""}` : ""}
                      onClick={() => day.inMonth && handleDayClick(day)}
                    >
                      {day.inMonth && (
                        <span className={day.completed ? "text-white font-bold" : "text-muted-foreground"}>
                          {day.date.getDate()}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>

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
            <div className="text-xs text-muted-foreground">
              Click any day to toggle completion
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}