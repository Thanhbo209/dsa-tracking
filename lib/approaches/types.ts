export interface CreateApproachInput {
  problemId: string;
  name: string;
  coreIdea?: string;
  whyItWorks?: string;
  whenToUse?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  pros?: string;
  cons?: string;
  notes?: string;
  mistakes?: string;
}

export interface UpdateApproachInput {
  name?: string;
  coreIdea?: string;
  whyItWorks?: string;
  whenToUse?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  pros?: string;
  cons?: string;
  notes?: string;
  mistakes?: string;
}
