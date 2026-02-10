import { type ClassValue, clsx } from "clsx";

// Utility function for merging class names
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format date utility
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Delay utility for async operations
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
