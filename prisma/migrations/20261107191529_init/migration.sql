-- CreateTable
CREATE TABLE "King" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "reignFrom" INTEGER NOT NULL,
    "reignTo" INTEGER NOT NULL,
    "dynasty" TEXT NOT NULL,
    "shortBio" TEXT NOT NULL,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "King_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "kingId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "sourceUrl" TEXT,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "King_slug_key" ON "King"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "King_order_key" ON "King"("order");

-- CreateIndex
CREATE INDEX "King_dynasty_idx" ON "King"("dynasty");

-- CreateIndex
CREATE INDEX "Question_kingId_idx" ON "Question"("kingId");

-- CreateIndex
CREATE INDEX "Answer_questionId_idx" ON "Answer"("questionId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_kingId_fkey" FOREIGN KEY ("kingId") REFERENCES "King"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
