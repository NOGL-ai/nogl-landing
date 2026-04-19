/**
 * Computes the next scheduled run time for a repricing rule.
 * Pure utility — no DB access.
 */
export function computeNextRunAt(
  scheduleType: "MANUAL" | "HOURLY" | "DAILY" | "WEEKLY",
  scheduleHour?: number,
  scheduleDow?: number
): Date | null {
  if (scheduleType === "MANUAL") return null;

  const now = new Date();

  if (scheduleType === "HOURLY") {
    const next = new Date(now);
    next.setMinutes(0, 0, 0);
    next.setHours(next.getHours() + 1);
    return next;
  }

  if (scheduleType === "DAILY") {
    const hour = scheduleHour ?? 7;
    const next = new Date(now);
    next.setHours(hour, 0, 0, 0);
    // If that time has already passed today, move to tomorrow
    if (next <= now) next.setDate(next.getDate() + 1);
    return next;
  }

  if (scheduleType === "WEEKLY") {
    const targetDow = scheduleDow ?? 1; // Monday
    const hour = scheduleHour ?? 7;
    const next = new Date(now);
    next.setHours(hour, 0, 0, 0);
    const daysUntil = (targetDow - now.getDay() + 7) % 7 || 7;
    next.setDate(next.getDate() + daysUntil);
    return next;
  }

  return null;
}
