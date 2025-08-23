import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export function money(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}