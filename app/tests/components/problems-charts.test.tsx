import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import * as React from "react";
import { ProblemStatsDonut } from "@/components/problems/charts/ProblemStatsDonut";
import { ActivityHeatmap } from "@/components/problems/charts/ActivityHeatmap";
import { ProgressRing } from "@/components/problems/ProgressRing";

describe("ProblemStatsDonut Component", () => {
  it("renders empty state when solved is 0", () => {
    const html = renderToStaticMarkup(
      <ProblemStatsDonut
        total={10}
        solved={0}
        easy={{ solved: 0, total: 4 }}
        medium={{ solved: 0, total: 4 }}
        hard={{ solved: 0, total: 2 }}
        knowledgeCount={0}
      />,
    );

    expect(html).toContain("0");
    expect(html).toContain("/10");
    expect(html).toContain("Start solving!");
    expect(html).toContain("0 Knowledge");
    expect(html).toContain("10 Total Tracked");
  });

  it("renders correct progress and colors when solved > 0", () => {
    const html = renderToStaticMarkup(
      <ProblemStatsDonut
        total={20}
        solved={10}
        easy={{ solved: 5, total: 8 }}
        medium={{ solved: 3, total: 8 }}
        hard={{ solved: 2, total: 4 }}
        knowledgeCount={4}
      />,
    );

    // Center text
    expect(html).toContain("10");
    expect(html).toContain("/20");
    expect(html).toContain("50% Solved");

    // Colors
    expect(html).toContain("#46C6C2"); // Easy color
    expect(html).toContain("#eab308"); // Medium color
    expect(html).toContain("#ef4444"); // Hard color

    // Legend Breakdown
    expect(html).toContain("5");
    expect(html).toContain("/8");
    expect(html).toContain("3");
    expect(html).toContain("2");
    expect(html).toContain("/4");

    // Secondary badges
    expect(html).toContain("4 Knowledge");
    expect(html).toContain("20 Total Tracked");
  });
});

describe("ActivityHeatmap Component", () => {
  it("renders calendar heatmap grid with month and day labels", () => {
    const mockSubmissions = {
      "2026-03-01": 2,
      "2026-03-02": 3,
    };

    const html = renderToStaticMarkup(
      <ActivityHeatmap submissionActivities={mockSubmissions} />,
    );

    expect(html).toContain("Activity &amp; Consistency");
    expect(html).toContain("Solves");
    expect(html).toContain("Vault Notes");
    expect(html).toContain("Mon");
    expect(html).toContain("Wed");
    expect(html).toContain("Fri");
    expect(html).toContain("Less");
    expect(html).toContain("More");
    expect(html).toContain("#46C6C2");
  });
});

describe("ProgressRing Component", () => {
  it("renders full emerald ring with checkmark for SOLVED", () => {
    const html = renderToStaticMarkup(<ProgressRing status="SOLVED" />);

    expect(html).toContain('title="Solved on LeetCode"');
    expect(html).toContain("#10b981");
  });

  it("renders half-filled ring with amber accent for ATTEMPTED", () => {
    const html = renderToStaticMarkup(<ProgressRing status="ATTEMPTED" />);

    expect(html).toContain('title="Attempted"');
    expect(html).toContain("#f59e0b");
  });

  it("renders dashed ring for TODO", () => {
    const html = renderToStaticMarkup(<ProgressRing status="TODO" />);

    expect(html).toContain('title="Todo"');
    expect(html).toContain('stroke-dasharray="2.5 2.5"');
  });
});
