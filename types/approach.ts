import { PublicProblemDetail } from "@/lib/profile/service";

export type Approach = PublicProblemDetail["approaches"][number];
export type Solution = Approach["solutions"][number];
