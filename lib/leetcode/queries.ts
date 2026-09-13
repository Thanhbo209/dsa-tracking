export const GET_PROBLEM_BY_SLUG = `
  query GetProblem($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      title
      difficulty
      titleSlug
      content
      topicTags {
        name
        id
        slug
      }
    }
  }
`;
