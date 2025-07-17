-- CreateTable
CREATE TABLE "Selection" (
    "id_cms" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Selection_pkey" PRIMARY KEY ("id_cms")
);

-- CreateIndex
CREATE UNIQUE INDEX "Selection_code_key" ON "Selection"("code");
