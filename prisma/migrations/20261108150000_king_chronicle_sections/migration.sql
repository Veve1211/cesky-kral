-- AlterTable (non-destructive: new column with a default)
ALTER TABLE "King" ADD COLUMN     "chronicleSections" JSONB NOT NULL DEFAULT '[]';

-- Sections must always be a JSON array
ALTER TABLE "King" ADD CONSTRAINT "King_chronicleSections_array_check" CHECK (jsonb_typeof("chronicleSections") = 'array');
