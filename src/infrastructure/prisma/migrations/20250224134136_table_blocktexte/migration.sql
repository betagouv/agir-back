-- CreateTable
CREATE TABLE "BlockText" (
    "id_cms" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "texte" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockText_pkey" PRIMARY KEY ("id_cms")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlockText_code_key" ON "BlockText"("code");
