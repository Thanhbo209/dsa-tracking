import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PublicApproachList } from "@/components/profile/PublicApproachList";
import type { PublicProblemDetail } from "@/lib/profile/service";

describe("PublicApproachList Component", () => {
  it("strips multiple repeated legacy status suffixes and renders badge exactly once", () => {
    const legacyApproach: PublicProblemDetail["approaches"][number] = {
      id: "approach-1",
      name: "Horizontal Scanning (My Accepted Implementation) (My Accepted Implementation) (My Accepted Implementation)",
      coreIdea: "Compare characters across strings sequentially",
      whyItWorks: "Prefix must be common to all strings",
      whenToUse: "When strings are small or prefix diminishes quickly",
      timeComplexity: "O(S)",
      spaceComplexity: "O(1)",
      pros: "Simple and intuitive",
      cons: "Scans unnecessary characters if one string is short",
      notes: "Standard approach",
      mistakes: "Index out of bounds on empty string",
      solutions: [
        {
          id: "sol-1",
          name: "Horizontal Scanning Solution",
          description: "Iterates through array updating prefix",
          algorithm: "1. Check empty array\n2. Iterate through strings\n3. Trim prefix until match",
          notes: "Optimal O(1) auxiliary space",
          codes: [
            {
              id: "code-1",
              language: "python",
              code: "def longestCommonPrefix(strs): pass",
              notes: "Actual accepted submission code (python, 4ms).",
            },
          ],
        },
      ],
    };

    const html = renderToStaticMarkup(
      <PublicApproachList approaches={[legacyApproach]} />,
    );

    // Approach heading must render pure algorithmic name without suffixes
    expect(html).toContain(">Horizontal Scanning<");
    expect(html).not.toContain(">Horizontal Scanning (My Accepted Implementation)<");

    // Status badge must be rendered exactly once
    const badgeOccurrences = (html.match(/My Accepted Implementation/g) || []).length;
    expect(badgeOccurrences).toBe(1);

    // Implementation code block uses CodeViewer
    expect(html).toContain("longestCommonPrefix");
    expect(html).toContain("PYTHON");

    // Step-by-Step guide is rendered with readable body styling
    expect(html).toContain("Step-by-Step Guide");
    expect(html).toContain("1. Check empty array");
  });

  it("handles clean approach names without any suffixes properly", () => {
    const cleanApproach: PublicProblemDetail["approaches"][number] = {
      id: "approach-2",
      name: "Binary Search",
      coreIdea: "Divide and conquer on prefix length",
      whyItWorks: "If prefix of length L is valid, prefix of length < L is also valid",
      whenToUse: "When searching monotonic properties",
      timeComplexity: "O(S log m)",
      spaceComplexity: "O(1)",
      pros: "Fewer string comparisons on long strings",
      cons: "More complex to implement",
      notes: null,
      mistakes: null,
      solutions: [],
    };

    const html = renderToStaticMarkup(
      <PublicApproachList approaches={[cleanApproach]} />,
    );

    expect(html).toContain(">Binary Search<");
    expect(html).not.toContain("My Accepted Implementation");
    expect(html).not.toContain("My Attempt");
  });
});
