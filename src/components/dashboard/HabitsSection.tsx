import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HabitHeatmap } from "./HabitHeatmap";
import { HabitFilters } from "./HabitFilters";
import { Id } from "@/convex/_generated/dataModel";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface Habit {
  _id: Id<"habits">;
  name: string;
  description?: string;
  category?: string;
  frequency: string;
  targetDays?: number;
  challengeLength?: number;
  startDate?: number;
  color?: string;
}

interface HabitsSectionProps {
  habits: Array<Habit>;
  startDate: number;
  endDate: number;
}

export function HabitsSection({ habits, startDate, endDate }: HabitsSectionProps) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Get aggregated stats
  const aggregatedStats = useQuery(api.habits.getAggregatedStats, {
    startDate,
    endDate,
  });

  // Filter and sort habits
  let filteredHabits = habits.filter((h) => {
    if (categoryFilter === "all") return true;
    return h.category === categoryFilter;
  });

  // Sort habits
  filteredHabits = [...filteredHabits].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "date":
        return (b.startDate || 0) - (a.startDate || 0);
      case "date-old":
        return (a.startDate || 0) - (b.startDate || 0);
      default:
        return 0;
    }
  });

  const categories = Array.from(new Set(habits.map((h) => h.category).filter(Boolean))) as string[];
  if (filteredHabits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Habits</CardTitle>
          <CardDescription>No habits match the current filter</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Active Habits</CardTitle>
        <CardDescription>Your current habit tracking ({filteredHabits.length} habits)</CardDescription>
      </CardHeader>
      <CardContent>
        <HabitFilters
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
        />

        {/* Aggregated Stats */}
        {aggregatedStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-2 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Active Habits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{aggregatedStats.totalHabits}</div>
              </CardContent>
            </Card>
            <Card className="border-2 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Best Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{aggregatedStats.bestDay.count}</div>
                <p className="text-xs text-muted-foreground">
                  {aggregatedStats.bestDay.date ? new Date(aggregatedStats.bestDay.date).toLocaleDateString() : "N/A"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Avg Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Object.keys(aggregatedStats.dailyCompletions).length > 0
                    ? Math.round(
                        Object.values(aggregatedStats.dailyCompletions).reduce((a, b) => a + b, 0) /
                          Object.keys(aggregatedStats.dailyCompletions).length
                      )
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground">habits per day</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="heatmaps">Heatmaps</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHabits.map((habit) => (
                <Card key={habit._id} className="border-2 bg-card/50 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{habit.name}</CardTitle>
                      <Badge style={{ backgroundColor: habit.color || "#8b5cf6" }}>
                        {habit.frequency}
                      </Badge>
                    </div>
                    {habit.category && (
                      <Badge variant="outline" className="w-fit">
                        {habit.category}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{habit.description}</p>
                    {habit.challengeLength && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{habit.challengeLength} Day Challenge</span>
                          <span>
                            {habit.startDate
                              ? `Started ${new Date(habit.startDate).toLocaleDateString()}`
                              : "Not started"}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="heatmaps" className="space-y-6">
            {filteredHabits.map((habit) => (
              <HabitHeatmap
                key={habit._id}
                habitId={habit._id}
                habitName={habit.name}
                startDate={startDate}
                endDate={endDate}
              />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
