-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "codeId" TEXT;

-- CreateTable
CREATE TABLE "Code" (
    "id" TEXT NOT NULL,
    "solutionId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Code_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Code_solutionId_idx" ON "Code"("solutionId");

-- CreateIndex
CREATE INDEX "Submission_codeId_idx" ON "Submission"("codeId");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "Code"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Code" ADD CONSTRAINT "Code_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
