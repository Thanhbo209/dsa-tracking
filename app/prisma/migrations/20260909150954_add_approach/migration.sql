-- CreateEnum
CREATE TYPE "ComplexityClass" AS ENUM ('CONSTANT', 'LOGARITHMIC', 'LINEAR', 'LINEARITHMIC', 'QUADRATIC', 'CUBIC', 'EXPONENTIAL', 'FACTORIAL', 'OTHER');

-- CreateTable
CREATE TABLE "Approach" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coreIdea" TEXT,
    "algorithm" TEXT,
    "whyItWorks" TEXT,
    "whenToUse" TEXT,
    "timeComplexity" TEXT,
    "spaceComplexity" TEXT,
    "pros" TEXT,
    "cons" TEXT,
    "notes" TEXT,
    "mistakes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Approach_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Approach_problemId_idx" ON "Approach"("problemId");

-- AddForeignKey
ALTER TABLE "Approach" ADD CONSTRAINT "Approach_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
