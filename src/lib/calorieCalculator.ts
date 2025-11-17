export type WorkoutType = "cardio-steady" | "cardio-hiit" | "strength" | "bodyweight" | "other";
export type Intensity = "light" | "moderate" | "vigorous" | "very-intense" | "heavy" | "hard";

export const MET_VALUES: Record<string, number> = {
  "cardio-steady-light": 3.5,
  "cardio-steady-moderate": 7,
  "cardio-steady-vigorous": 9,
  "cardio-hiit-very-intense": 12,
  "strength-light": 3.5,
  "strength-moderate": 5.5,
  "strength-heavy": 7,
  "bodyweight-light": 3,
  "bodyweight-moderate": 5,
  "bodyweight-hard": 7,
  "other-light": 3,
  "other-moderate": 5,
  "other-hard": 7,
};

export interface CalorieCalculationInput {
  weight: number;
  duration: number;
  workoutType: WorkoutType;
  intensity: Intensity;
}

export interface CalorieCalculationResult {
  calories: number;
  met: number;
}

/**
 * Calculate calories burned using MET-based formula
 * Formula: MET * 3.5 * weight(kg) / 200 * duration(minutes)
 * 
 * @param input - Calculation parameters
 * @returns Calculated calories and MET value used
 * @throws Error if invalid input provided
 */
export function calculateCaloriesBurned(input: CalorieCalculationInput): CalorieCalculationResult {
  const { weight, duration, workoutType, intensity } = input;

  // Validation
  if (weight <= 0) {
    throw new Error("Weight must be greater than 0");
  }
  if (duration <= 0) {
    throw new Error("Duration must be greater than 0");
  }
  if (!workoutType) {
    throw new Error("Workout type is required");
  }
  if (!intensity) {
    throw new Error("Intensity is required");
  }

  // Get MET value based on workout type and intensity
  const metKey = `${workoutType}-${intensity}`;
  const met = MET_VALUES[metKey] || 5; // Default to 5 if not found

  // Calculate calories: MET * 3.5 * weight(kg) / 200 * duration(minutes)
  const calories = Math.round((met * 3.5 * weight / 200) * duration);

  return { calories, met };
}

/**
 * Get available intensity options for a given workout type
 */
export function getIntensityOptions(workoutType: WorkoutType): Intensity[] {
  switch (workoutType) {
    case "cardio-steady":
      return ["light", "moderate", "vigorous"];
    case "cardio-hiit":
      return ["very-intense"];
    case "strength":
      return ["light", "moderate", "heavy"];
    case "bodyweight":
    case "other":
      return ["light", "moderate", "hard"];
    default:
      return [];
  }
}
