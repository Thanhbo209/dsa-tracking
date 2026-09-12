import type { AiAnalysisInput } from "@/lib/validation/analysis";

export function buildAnalysisPrompt(input: AiAnalysisInput): string {
  const { problem, submission, existingKnowledgeSummary } = input;

  const isAccepted = submission.status === "ACCEPTED";

  const existingKnowledgeSection = existingKnowledgeSummary?.approaches?.length
    ? `
Existing Knowledge for this problem (Context only — NEVER override or mislabel the user's code based on existing entries):
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
1. An accurate classification of the user's ACTUAL approach and technique implemented in their code.
2. An educational diagnostic review evaluating how well it performed, its exact time/space complexity, its strengths, and any bugs or inefficiencies.
3. An OPTIONAL AI Recommendation ONLY if a genuinely better algorithmic paradigm exists.

================================================================================
CRITICAL DIRECTIVES: SEPARATION OF USER APPROACH vs. AI RECOMMENDATION
================================================================================
1. PRIMARY EVIDENCE IS THE USER'S SUBMITTED CODE:
   - Identify the user's algorithmic strategy from what they ACTUALLY wrote: loops, control flow, data structures, recursion, pointers, and operations.
   - Do NOT infer the user's approach from:
     * The problem's standard or canonical textbook solution.
     * What you think the user "should have done".
     * Any existing Knowledge Vault entries listed in the context.
     * Any recommendation you plan to suggest.
   - NEVER label the user's submitted code with an approach or technique that the AI recommended!

2. IDENTIFY THE USER'S ACTUAL APPROACH & SOLUTION FIRST:
   - "review.actualApproach.name": The high-level algorithmic strategy the user ACTUALLY implemented.
     Examples: "Hash Map", "Two Pointers", "Two Pointers + Sorting", "Sliding Window", "Vertical Scanning", "Horizontal Scanning", "Binary Search", "DFS", "BFS", "Dynamic Programming", "Backtracking", "Brute Force", "Prefix Sum", "Greedy".
     Use the most accurate, standard technical terminology describing the submitted code.
     * Concrete Example: If user wrote two loops comparing character by character across all strings at index i (column by column), the actual approach is "Vertical Scanning", NOT "Horizontal Scanning".
     * Concrete Example: If user used a hash table to store complements, the actual approach is "Hash Map", NOT "Two Pointers".
     * Concrete Example: If user wrote nested loops checking all pairs in O(n^2), the actual approach is "Brute Force", NOT "Hash Map".
   - "review.actualApproach.coreIdea": The foundational intuition of the user's implemented strategy.
   - "review.actualApproach.explanation": A concise explanation of how the user's code realizes this strategy.
   - "review.actualSolution.name": The concrete method/technique name within the approach (e.g. "One-Pass Complement Lookup", "Pairwise Iteration", "Column-by-Column Character Check").
   - "review.actualSolution.description": What the user's specific method does.
   - "review.actualSolution.algorithm": Numbered step-by-step description of the user's concrete algorithm as written.

3. COMPLEXITY REASONING (MANDATORY & CODE-SPECIFIC):
   - "timeComplexity" and "spaceComplexity" MUST describe THIS USER'S SUBMITTED CODE—never a recommended solution.
   - You MUST answer: Why is THIS user's code this complexity?
   - "reasoning" MUST be an array of specific, step-by-step points explaining the concrete code behavior that produces the complexity:
     * Mention exact loops, nested loops, loop bounds, recursion depth, and data structure operations.
     * Ground every statement in the user's code.
   - ALWAYS use "n" as the default variable for input size in Big-O notation (e.g. O(n), O(n log n), O(n^2), O(1)).
     If there are multiple dimensions, explain them clearly (e.g. "n is total elements, m is max string length").

4. EVALUATE CORRECTNESS:
   - Current Status: ${submission.status}
   ${
     isAccepted
       ? `- For this ACCEPTED submission: Explain why the implementation works, evaluate its strengths, pinpoint any inefficiencies or code smells, and extract reusable algorithmic takeaways.`
       : `- For this FAILED submission (${submission.status}): Diagnose why it failed. Identify incorrect assumptions, broken invariants, unhandled edge cases, off-by-one errors, or algorithmic bugs in the submitted code.
          * Even if the submission is incorrect or incomplete, classify "actualApproach" based on what the user ATTEMPTED/WROTE. Do NOT rename the user's approach to match the fix!`
   }

