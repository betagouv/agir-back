-- CreateTable
CREATE TABLE "Thematique" (
    "id" TEXT NOT NULL,
    "id_cms" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Thematique_pkey" PRIMARY KEY ("id")
);
