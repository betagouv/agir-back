-- CreateTable
CREATE TABLE "PonderationTags" (
    "id_cms" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "poids" DECIMAL(65,30),
    "bonuse" DECIMAL(65,30),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PonderationTags_pkey" PRIMARY KEY ("id_cms")
);

-- CreateIndex
CREATE UNIQUE INDEX "PonderationTags_tag_key" ON "PonderationTags"("tag");
