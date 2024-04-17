-- CreateTable
CREATE TABLE "Defi" (
    "content_id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "sous_titre" TEXT,
    "astuces" TEXT NOT NULL,
    "pourquoi" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "thematiques" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Defi_pkey" PRIMARY KEY ("content_id")
);
