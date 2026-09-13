-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('GENERATING', 'DRAFT_READY', 'ACCEPTED', 'REJECTED', 'FAILED');

-- CreateTable
CREATE TABLE "SubmissionAnalysis" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'GENERATING',
    "modelName" TEXT,
    "review" JSONB,
    "draft" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubmissionAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubmissionAnalysis_submissionId_idx" ON "SubmissionAnalysis"("submissionId");

-- AddForeignKey
ALTER TABLE "SubmissionAnalysis" ADD CONSTRAINT "SubmissionAnalysis_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
