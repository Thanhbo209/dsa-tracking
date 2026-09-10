import type { AiAnalysisInput } from "@/lib/validation/analysis";

export function buildAnalysisPrompt(input: AiAnalysisInput): string {
  const { problem, submission, existingKnowledgeSummary } = input;

  const isAccepted = submission.status === "ACCEPTED";

  const existingKnowledgeSection = existingKnowledgeSummary?.approaches?.length
    ? `
Existing Knowledge for this problem:
${existingKnowledgeSummary.approaches
  .map(
    (a) =>
      `- Approach: ${a.name} (Solutions: ${a.solutions.join(", ") || "None"})`,
  )
  .join("\n")}
`
    : "";

  return `You are an expert Data Structures & Algorithms (DSA) learning reviewer and mentor.
Your task is to analyze the user's ACTUAL SUBMITTED CODE from a historical attempt and produce:
1. An educational diagnostic review evaluating what the user implemented, how well it performed, why it has its specific time/space complexity, and what to learn from it.
2. A proposed Knowledge Draft (Approach -> Solution -> Code) that the user can later review, edit, and save as reusable knowledge.

================================================================================
CRITICAL DIRECTIVES
================================================================================
1. PRIMARY EVIDENCE: The user's exact submitted code below is your PRIMARY EVIDENCE.
   - Analyze what the user ACTUALLY wrote—not an idealized or canonical LeetCode textbook solution.
   - Identify the user's specific algorithmic decisions, control flow, data structures, and edge-case handling in their code.

2. SUBMISSION STATUS CONTEXT:
   - Current Status: ${submission.status}
   ${
     isAccepted
       ? `- For this ACCEPTED submission: Explain why the implementation works, evaluate its strengths, pinpoint any inefficiencies or code smells, and extract reusable algorithmic takeaways.`
       : `- For this FAILED submission (${submission.status}): Diagnose why it failed. Identify incorrect assumptions, broken invariants, unhandled edge cases, off-by-one errors, or algorithmic bugs in the submitted code. Explain how to fix it and what conceptual gap to address.`
   }

3. COMPLEXITY REASONING (MANDATORY & CODE-SPECIFIC):
   - You MUST answer:
     a) What is the complexity? (value: e.g. "O(n)", "O(n log n)", "O(n^2)", "O(1)")
     b) Why is THIS user's code this complexity?
   - "reasoning" MUST be an array of specific, step-by-step points explaining the concrete code behavior that produces the complexity:
     * Mention exact loops, nested loops, loop bounds, and loop termination conditions.
     * Mention recursive calls, recursion depth, and branching factor.
     * Mention data structure operations (e.g. hash map lookup, set insertion, array slicing, sorting).
     * Mention any auxiliary space allocated (maps, sets, queues, recursion call stack).
     * Distinguish best/average/worst-case behavior where applicable.
   - FORBIDDEN: Vague one-line justifications such as "It loops through the array, so it is O(n)." Every reasoning list must contain concrete, code-grounded explanations.

4. APPROACH vs. SOLUTION BOUNDARIES IN KNOWLEDGE DRAFT:
   - Approach = High-level problem-solving strategy / paradigm (e.g. "Two Pointers", "Sliding Window", "Hash Map", "Monotonic Stack", "Dynamic Programming").
     * IMPORTANT: Do NOT include an "algorithm" field on Approach.
   - Solution = Concrete algorithm, technique, or variation within the approach (e.g. "Opposite-ends two-pointer collision scan", "One-pass hash map complement check").
     * The step-by-step algorithm strictly belongs in Solution.algorithm.
   - Code = Clean, idiomatic, and correctly-commented canonical code in the same language as the submission.

================================================================================
PROBLEM CONTEXT
================================================================================
Title: ${problem.title} (Slug: ${problem.slug})
Difficulty: ${problem.difficulty ?? "Not specified"}
Topics: ${problem.topics.join(", ") || "General"}
Description:
${problem.description ?? "No description available."}
${existingKnowledgeSection}

================================================================================
HISTORICAL SUBMISSION EVIDENCE
================================================================================
Submission ID: ${submission.id}
Status: ${submission.status}
Language: ${submission.language}
Runtime: ${submission.runtimeMs != null ? `${submission.runtimeMs} ms` : "N/A"}
Memory: ${submission.memoryBytes != null ? `${Math.round(submission.memoryBytes / 1024 / 1024)} MB` : "N/A"}
Submitted At: ${submission.submittedAt ? new Date(submission.submittedAt).toISOString() : "N/A"}

Submitted Code:
\`\`\`${submission.language}
${submission.code}
\`\`\`

================================================================================
REQUIRED JSON OUTPUT FORMAT
================================================================================
Respond ONLY with a valid JSON object strictly matching this schema:
{
  "review": {
    "summary": "Concise 1-3 sentence summary of the attempt and its outcome",
    "isCorrect": ${isAccepted ? "true" : "false"},
    "timeComplexity": {
      "value": "e.g. O(n)",
      "explanation": "Clear explanation of the overall time complexity",
      "reasoning": [
        "First specific code behavior contributing to time complexity",
        "Second specific code behavior (e.g. inner loop, map lookup cost)",
        "Conclusion connecting code operations to Big-O"
      ]
    },
    "spaceComplexity": {
      "value": "e.g. O(n)",
      "explanation": "Clear explanation of the auxiliary space complexity",
      "reasoning": [
        "First specific memory allocation or auxiliary structure in code",
        "Stack space or buffer bounds in worst-case",
        "Conclusion connecting allocations to Big-O"
      ]
    },
    "strengths": [
      "Key positive aspect of the implementation or logic"
    ],
    "mistakes": [
      ${
        isAccepted
          ? `"Minor code smell, micro-inefficiency, or none if optimal"`
          : `"Specific bug, wrong assumption, or unhandled case in the code"`
      }
    ],
    "conceptGaps": [
      "DSA pattern, property, or concept the user should review"
    ],
    "missedEdgeCases": [
      "Specific input cases that break or challenge the implementation"
    ],
    "improvementSuggestions": [
      "Actionable suggestion to make the code cleaner, faster, or more robust"
    ],
    "learningTakeaways": [
      "High-value conceptual takeaway to remember for similar future problems"
    ]
  },
  "draft": {
    "approach": {
      "name": "High-level strategy name (e.g. Hash Map)",
      "coreIdea": "The foundational intuition behind this strategy",
      "whyItWorks": "Mathematical or invariant reasoning justifying the approach",
      "whenToUse": "Signals or problem characteristics that indicate this approach",
      "timeComplexity": "e.g. O(n)",
      "spaceComplexity": "e.g. O(n)",
      "pros": "Advantages of this approach",
      "cons": "Trade-offs, limitations, or memory overhead",
      "notes": "Optional extra tips or caveats",
      "mistakes": "Optional common pitfalls or traps for this approach"
    },
    "solution": {
      "name": "Concrete technique name (e.g. One-pass Complement Lookup)",
      "description": "What this specific algorithm does within the approach",
      "algorithm": "1. Initialize ...\\n2. Iterate through ...\\n3. Check if ...\\n4. Return ...",
      "notes": "Optional implementation details"
    },
    "code": {
      "language": "${submission.language}",
      "code": "Clean, canonical, working implementation of the solution",
      "notes": "Optional notes regarding idioms or language features"
    }
  }
}
`;
}
