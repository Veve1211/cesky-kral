-- AlterTable
ALTER TABLE "King" ADD COLUMN     "isLegend" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'král',
ALTER COLUMN "reignFrom" DROP NOT NULL,
ALTER COLUMN "reignTo" DROP NOT NULL;

-- Only known titles are allowed
ALTER TABLE "King" ADD CONSTRAINT "King_title_check" CHECK ("title" IN ('kníže', 'kněžna', 'král', 'královna'));
