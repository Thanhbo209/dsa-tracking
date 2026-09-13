-- DropEnum
DROP TYPE "ComplexityClass";

-- CreateTable
CREATE TABLE "Solution" (
    "id" TEXT NOT NULL,
    "approachId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "algorithm" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Solution_approachId_idx" ON "Solution"("approachId");

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_approachId_fkey" FOREIGN KEY ("approachId") REFERENCES "Approach"("id") ON DELETE CASCADE ON UPDATE CASCADE;
