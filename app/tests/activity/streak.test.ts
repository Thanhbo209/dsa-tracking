import { describe, it, expect } from "vitest";
import {
  formatDateKey,
  calculateStreak,
  aggregateDailyActivities,
} from "@/lib/activity/streak";

describe("formatDateKey and timezone handling", () => {
  it("formats date into YYYY-MM-DD", () => {
    const d = new Date(Date.UTC(2026, 8, 11, 4, 30, 0)); // 2026-09-11 04:30:00 UTC
    expect(formatDateKey(d, "UTC")).toBe("2026-09-11");
  });

  it("handles timezone shift (late night UTC+7 vs UTC)", () => {
    // 2026-09-10 17:30 UTC is 2026-09-11 00:30 in UTC+7 (Asia/Ho_Chi_Minh)
    const lateNightUTC = new Date(Date.UTC(2026, 8, 10, 17, 30, 0));

    expect(formatDateKey(lateNightUTC, "UTC")).toBe("2026-09-10");
    expect(formatDateKey(lateNightUTC, "Asia/Ho_Chi_Minh")).toBe("2026-09-11");
  });
});

describe("calculateStreak", () => {
  it("returns 0 for empty activity dates", () => {
    const res = calculateStreak([]);
    expect(res).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
    });
  });

  it("calculates active streak when user solved today", () => {
    const dates = ["2026-09-09", "2026-09-10", "2026-09-11"];
    const res = calculateStreak(dates, "2026-09-11");

    expect(res.currentStreak).toBe(3);
    expect(res.longestStreak).toBe(3);
    expect(res.totalActiveDays).toBe(3);
  });

  it("maintains streak when user was active yesterday but hasn't solved today yet", () => {
    const dates = ["2026-09-08", "2026-09-09", "2026-09-10"];
    const res = calculateStreak(dates, "2026-09-11");

    // Streak is still alive from yesterday!
    expect(res.currentStreak).toBe(3);
    expect(res.longestStreak).toBe(3);
  });

  it("resets current streak to 0 if gap is 2 or more days", () => {
    const dates = ["2026-09-01", "2026-09-02", "2026-09-03"];
    const res = calculateStreak(dates, "2026-09-11");

    expect(res.currentStreak).toBe(0);
    expect(res.longestStreak).toBe(3);
    expect(res.totalActiveDays).toBe(3);
  });

  it("calculates longest streak correctly across month boundaries", () => {
    const dates = [
      "2026-01-30",
      "2026-01-31",
      "2026-02-01",
      "2026-02-02", // 4 days streak across Jan-Feb boundary
      "2026-02-10",
      "2026-02-11",
    ];
    const res = calculateStreak(dates, "2026-02-12");

    expect(res.longestStreak).toBe(4);
    expect(res.currentStreak).toBe(2);
    expect(res.totalActiveDays).toBe(6);
  });

  it("calculates streak correctly across year boundary (Dec 31 to Jan 1)", () => {
    const dates = ["2025-12-30", "2025-12-31", "2026-01-01", "2026-01-02"];
    const res = calculateStreak(dates, "2026-01-02");

    expect(res.currentStreak).toBe(4);
    expect(res.longestStreak).toBe(4);
  });
});

describe("aggregateDailyActivities", () => {
  it("counts multiple activities on the same day", () => {
    const timestamps = [
      new Date(Date.UTC(2026, 8, 11, 2, 0, 0)),
      new Date(Date.UTC(2026, 8, 11, 5, 0, 0)),
      new Date(Date.UTC(2026, 8, 10, 10, 0, 0)),
      null,
      undefined,
    ];

    const aggregated = aggregateDailyActivities(timestamps, "UTC");
    expect(aggregated).toEqual({
      "2026-09-11": 2,
      "2026-09-10": 1,
    });
  });
});
