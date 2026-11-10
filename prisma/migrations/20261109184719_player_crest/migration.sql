-- Own coat of arms of a player (new nullable column, non-destructive).
-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "crest" JSONB;
ALTER TABLE "Player" ADD CONSTRAINT "Player_crest_object_check" CHECK ("crest" IS NULL OR jsonb_typeof("crest") = 'object');
