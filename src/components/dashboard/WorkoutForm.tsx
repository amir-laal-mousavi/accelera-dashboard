import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function WorkoutForm() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState("");
  const [exercise, setExercise] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [intensity, setIntensity] = useState("Medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createWorkout = useMutation(api.workouts.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session.trim() || !exercise.trim()) {
      toast.error("Please enter session and exercise name");
      return;
    }

    setIsSubmitting(true);
    try {
      await createWorkout({
        date: new Date(date).getTime(),
        session: session.trim(),
        exercise: exercise.trim(),
        sets: sets ? parseInt(sets) : undefined,
        repsPerSet: reps ? parseInt(reps) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        duration: duration ? parseInt(duration) : undefined,
        calories: calories ? parseInt(calories) : undefined,
        intensity: intensity || undefined,
      });
      
      toast.success("Workout logged successfully!");
      setOpen(false);
      setSession("");
      setExercise("");
      setDate(new Date().toISOString().split('T')[0]);
      setSets("");
      setReps("");
      setWeight("");
      setDuration("");
      setCalories("");
      setIntensity("Medium");
    } catch (error) {
      toast.error("Failed to log workout");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Log Workout
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Workout</DialogTitle>
          <DialogDescription>Track your exercise session</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session">Session Name *</Label>
            <Input
              id="session"
              placeholder="e.g., Morning Cardio, Leg Day"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exercise">Exercise *</Label>
            <Input
              id="exercise"
              placeholder="e.g., Running, Squats"
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="intensity">Intensity</Label>
              <Select value={intensity} onValueChange={setIntensity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sets">Sets</Label>
              <Input
                id="sets"
                type="number"
                placeholder="0"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reps">Reps</Label>
              <Input
                id="reps"
                type="number"
                placeholder="0"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.5"
                placeholder="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="0"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                placeholder="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging..." : "Log Workout"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
