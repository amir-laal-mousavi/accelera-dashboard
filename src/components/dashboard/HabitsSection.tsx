import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HabitHeatmap } from "./HabitHeatmap";
import { Id } from "@/convex/_generated/dataModel";

interface Habit {
  _id: Id<"habits">;
  name: string;
  description?: string;
  frequency: string;
  targetDays?: number;
  color?: string;
}

interface HabitsSectionProps {
  habits: Array<Habit>;
  startDate: number;
  endDate: number;
}

export function HabitsSection({ habits, startDate, endDate }: HabitsSectionProps) {
  if (habits.length === 0) {
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
    <Card>
      <CardHeader>
        <CardTitle>Active Habits</CardTitle>
        <CardDescription>Your current habit tracking ({habits.length} habits)</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="heatmaps">Heatmaps</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habits.map((habit) => (
                <div key={habit._id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{habit.name}</h4>
                    <Badge style={{ backgroundColor: habit.color || "#8b5cf6" }}>
                      {habit.frequency}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{habit.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="heatmaps" className="space-y-6">
            {habits.map((habit) => (
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
