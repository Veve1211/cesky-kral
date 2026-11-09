-- Server-scored game sessions for the weekly and all-time leaderboards (new table only).
-- CreateTable
CREATE TABLE "GameSession" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "playerId" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "answered" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "durationMs" INTEGER,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameSession_publicId_key" ON "GameSession"("publicId");

-- CreateIndex
CREATE INDEX "GameSession_mode_finishedAt_idx" ON "GameSession"("mode", "finishedAt");

-- CreateIndex
CREATE INDEX "GameSession_playerId_mode_idx" ON "GameSession"("playerId", "mode");

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data rules
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_mode_check" CHECK ("mode" IN ('quick', 'who-first', 'timeline'));
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_counts_check" CHECK ("answered" >= 0 AND "score" >= 0 AND "score" <= "answered");
