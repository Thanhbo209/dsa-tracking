import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  highlightCodeLine,
  isHashCommentLanguage,
  isPython,
  detectLanguageFromCode,
} from "@/components/problems/syntaxHighlighter";
import { CodeViewer } from "@/components/problems/CodeViewer";

describe("syntaxHighlighter - Python Division vs Comments", () => {
  describe("Language Detection & Resolution", () => {
    it("correctly identifies Python language strings", () => {
      expect(isPython("python")).toBe(true);
      expect(isPython("python3")).toBe(true);
      expect(isPython("py")).toBe(true);
      expect(isPython("PYTHON")).toBe(true);
      expect(isPython("Python 3")).toBe(true);
      expect(isPython("Actual accepted submission code (python, 4ms).")).toBe(true);
      expect(isPython("javascript")).toBe(false);
      expect(isPython("typescript")).toBe(false);
      expect(isPython("cpp")).toBe(false);
      expect(isPython("java")).toBe(false);
    });

    it("identifies other hash-comment languages", () => {
      expect(isHashCommentLanguage("ruby")).toBe(true);
      expect(isHashCommentLanguage("rb")).toBe(true);
      expect(isHashCommentLanguage("bash")).toBe(true);
      expect(isHashCommentLanguage("sh")).toBe(true);
    });

    it("detects Python from code heuristics when language is omitted or generic", () => {
      expect(
        detectLanguageFromCode("def twoSum(self, nums, target):\n    return []")
      ).toBe("python");
      expect(
        detectLanguageFromCode("class Solution(object):\n    pass")
      ).toBe("python");
      expect(detectLanguageFromCode("const x = 1;")).toBeUndefined();
    });
  });

  describe("Python Syntax Highlighting", () => {
    it("renders Python floor division // as operator and NOT as comment", () => {
      const line = "diff = (sum_bob - sum_alice) // 2";
      const nodes = highlightCodeLine(line, "python");
      const html = renderToStaticMarkup(<>{nodes}</>);

      // Must NOT contain comment green or italic styling on floor division
      expect(html).not.toContain("italic");
      expect(html).not.toContain("text-[#6a9955]");

      // Must highlight // as operator (#d4d4d4)
      expect(html).toContain('<span class="text-[#d4d4d4]">//</span>');

      // Must highlight 2 as number (#b5cea8)
      expect(html).toContain('<span class="text-[#b5cea8]">2</span>');

      // Identifiers & brackets
      expect(html).toContain("diff");
      expect(html).toContain("sum_bob");
      expect(html).toContain("sum_alice");
    });

    it("renders Python floor division assignment //= as operator and NOT as comment", () => {
      const line = "diff //= 2";
      const nodes = highlightCodeLine(line, "python");
      const html = renderToStaticMarkup(<>{nodes}</>);

      expect(html).not.toContain("italic");
      expect(html).not.toContain("text-[#6a9955]");
      expect(html).toContain('<span class="text-[#d4d4d4]">//=</span>');
      expect(html).toContain('<span class="text-[#b5cea8]">2</span>');
    });

    it("renders Python float division / as operator", () => {
      const line = "ratio = total / count";
      const nodes = highlightCodeLine(line, "python");
      const html = renderToStaticMarkup(<>{nodes}</>);

      expect(html).toContain('<span class="text-[#d4d4d4]">/</span>');
      expect(html).not.toContain("text-[#6a9955]");
    });

    it("renders Python exponentiation ** and **= as operators", () => {
      const line = "power = base ** 2";
      const nodes = highlightCodeLine(line, "python");
      const html = renderToStaticMarkup(<>{nodes}</>);

      expect(html).toContain('<span class="text-[#d4d4d4]">**</span>');
      expect(html).toContain('<span class="text-[#b5cea8]">2</span>');
    });

    it("renders Python # as comment with green italic styling", () => {
      const line = "# This is a valid Python comment";
      const nodes = highlightCodeLine(line, "python");
      const html = renderToStaticMarkup(<>{nodes}</>);

      expect(html).toContain('class="text-[#6a9955] italic"');
      expect(html).toContain("# This is a valid Python comment");
    });

    it("handles both floor division // and # comment on the same line", () => {
      const line = "diff = (sum_bob - sum_alice) // 2  # integer divide";
      const nodes = highlightCodeLine(line, "python");
      const html = renderToStaticMarkup(<>{nodes}</>);

      // // is operator
      expect(html).toContain('<span class="text-[#d4d4d4]">//</span>');
      expect(html).toContain('<span class="text-[#b5cea8]">2</span>');

      // # integer divide is comment
      expect(html).toContain(
        '<span class="text-[#6a9955] italic"># integer divide</span>'
      );
    });

    it("preserves // inside strings as string content and not operator or comment", () => {
      const line = 'url = "https://leetcode.com"';
      const nodes = highlightCodeLine(line, "python");
      const html = renderToStaticMarkup(<>{nodes}</>);

      expect(html).not.toContain("text-[#6a9955]");
      expect(html).toContain('<span class="text-[#ce9178]">&quot;https://leetcode.com&quot;</span>');
    });
  });

  describe("C-Family & Other Languages Syntax Highlighting", () => {
    it("renders C++ // as a line comment", () => {
      const line = "int diff = total / 2; // integer divide";
      const nodes = highlightCodeLine(line, "cpp");
      const html = renderToStaticMarkup(<>{nodes}</>);

      // / is operator
      expect(html).toContain('<span class="text-[#d4d4d4]">/</span>');
      // // integer divide is comment
      expect(html).toContain(
        '<span class="text-[#6a9955] italic">// integer divide</span>'
      );
    });

    it("renders JavaScript // as a line comment", () => {
      const line = "const diff = Math.floor(x / 2); // divide";
      const nodes = highlightCodeLine(line, "javascript");
      const html = renderToStaticMarkup(<>{nodes}</>);

      expect(html).toContain(
        '<span class="text-[#6a9955] italic">// divide</span>'
      );
    });

    it("renders C++ #include as preprocessor directive and not comment", () => {
      const line = "#include <vector>";
      const nodes = highlightCodeLine(line, "cpp");
      const html = renderToStaticMarkup(<>{nodes}</>);

      expect(html).not.toContain("text-[#6a9955]");
      expect(html).toContain("text-[#c586c0]");
      expect(html).toContain("#include");
    });
  });

  describe("CodeViewer Integration", () => {
    it("renders Python code with floor division correctly in CodeViewer without comment styling", () => {
      const pythonCode = `class Solution(object):
    def fairCandySwap(self, aliceSizes, bobSizes):
        diff = (sum(bobSizes) - sum(aliceSizes)) // 2
        return [candy, candy + diff]`;

      const html = renderToStaticMarkup(
        <CodeViewer code={pythonCode} language="python" badge="AI Recommended" />
      );

      // Header should show PYTHON
      expect(html).toContain("PYTHON");
      expect(html).toContain("AI Recommended");

      // // must be operator and not comment
      expect(html).toContain('<span class="text-[#d4d4d4]">//</span>');
      expect(html).toContain('<span class="text-[#b5cea8]">2</span>');

      // The whole table must not have any comment classes since there are no comments
      expect(html).not.toContain("text-[#6a9955]");
    });

    it("auto-detects Python code in CodeViewer even if language prop is 'code'", () => {
      const pythonCode = `def fairCandySwap(self, aliceSizes, bobSizes):
    diff = (sum_bob - sum_alice) // 2
    return diff`;

      const html = renderToStaticMarkup(
        <CodeViewer code={pythonCode} language="code" />
      );

      expect(html).toContain("PYTHON");
      expect(html).toContain('<span class="text-[#d4d4d4]">//</span>');
      expect(html).not.toContain("text-[#6a9955]");
    });
  });
});
