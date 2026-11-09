-- Anonymous players, server-scored daily attempts and transfer codes (new tables only).
-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "nickname" TEXT,
    "nicknameKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyAttempt" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "marks" BOOLEAN[] DEFAULT ARRAY[]::BOOLEAN[],
    "answered" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "durationMs" INTEGER,

    CONSTRAINT "DailyAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferCode" (
    "id" SERIAL NOT NULL,
    "codeHash" TEXT NOT NULL,
    "playerId" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransferCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_tokenHash_key" ON "Player"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Player_nicknameKey_key" ON "Player"("nicknameKey");

-- CreateIndex
CREATE INDEX "DailyAttempt_date_score_durationMs_idx" ON "DailyAttempt"("date", "score", "durationMs");

-- CreateIndex
CREATE UNIQUE INDEX "DailyAttempt_playerId_date_key" ON "DailyAttempt"("playerId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "TransferCode_codeHash_key" ON "TransferCode"("codeHash");

-- CreateIndex
CREATE INDEX "TransferCode_expiresAt_idx" ON "TransferCode"("expiresAt");

-- AddForeignKey
ALTER TABLE "DailyAttempt" ADD CONSTRAINT "DailyAttempt_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferCode" ADD CONSTRAINT "TransferCode_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data rules (non-destructive: new tables only)
ALTER TABLE "Player" ADD CONSTRAINT "Player_nickname_length_check" CHECK ("nickname" IS NULL OR char_length("nickname") BETWEEN 3 AND 16);
ALTER TABLE "DailyAttempt" ADD CONSTRAINT "DailyAttempt_counts_check" CHECK ("answered" >= 0 AND "answered" <= 20 AND "score" >= 0 AND "score" <= "answered");
ALTER TABLE "DailyAttempt" ADD CONSTRAINT "DailyAttempt_date_check" CHECK ("date" ~ '^\d{4}-\d{2}-\d{2}$');
