-- AlterTable (non-destructive: new columns with defaults)
ALTER TABLE "King" ADD COLUMN     "chronicleFacts" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "chronicleIntro" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "chronicleSources" JSONB NOT NULL DEFAULT '[]';

-- Sources must always be a JSON array
ALTER TABLE "King" ADD CONSTRAINT "King_chronicleSources_array_check" CHECK (jsonb_typeof("chronicleSources") = 'array');
