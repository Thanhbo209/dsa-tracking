/**
 * Activity date formatting and streak calculations.
 */

/**
 * Format a Date or ISO string into a YYYY-MM-DD key in a specified timezone.
 * Defaults to system local time if timeZone is omitted, or UTC if specified.
 */
export function formatDateKey(
  date: Date | string,
  timeZone?: string,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timeZone || undefined,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(d);
  } catch {
    // Fallback if timezone string is invalid
    return d.toISOString().slice(0, 10);
  }
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
}

/**
 * Given a list of YYYY-MM-DD date keys that had activity,
 * calculate current consecutive day streak and all-time longest streak.
 *
 * @param activeDates Array of YYYY-MM-DD strings with activity
 * @param todayKey Today's YYYY-MM-DD string
 */
export function calculateStreak(
  activeDates: string[],
  todayKey?: string,
): StreakResult {
  const uniqueDates = Array.from(
    new Set(activeDates.filter((d) => Boolean(d) && /^\d{4}-\d{2}-\d{2}$/.test(d))),
  ).sort();

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0 };
  }

  const dateSet = new Set(uniqueDates);
  const now = new Date();
  const today = todayKey || formatDateKey(now);

  // Helper to get previous day string (YYYY-MM-DD)
  const getPrevDay = (dateStr: string): string => {
    const parts = dateStr.split("-").map(Number);
    // Use UTC date arithmetic to avoid daylight savings jumps
    const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  };

  // 1. Calculate Current Streak
  let currentStreak = 0;
  const yesterday = getPrevDay(today);

  // Check if streak is alive: either active today or active yesterday
  let checkDate = "";
  if (dateSet.has(today)) {
    checkDate = today;
  } else if (dateSet.has(yesterday)) {
    checkDate = yesterday;
  }

  while (checkDate && dateSet.has(checkDate)) {
    currentStreak += 1;
    checkDate = getPrevDay(checkDate);
  }

  // 2. Calculate Longest Streak
  let longestStreak = 0;
  let runningStreak = 0;
  let expectedNextDay = "";

  for (let i = 0; i < uniqueDates.length; i++) {
    const currentDate = uniqueDates[i];

    if (i === 0 || currentDate === expectedNextDay) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }

    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }

    // Next expected day is currentDate + 1
    const parts = currentDate.split("-").map(Number);
    const nextD = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    nextD.setUTCDate(nextD.getUTCDate() + 1);
    expectedNextDay = nextD.toISOString().slice(0, 10);
  }

  return {
    currentStreak,
    longestStreak,
    totalActiveDays: uniqueDates.length,
  };
}

/**
 * Aggregate an array of timestamps into { [YYYY-MM-DD]: count }
 */
export function aggregateDailyActivities(
  timestamps: (Date | string | null | undefined)[],
  timeZone?: string,
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const ts of timestamps) {
    if (!ts) continue;
    const key = formatDateKey(ts, timeZone);
    if (!key) continue;
    counts[key] = (counts[key] || 0) + 1;
  }

  return counts;
}
