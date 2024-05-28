-- CreateTable
CREATE TABLE "FileAttente" (
    "email" TEXT NOT NULL,
    "code_postal" TEXT,
    "code_profil" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "FileAttente_email_key" ON "FileAttente"("email");
