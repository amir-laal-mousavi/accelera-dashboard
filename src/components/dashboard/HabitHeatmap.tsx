import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface HabitHeatmapProps {
  habitId: Id<"habits">;
  habitName: string;
  startDate: number;
  endDate: number;
}

export function HabitHeatmap({ habitId, habitName, startDate, endDate }: HabitHeatmapProps) {
  const completions = useQuery(api.habits.getCompletions, {
    habitId,
    startDate,
    endDate,
  });

  if (!completions) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Generate date range for the heatmap
  const days: Array<{ date: Date; timestamp: number; completed: boolean }> = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const timestamp = new Date(d).setHours(0, 0, 0, 0);
    const completion = completions.find((c) => {
      const cDate = new Date(c.date).setHours(0, 0, 0, 0);
      return cDate === timestamp;
    });
    
    days.push({
      date: new Date(d),
      timestamp,
      completed: completion?.completed || false,
    });
  }

  // Group by weeks
  const weeks: Array<Array<{ date: Date; timestamp: number; completed: boolean }>> = [];
  let currentWeek: Array<{ date: Date; timestamp: number; completed: boolean }> = [];
  
  days.forEach((day, index) => {
    currentWeek.push(day);
    if (day.date.getDay() === 6 || index === days.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  const toggleCompletion = useMutation(api.habits.toggleCompletion);
  const completionRate = completions.filter((c) => c.completed).length / (completions.length || 1) * 100;

  const handleDayClick = async (day: { date: Date; timestamp: number; completed: boolean }) => {
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

  // Calculate intensity for gradient
  const getIntensityColor = (completed: boolean, streakLength: number) => {
    if (!completed) return "bg-muted border-border";
    
    if (streakLength >= 7) return "bg-cyan-500 border-cyan-600";
    if (streakLength >= 4) return "bg-teal-500 border-teal-600";
    if (streakLength >= 2) return "bg-teal-400 border-teal-500";
    return "bg-teal-300 border-teal-400";
  };

  return (
    <Card className="border-2 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {habitName} - Streak Heatmap
        </CardTitle>
        <CardDescription>
          Completion rate: {completionRate.toFixed(0)}% ({completions.filter((c) => c.completed).length}/{completions.length} days)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Day labels */}
          <div className="flex gap-1 mb-2">
            <div className="w-8"></div>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="w-8 text-xs text-center text-muted-foreground">
                {day[0]}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="space-y-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex gap-1">
                <div className="w-8 text-xs text-muted-foreground flex items-center">
                  W{weekIndex + 1}
                </div>
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const day = week.find((d) => d.date.getDay() === dayIndex);
                  
                  if (!day) {
                    return <div key={dayIndex} className="w-8 h-8" />;
                  }

                  // Calculate streak up to this day
                  const daysSorted = days.filter(d => d.timestamp <= day.timestamp).sort((a, b) => b.timestamp - a.timestamp);
                  let streakLength = 0;
                  for (const d of daysSorted) {
                    if (d.completed) streakLength++;
                    else break;
                  }

                  return (
                    <motion.div
                      key={dayIndex}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-8 h-8 rounded-md border-2 transition-all cursor-pointer ${
                        getIntensityColor(day.completed, streakLength)
                      } hover:shadow-lg hover:shadow-primary/20`}
                      title={`${day.date.toLocaleDateString()}: ${day.completed ? "Completed" : "Not completed"}\nStreak: ${streakLength} days`}
                      onClick={() => handleDayClick(day)}
                    />
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
                <div className="w-4 h-4 rounded-md bg-teal-300 border-2" />
                <div className="w-4 h-4 rounded-md bg-teal-400 border-2" />
                <div className="w-4 h-4 rounded-md bg-teal-500 border-2" />
                <div className="w-4 h-4 rounded-md bg-cyan-500 border-2" />
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
