// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { calculateCalories } from '../calorieCalculator';

describe('calculateCalories', () => {
  it('should calculate calories correctly', () => {
    const result = calculateCalories({
      weight: 70,
      height: 175,
      age: 30,
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'maintain'
    });
    
    expect(result).toBeGreaterThan(0);
  });
});