5. AI RECOMMENDATION RULES (ONLY WHEN MEANINGFULLY BETTER):
   - Ask yourself: "Does this problem have a genuinely better algorithmic approach than what the user implemented?"
   - IF THE USER'S APPROACH IS ALREADY OPTIMAL (e.g. user implemented O(n) Hash Map for Two Sum, or optimal scanning for Longest Common Prefix):
     * Set "recommendation.available = false".
     * Do NOT force an alternative approach! Do NOT invent a different paradigm just to have a recommendation!
     * In "recommendation.reason", you may explain: "Your approach is already optimal for this problem."
     * Leave approach, solution, and code omitted or null.
   - IF THE USER'S APPROACH IS SUBOPTIMAL (e.g. O(n^2) Brute Force when an O(n) Hash Map exists, or O(2^n) recursion when DP exists):
     * Set "recommendation.available = true".
     * Set "recommendation.reason": Explain clearly why this alternative is superior (e.g. "Reduces time complexity from O(n^2) to O(n) using a hash table for O(1) complement lookup.").
     * Provide "recommendation.approach", "recommendation.solution", and "recommendation.code" (clean, canonical implementation in ${submission.language}).
   - IF THE USER'S SUBMISSION IS FAILED / INCORRECT:
     * Set "recommendation.available = true" ONLY if recommending a different optimal paradigm or a canonical corrected implementation provides clear educational value.

===============================================================================
PROBLEM CONTEXT
===============================================================================
Title: ${problem.title} (Slug: ${problem.slug})
Difficulty: ${problem.difficulty ?? "Not specified"}
Topics: ${problem.topics.join(", ") || "General"}
Description:
${problem.description ?? "No description available."}
${existingKnowledgeSection}

===============================================================================
HISTORICAL SUBMISSION EVIDENCE
===============================================================================
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

===============================================================================
REQUIRED JSON OUTPUT FORMAT
===============================================================================
Respond ONLY with a valid JSON object strictly matching this schema:
{
  "review": {
    "actualApproach": {
      "name": "Name of strategy ACTUALLY implemented in submitted code (e.g. Hash Map, Brute Force, Vertical Scanning)",
      "coreIdea": "Foundational intuition of the user's strategy",
      "explanation": "Brief explanation of how the submitted code realizes this approach"
    },
    "actualSolution": {
      "name": "Specific method/variation name (e.g. One-pass Complement Lookup)",
      "description": "Description of what this concrete method does",
      "algorithm": "1. Initialize ...\\n2. Loop through ...\\n3. Check condition ...\\n4. Return result"
    },
    "summary": "Concise 1-3 sentence summary of the attempt and its outcome",
    "isCorrect": ${isAccepted ? "true" : "false"},
    "timeComplexity": {
      "value": "e.g. O(n) or O(n^2)",
      "explanation": "Clear explanation of the user code's overall time complexity",
      "reasoning": [
        "First specific code behavior contributing to time complexity (loops, bounds)",
        "Second specific code behavior (inner loop, operations cost)",
        "Conclusion connecting code operations to Big-O"
      ]
    },
    "spaceComplexity": {
      "value": "e.g. O(1) or O(n)",
      "explanation": "Clear explanation of the user code's auxiliary space complexity",
      "reasoning": [
        "First specific memory allocation or auxiliary structure in code",
        "Stack space or buffer bounds",
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
      "DSA pattern, property, or concept to review"
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
  "recommendation": {
    "available": false,
    "reason": "Explain why this recommendation is suggested (e.g. asymptotic improvement) or why user approach is already optimal"
  }
}

NOTE: If "recommendation.available" is true, you MUST also include:
  "recommendation": {
    "available": true,
    "reason": "Clear explanation of why this alternative is better",
    "approach": {
      "name": "High-level strategy name (e.g. Hash Map)",
      "coreIdea": "Foundational intuition behind the recommended strategy",
      "whyItWorks": "Mathematical or invariant reasoning justifying the approach",
      "whenToUse": "Signals or problem characteristics that indicate this approach",
      "timeComplexity": "e.g. O(n)",
      "spaceComplexity": "e.g. O(n)",
      "pros": "Advantages of this approach",
      "cons": "Trade-offs or memory overhead",
      "notes": "Optional extra tips or caveats",
      "mistakes": "Optional common pitfalls"
    },
    "solution": {
      "name": "Concrete technique name",
      "description": "What this specific algorithm does within the approach",
      "algorithm": "1. Step one ...\\n2. Step two ...",
      "notes": "Optional implementation details"
    },
    "code": {
      "language": "${submission.language}",
      "code": "Clean, canonical, working implementation of the recommended solution",
      "notes": "Optional notes"
    }
  }
`;
}
