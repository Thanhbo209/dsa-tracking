export interface KnowledgeCode {
  id: string;
  solutionId: string;
  language: string;
  code: string;
  notes?: string | null;
  createdAt?: Date | string;
}

export interface KnowledgeSolution {
  id: string;
  approachId: string;
  name: string;
  description?: string | null;
  algorithm?: string | null;
  notes?: string | null;
  codes: KnowledgeCode[];
  createdAt?: Date | string;
}

export interface KnowledgeApproach {
  id: string;
  problemId: string;
  name: string;
  coreIdea?: string | null;
  whyItWorks?: string | null;
  whenToUse?: string | null;
  timeComplexity?: string | null;
  spaceComplexity?: string | null;
  pros?: string | null;
  cons?: string | null;
  notes?: string | null;
  mistakes?: string | null;
  solutions: KnowledgeSolution[];
  createdAt?: Date | string;
}
