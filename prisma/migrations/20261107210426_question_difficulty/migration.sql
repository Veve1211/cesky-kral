-- DropIndex
DROP INDEX "Question_kingId_idx";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "difficulty" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "Question_kingId_difficulty_idx" ON "Question"("kingId", "difficulty");

-- Only 1 (easy), 2 (medium) or 3 (hard) is allowed
ALTER TABLE "Question" ADD CONSTRAINT "Question_difficulty_check" CHECK ("difficulty" BETWEEN 1 AND 3);
