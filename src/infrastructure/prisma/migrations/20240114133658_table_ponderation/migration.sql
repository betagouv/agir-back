-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "version_ponderation" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Ponderation" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "rubriques" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Ponderation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ponderation_version_key" ON "Ponderation"("version");
