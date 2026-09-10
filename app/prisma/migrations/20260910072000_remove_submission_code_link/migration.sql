-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_codeId_fkey";

-- DropIndex
DROP INDEX "Submission_codeId_idx";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "codeId";
