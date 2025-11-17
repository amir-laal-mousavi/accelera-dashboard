import { describe, it, expect } from 'vitest';
import { calculateCaloriesBurned, getIntensityOptions, MET_VALUES } from '../calorieCalculator';

describe('calculateCaloriesBurned', () => {
  describe('valid calculations', () => {
    it('should calculate calories for cardio steady moderate intensity', () => {
      const result = calculateCaloriesBurned({
        weight: 70,
        duration: 30,
        workoutType: 'cardio-steady',
        intensity: 'moderate',
      });

      // Expected: 7 * 3.5 * 70 / 200 * 30 = 257.25 → 257
      expect(result.calories).toBe(257);
      expect(result.met).toBe(7);
    });

    it('should calculate calories for HIIT workout', () => {
      const result = calculateCaloriesBurned({
        weight: 80,
        duration: 20,
        workoutType: 'cardio-hiit',
        intensity: 'very-intense',
      });

      // Expected: 12 * 3.5 * 80 / 200 * 20 = 336
      expect(result.calories).toBe(336);
      expect(result.met).toBe(12);
    });

    it('should calculate calories for strength training', () => {
      const result = calculateCaloriesBurned({
        weight: 75,
        duration: 45,
        workoutType: 'strength',
        intensity: 'moderate',
      });

      // Expected: 5.5 * 3.5 * 75 / 200 * 45 = 324.84 → 325
      expect(result.calories).toBe(325);
      expect(result.met).toBe(5.5);
    });

    it('should calculate calories for bodyweight exercises', () => {
      const result = calculateCaloriesBurned({
        weight: 65,
        duration: 25,
        workoutType: 'bodyweight',
        intensity: 'moderate',
      });

      // Expected: 5 * 3.5 * 65 / 200 * 25 = 142.19 → 142
      expect(result.calories).toBe(142);
      expect(result.met).toBe(5);
    });

    it('should round calories to nearest whole number', () => {
      const result = calculateCaloriesBurned({
        weight: 70,
        duration: 30,
        workoutType: 'cardio-steady',
        intensity: 'light',
      });

      expect(Number.isInteger(result.calories)).toBe(true);
    });

    it('should handle different weight values correctly', () => {
      const result1 = calculateCaloriesBurned({
        weight: 50,
        duration: 30,
        workoutType: 'cardio-steady',
        intensity: 'moderate',
      });

      const result2 = calculateCaloriesBurned({
        weight: 100,
        duration: 30,
        workoutType: 'cardio-steady',
        intensity: 'moderate',
      });

      // Heavier person should burn more calories
      expect(result2.calories).toBeGreaterThan(result1.calories);
      expect(result2.calories).toBe(result1.calories * 2);
    });

    it('should handle different duration values correctly', () => {
      const result1 = calculateCaloriesBurned({
        weight: 70,
        duration: 15,
        workoutType: 'cardio-steady',
        intensity: 'moderate',
      });

      const result2 = calculateCaloriesBurned({
        weight: 70,
        duration: 60,
        workoutType: 'cardio-steady',
        intensity: 'moderate',
      });

      // Longer duration should burn more calories
      expect(result2.calories).toBeGreaterThan(result1.calories);
      expect(result2.calories).toBe(result1.calories * 4);
    });

    it('should use default MET value for unknown workout-intensity combination', () => {
      const result = calculateCaloriesBurned({
        weight: 70,
        duration: 30,
        workoutType: 'other' as any,
        intensity: 'unknown' as any,
      });

      // Should use default MET of 5
      // Expected: 5 * 3.5 * 70 / 200 * 30 = 183.75 → 184
      expect(result.calories).toBe(184);
      expect(result.met).toBe(5);
    });
  });

  describe('validation', () => {
    it('should throw error for zero weight', () => {
      expect(() =>
        calculateCaloriesBurned({
          weight: 0,
          duration: 30,
          workoutType: 'cardio-steady',
          intensity: 'moderate',
        })
      ).toThrow('Weight must be greater than 0');
    });

    it('should throw error for negative weight', () => {
      expect(() =>
        calculateCaloriesBurned({
          weight: -70,
          duration: 30,
          workoutType: 'cardio-steady',
          intensity: 'moderate',
        })
      ).toThrow('Weight must be greater than 0');
    });

    it('should throw error for zero duration', () => {
      expect(() =>
        calculateCaloriesBurned({
          weight: 70,
          duration: 0,
          workoutType: 'cardio-steady',
          intensity: 'moderate',
        })
      ).toThrow('Duration must be greater than 0');
    });

    it('should throw error for negative duration', () => {
      expect(() =>
        calculateCaloriesBurned({
          weight: 70,
          duration: -30,
          workoutType: 'cardio-steady',
          intensity: 'moderate',
        })
      ).toThrow('Duration must be greater than 0');
    });

    it('should throw error for missing workout type', () => {
      expect(() =>
        calculateCaloriesBurned({
          weight: 70,
          duration: 30,
          workoutType: '' as any,
          intensity: 'moderate',
        })
      ).toThrow('Workout type is required');
    });

    it('should throw error for missing intensity', () => {
      expect(() =>
        calculateCaloriesBurned({
          weight: 70,
          duration: 30,
          workoutType: 'cardio-steady',
          intensity: '' as any,
        })
      ).toThrow('Intensity is required');
    });
  });

  describe('edge cases', () => {
    it('should handle very small weight values', () => {
      const result = calculateCaloriesBurned({
        weight: 0.1,
        duration: 30,
        workoutType: 'cardio-steady',
        intensity: 'moderate',
      });

      expect(result.calories).toBeGreaterThan(0);
      expect(Number.isInteger(result.calories)).toBe(true);
    });

    it('should handle very large weight values', () => {
      const result = calculateCaloriesBurned({
        weight: 200,
        duration: 30,
        workoutType: 'cardio-steady',
        intensity: 'moderate',
      });

      expect(result.calories).toBeGreaterThan(0);
      expect(Number.isInteger(result.calories)).toBe(true);
    });

    it('should handle very short duration', () => {
      const result = calculateCaloriesBurned({
        weight: 70,
        duration: 1,
        workoutType: 'cardio-steady',
        intensity: 'moderate',
      });

      expect(result.calories).toBeGreaterThan(0);
      expect(Number.isInteger(result.calories)).toBe(true);
    });

    it('should handle very long duration', () => {
      const result = calculateCaloriesBurned({
        weight: 70,
        duration: 180,
        workoutType: 'cardio-steady',
        intensity: 'moderate',
      });

      expect(result.calories).toBeGreaterThan(0);
      expect(Number.isInteger(result.calories)).toBe(true);
    });
  });

  describe('MET values', () => {
    it('should have correct MET values for all workout-intensity combinations', () => {
      expect(MET_VALUES['cardio-steady-light']).toBe(3.5);
      expect(MET_VALUES['cardio-steady-moderate']).toBe(7);
      expect(MET_VALUES['cardio-steady-vigorous']).toBe(9);
      expect(MET_VALUES['cardio-hiit-very-intense']).toBe(12);
      expect(MET_VALUES['strength-light']).toBe(3.5);
      expect(MET_VALUES['strength-moderate']).toBe(5.5);
      expect(MET_VALUES['strength-heavy']).toBe(7);
      expect(MET_VALUES['bodyweight-light']).toBe(3);
      expect(MET_VALUES['bodyweight-moderate']).toBe(5);
      expect(MET_VALUES['bodyweight-hard']).toBe(7);
      expect(MET_VALUES['other-light']).toBe(3);
      expect(MET_VALUES['other-moderate']).toBe(5);
      expect(MET_VALUES['other-hard']).toBe(7);
    });
  });
});

describe('getIntensityOptions', () => {
  it('should return correct options for cardio-steady', () => {
    const options = getIntensityOptions('cardio-steady');
    expect(options).toEqual(['light', 'moderate', 'vigorous']);
  });

  it('should return correct options for cardio-hiit', () => {
    const options = getIntensityOptions('cardio-hiit');
    expect(options).toEqual(['very-intense']);
  });

  it('should return correct options for strength', () => {
    const options = getIntensityOptions('strength');
    expect(options).toEqual(['light', 'moderate', 'heavy']);
  });

  it('should return correct options for bodyweight', () => {
    const options = getIntensityOptions('bodyweight');
    expect(options).toEqual(['light', 'moderate', 'hard']);
  });

  it('should return correct options for other', () => {
    const options = getIntensityOptions('other');
    expect(options).toEqual(['light', 'moderate', 'hard']);
  });

  it('should return empty array for unknown workout type', () => {
    const options = getIntensityOptions('unknown' as any);
    expect(options).toEqual([]);
  });
});
