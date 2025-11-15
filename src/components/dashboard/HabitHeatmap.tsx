import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";

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

  const completionRate = completions.filter((c) => c.completed).length / (completions.length || 1) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{habitName} - Streak Heatmap</CardTitle>
        <CardDescription>
          Completion rate: {completionRate.toFixed(0)}% ({completions.filter((c) => c.completed).length}/{completions.length} days)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
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

                  return (
                    <div
                      key={dayIndex}
                      className={`w-8 h-8 rounded border transition-colors cursor-pointer ${
                        day.completed
                          ? "bg-green-500 border-green-600 hover:bg-green-600"
                          : "bg-muted border-border hover:bg-muted/80"
                      }`}
                      title={`${day.date.toLocaleDateString()}: ${day.completed ? "Completed" : "Not completed"}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-muted border" />
              <div className="w-4 h-4 rounded bg-green-500/30 border" />
              <div className="w-4 h-4 rounded bg-green-500/60 border" />
              <div className="w-4 h-4 rounded bg-green-500 border" />
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
