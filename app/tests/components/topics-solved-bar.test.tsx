import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import * as React from "react";
import {
  TopicsSolvedBar,
  type SolvedTopicItem,
} from "@/components/problems/TopicsSolvedBar";

describe("TopicsSolvedBar Component", () => {
  const mockSolvedTopics: SolvedTopicItem[] = [
    { topicName: "Array", solvedCount: 5 },
    { topicName: "Hash Table", solvedCount: 3 },
    { topicName: "Dynamic Programming", solvedCount: 1 },
  ];

  it("returns null when solvedTopics is empty", () => {
    const html = renderToStaticMarkup(
      <TopicsSolvedBar
        solvedTopics={[]}
        selectedTopics={[]}
        onToggleTopic={vi.fn()}
        onClearTopics={vi.fn()}
      />,
    );

    expect(html).toBe("");
  });

  it("renders All Topics and topic chips with solved count numbers", () => {
    const html = renderToStaticMarkup(
      <TopicsSolvedBar
        solvedTopics={mockSolvedTopics}
        selectedTopics={[]}
        onToggleTopic={vi.fn()}
        onClearTopics={vi.fn()}
      />,
    );

    expect(html).toContain("Topics Solved:");
    expect(html).toContain("All Topics");
    expect(html).toContain("Array");
    expect(html).toContain("5");
    expect(html).toContain("Hash Table");
    expect(html).toContain("3");
    expect(html).toContain("Dynamic Programming");
    expect(html).toContain("1");
  });

  it("applies active styles when topics are selected", () => {
    const html = renderToStaticMarkup(
      <TopicsSolvedBar
        solvedTopics={mockSolvedTopics}
        selectedTopics={["Array", "Dynamic Programming"]}
        onToggleTopic={vi.fn()}
        onClearTopics={vi.fn()}
      />,
    );

    // Array should be pressed/selected
    expect(html).toContain('aria-pressed="true"');
    // All Topics should NOT be pressed
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain("#46C6C2");
  });
});
