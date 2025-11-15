import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, Copy } from "lucide-react";
import { toast } from "sonner";
import { calculateCaloriesBurned, getIntensityOptions, type WorkoutType, type Intensity } from "@/lib/calorieCalculator";

export function CalorieCalculator() {
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [workoutType, setWorkoutType] = useState<WorkoutType | "">("");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState<Intensity | "">("");
  const [distance, setDistance] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [avgWeight, setAvgWeight] = useState("");
  const [workoutName, setWorkoutName] = useState("");
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(null);

  const resetForm = () => {
    setWeight("");
    setAge("");
    setSex("");
    setWorkoutType("");
    setDuration("");
    setIntensity("");
    setDistance("");
    setSets("");
    setReps("");
    setAvgWeight("");
    setWorkoutName("");
    setCalculatedCalories(null);
  };

  const calculateCalories = () => {
    // Validation
    if (!weight || parseFloat(weight) <= 0) {
      toast.error("Please enter a valid weight");
      return;
    }
    if (!duration || parseFloat(duration) <= 0) {
      toast.error("Please enter a valid duration");
      return;
    }
    if (!workoutType) {
      toast.error("Please select a workout type");
      return;
    }
    if (!intensity) {
      toast.error("Please select an intensity level");
      return;
    }

    try {
      const result = calculateCaloriesBurned({
        weight: parseFloat(weight),
        duration: parseFloat(duration),
        workoutType: workoutType as WorkoutType,
        intensity: intensity as Intensity,
      });

      setCalculatedCalories(result.calories);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to calculate calories");
    }
  };

  const copyToClipboard = () => {
    if (calculatedCalories !== null) {
      navigator.clipboard.writeText(`${calculatedCalories} kcal`);
      toast.success("Copied to clipboard!");
    }
  };

  // Handle Esc key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        resetForm();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const intensityOptions = workoutType ? getIntensityOptions(workoutType as WorkoutType) : [];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-accent/50"
          title="Calorie calculator"
        >
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Workout Calorie Calculator</DialogTitle>
          <DialogDescription>
            Quick estimate – does not change your logs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Basic Inputs */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Body Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age (optional)</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="30"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sex (optional)</Label>
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Step 2: Workout Type */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Workout Details</h3>
            <div className="space-y-2">
              <Label htmlFor="workoutType">Workout Type *</Label>
              <Select value={workoutType} onValueChange={(v) => {
                setWorkoutType(v as WorkoutType);
                setIntensity("");
                setCalculatedCalories(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select workout type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardio-steady">Cardio – Steady</SelectItem>
                  <SelectItem value="cardio-hiit">Cardio – HIIT / Intense</SelectItem>
                  <SelectItem value="strength">Strength – Weights</SelectItem>
                  <SelectItem value="bodyweight">Bodyweight / Functional</SelectItem>
                  <SelectItem value="other">Other (manual input)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional fields based on workout type */}
            {workoutType && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="30"
                      value={duration}
                      onChange={(e) => {
                        setDuration(e.target.value);
                        setCalculatedCalories(null);
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="intensity">Intensity *</Label>
                    <Select value={intensity} onValueChange={(v) => {
                      setIntensity(v as Intensity);
                      setCalculatedCalories(null);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select intensity" />
                      </SelectTrigger>
                      <SelectContent>
                        {intensityOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1).replace("-", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Cardio steady - distance */}
                {workoutType === "cardio-steady" && (
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance (km) - optional</Label>
                    <Input
                      id="distance"
                      type="number"
                      placeholder="5"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                    />
                  </div>
                )}

                {/* Strength - sets/reps/weight */}
                {workoutType === "strength" && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sets">Sets (optional)</Label>
                      <Input
                        id="sets"
                        type="number"
                        placeholder="3"
                        value={sets}
                        onChange={(e) => setSets(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reps">Reps/set (optional)</Label>
                      <Input
                        id="reps"
                        type="number"
                        placeholder="10"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="avgWeight">Avg weight (kg)</Label>
                      <Input
                        id="avgWeight"
                        type="number"
                        placeholder="20"
                        value={avgWeight}
                        onChange={(e) => setAvgWeight(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Other - workout name */}
                {workoutType === "other" && (
                  <div className="space-y-2">
                    <Label htmlFor="workoutName">Workout Name</Label>
                    <Input
                      id="workoutName"
                      type="text"
                      placeholder="e.g., Yoga, Pilates"
                      value={workoutName}
                      onChange={(e) => setWorkoutName(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Calculate Button */}
          <Button onClick={calculateCalories} className="w-full">
            Calculate
          </Button>

          {/* Result Display */}
          {calculatedCalories !== null && (
            <div className="space-y-3 p-4 rounded-lg border-2 bg-accent/10 border-accent-teal/30">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Estimated calories burned:</p>
                <p className="text-4xl font-bold bg-gradient-to-br from-accent-teal to-accent-cyan bg-clip-text text-transparent">
                  {calculatedCalories} kcal
                </p>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Based on: {weight}kg, {duration} minutes, {workoutType.replace("-", " ")} – {intensity} intensity
              </div>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="w-full gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}