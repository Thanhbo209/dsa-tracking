import type { LeetCodeSyncPayload } from "./types";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

const QUESTION_SUBMISSION_LIST_QUERY = `
  query QuestionSubmissionList(
    $questionSlug: String!
    $offset: Int!
    $limit: Int!
  ) {
    questionSubmissionList(
      questionSlug: $questionSlug
      offset: $offset
      limit: $limit
    ) {
      lastKey
      hasNext
      submissions {
        id
        title
        titleSlug
        status
        statusDisplay
        lang
        langName
        runtime
        timestamp
        memory
        isPending
      }
    }
  }
`;

const USER_STATUS_QUERY = `
  query userStatus {
    userStatus {
      isSignedIn
      username
    }
  }
`;

const MATCHED_USER_STATS_QUERY = `
  query matchedUserStats($username: String!) {
    matchedUser(username: $username) {
      username
      userCalendar {
        activeYears
        streak
        totalActiveDays
        submissionCalendar
      }
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
  }
`;

const USER_SOLVED_PROBLEMS_QUERY = `
  query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(
      categorySlug: $categorySlug
      limit: $limit
      skip: $skip
      filters: $filters
    ) {
      total: totalNum
      questions: data {
        frontendQuestionId: questionFrontendId
        difficulty
        title
        titleSlug
        status
      }
    }
  }
`;

const SUBMISSION_LIST_QUERY = `
  query submissionList($offset: Int!, $limit: Int!, $lastKey: String, $questionSlug: String) {
    submissionList(offset: $offset, limit: $limit, lastKey: $lastKey, questionSlug: $questionSlug) {
      lastKey
      hasNext
      submissions {
        id
        statusDisplay
        lang
        langName
        runtime
        timestamp
        url
        isPending
        title
        titleSlug
        memory
      }
    }
  }
`;

export interface LatestSubmission {
  id: string;
  isPending: "Pending" | "Not Pending";
}

async function leetcodeGraphQL(query: string, variables: Record<string, any> = {}) {
  const response = await fetch(LEETCODE_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 429) {
    throw new Error("LeetCode rate-limited, try again shortly.");
  }

  if (!response.ok) {
    throw new Error(`LeetCode request failed with HTTP ${response.status}`);
  }

  const json = await response.json();
  if (json.errors && json.errors.length > 0) {
    const msg = json.errors.map((e: any) => e.message).join(", ");
    if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("too many requests")) {
      throw new Error("LeetCode rate-limited, try again shortly.");
    }
    // "no permission" usually indicates user is not logged in or resource is private
    if (msg.toLowerCase().includes("permission")) {
      throw new Error("LeetCode permission denied. Please ensure you are signed into leetcode.com.");
    }
  }

  return json.data;
}

export async function getLatestSubmission(
  problemSlug: string,
): Promise<LatestSubmission | null> {
  const data = await leetcodeGraphQL(QUESTION_SUBMISSION_LIST_QUERY, {
    questionSlug: problemSlug,
    offset: 0,
    limit: 1,
  });

  const submission = data?.questionSubmissionList?.submissions?.[0];

  if (!submission) {
    return null;
  }

  return {
    id: submission.id,
    isPending: submission.isPending,
  };
}

export async function fetchLeetCodeSyncData(): Promise<LeetCodeSyncPayload> {
  // 1. Verify sign-in status and get LeetCode username
  const statusData = await leetcodeGraphQL(USER_STATUS_QUERY);
  const userStatus = statusData?.userStatus;

  if (!userStatus || !userStatus.isSignedIn || !userStatus.username) {
    throw new Error("Not signed in to LeetCode. Please open leetcode.com and log into your account.");
  }

  const username = userStatus.username;

  // 2. Fetch matchedUserStats (submissionCalendar & stats)
  const statsData = await leetcodeGraphQL(MATCHED_USER_STATS_QUERY, { username });
  const rawCalendar = statsData?.matchedUser?.userCalendar?.submissionCalendar;

  const calendar: { date: string; count: number }[] = [];
  if (rawCalendar) {
    try {
      const parsed: Record<string, number> = typeof rawCalendar === "string" ? JSON.parse(rawCalendar) : rawCalendar;
      for (const [epochSecStr, count] of Object.entries(parsed)) {
        const sec = Number(epochSecStr);
        if (!isNaN(sec) && count > 0) {
          const d = new Date(sec * 1000);
          const yyyy = d.getUTCFullYear();
          const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
          const dd = String(d.getUTCDate()).padStart(2, "0");
          calendar.push({
            date: `${yyyy}-${mm}-${dd}`,
            count,
          });
        }
      }
    } catch (e) {
      console.warn("[DSA Tracker] Failed to parse LeetCode submissionCalendar:", e);
    }
  }

  // 3. Fetch Solved Problems list with pagination loop (no silent truncation)
  const solvedProblems: LeetCodeSyncPayload["solvedProblems"] = [];
  const PAGE_LIMIT = 50;
  let skip = 0;
  let totalNum = 1;

  while (skip < totalNum) {
    const listData = await leetcodeGraphQL(USER_SOLVED_PROBLEMS_QUERY, {
      categorySlug: "",
      limit: PAGE_LIMIT,
      skip,
      filters: { status: "AC" },
    });

    const questionList = listData?.problemsetQuestionList;
    if (!questionList) break;

    totalNum = questionList.total || 0;
    const questions = questionList.questions || [];
    if (questions.length === 0) break;

    for (const q of questions) {
      solvedProblems.push({
        slug: q.titleSlug,
        difficulty: q.difficulty,
        title: q.title,
        leetcodeId: q.frontendQuestionId ? parseInt(q.frontendQuestionId, 10) : null,
      });
    }

    skip += questions.length;
    // Cap to prevent excessive looping on gigantic accounts (e.g. 2000 problems max)
    if (skip >= 2000) break;
  }

  // 4. Fetch Recent Submissions (up to 50 items for history)
  const submissions: LeetCodeSyncPayload["submissions"] = [];
  try {
    const subListData = await leetcodeGraphQL(SUBMISSION_LIST_QUERY, {
      offset: 0,
      limit: 50,
      questionSlug: "",
    });

    const rawSubs = subListData?.submissionList?.submissions || [];
    for (const sub of rawSubs) {
      if (!sub.id || !sub.titleSlug) continue;

      const runtimeMs = sub.runtime ? parseInt(sub.runtime.replace(/\D/g, ""), 10) : undefined;
      const memoryBytes = sub.memory ? parseFloat(sub.memory) * 1024 * 1024 : undefined;

      submissions.push({
        externalId: String(sub.id),
        problemSlug: sub.titleSlug,
        timestamp: Number(sub.timestamp),
        status: sub.statusDisplay || "Accepted",
        language: sub.langName || sub.lang || "unknown",
        runtimeMs: !isNaN(runtimeMs as number) ? runtimeMs : undefined,
        memoryBytes: !isNaN(memoryBytes as number) ? Math.round(memoryBytes as number) : undefined,
      });
    }
  } catch (subErr) {
    console.warn("[DSA Tracker] Could not fetch detailed submissionList, continuing with solved problems:", subErr);
  }

  return {
    leetcodeUsername: username,
    calendar,
    solvedProblems,
    submissions,
  };
}

