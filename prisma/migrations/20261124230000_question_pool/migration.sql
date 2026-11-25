-- "Tři uzavřené kruhy": card questions (Hra o kartu, Mistrovské kolo, Rychlovka)
-- and Denní výzva questions are separate pools that never mix.
-- Additive only: existing rows become 'card'.
ALTER TABLE "Question" ADD COLUMN "pool" TEXT NOT NULL DEFAULT 'card';

ALTER TABLE "Question" ADD CONSTRAINT "Question_pool_check" CHECK ("pool" IN ('card', 'daily'));

CREATE INDEX "Question_pool_idx" ON "Question"("pool");
