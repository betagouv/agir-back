-- CreateTable
CREATE TABLE "Partenaire" (
    "content_id" TEXT NOT NULL,
    "nom" TEXT,
    "url" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Partenaire_pkey" PRIMARY KEY ("content_id")
);
