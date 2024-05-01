-- CreateTable
CREATE TABLE "ThematiqueUnivers" (
    "id_cms" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ThematiqueUnivers_id_cms_key" ON "ThematiqueUnivers"("id_cms");
