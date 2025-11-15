import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HabitHeatmap } from "./HabitHeatmap";
import { HabitFilters } from "./HabitFilters";
import { Id } from "@/convex/_generated/dataModel";
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
  const [activeTab, setActiveTab] = useState("overview");

  // Memoize query args to prevent infinite loops
  const queryArgs = useMemo(() => ({
    startDate,
    endDate,
  }), [startDate, endDate]);

  // Get aggregated stats - only when needed
  const aggregatedStats = useQuery(
    api.habits.getAggregatedStats, 
    activeTab === "overview" ? queryArgs : "skip"
  );

  // Memoize filtered and sorted habits to prevent infinite loops
  const filteredHabits = useMemo(() => {
    // Filter habits
    let filtered = habits.filter((h) => {
      if (categoryFilter === "all") return true;
      return h.category === categoryFilter;
    });

    // Sort habits
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "date":
          return (b.startDate || 0) - (a.startDate || 0);
        case "date-old":
          return (a.startDate || 0) - (b.startDate || 0);
        case "streak":
        case "completion":
          // For now, sort by name when stats-based sorting is selected
          // Individual stats queries were causing infinite loops
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [habits, categoryFilter, sortBy]);

  const categories = useMemo(() => {
    return Array.from(new Set(habits.map((h) => h.category).filter(Boolean))) as string[];
  }, [habits]);
  
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
            <Card className="border-2 bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Total Active Habits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                  {aggregatedStats.totalHabits}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Currently tracking</p>
              </CardContent>
            </Card>
            <Card className="border-2 bg-gradient-to-br from-teal-500/10 to-teal-500/5 hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300 dark:from-teal-400/10 dark:to-teal-400/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Best Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold bg-gradient-to-br from-teal-500 to-teal-400 bg-clip-text text-transparent dark:from-teal-400 dark:to-teal-300">
                  {aggregatedStats.bestDay.count}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {aggregatedStats.bestDay.date ? new Date(aggregatedStats.bestDay.date).toLocaleDateString() : "N/A"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 dark:from-cyan-400/10 dark:to-cyan-400/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Avg Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold bg-gradient-to-br from-cyan-500 to-cyan-400 bg-clip-text text-transparent dark:from-cyan-400 dark:to-cyan-300">
                  {Object.keys(aggregatedStats.dailyCompletions).length > 0
                    ? Math.round(
                        Object.values(aggregatedStats.dailyCompletions).reduce((a, b) => a + b, 0) /
                          Object.keys(aggregatedStats.dailyCompletions).length
                      )
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">habits per day</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="heatmaps">Heatmaps</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHabits.map((habit) => (
                <Card 
                  key={habit._id} 
                  className="border-2 bg-card/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 backdrop-blur-sm"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-base font-bold">{habit.name}</CardTitle>
                      <Badge 
                        style={{ backgroundColor: habit.color || "#8b5cf6" }}
                        className="text-xs font-semibold shadow-md"
                      >
                        {habit.frequency}
                      </Badge>
                    </div>
                    {habit.category && (
                      <Badge variant="outline" className="w-fit border-2">
                        {habit.category}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{habit.description}</p>
                    {habit.challengeLength && (
                      <div className="space-y-2 p-3 rounded-lg bg-muted/30 border">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-primary">{habit.challengeLength} Day Challenge</span>
                          <span className="text-muted-foreground">
                            {habit.startDate
                              ? new Date(habit.startDate).toLocaleDateString()
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
            {activeTab === "heatmaps" && filteredHabits.map((habit) => (
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

export default HabitsSection;