-- CreateTable
CREATE TABLE "CompteurActions" (
    "type_code_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "vues" INTEGER NOT NULL DEFAULT 0,
    "faites" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CompteurActions_pkey" PRIMARY KEY ("type_code_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompteurActions_code_type_key" ON "CompteurActions"("code", "type");
