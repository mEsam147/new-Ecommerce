// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to combine class names conditionally
 * Uses `clsx` for conditional logic + `twMerge` to remove duplicates
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Compare two arrays for equality (by value)
 */
export const compareArrays = (a: any[], b: any[]) => {
  return a.length === b.length && a.every((val, index) => val === b[index]);
};
