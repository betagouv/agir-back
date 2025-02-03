-- CreateTable
CREATE TABLE "Action" (
    "cms_id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "thematique" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("cms_id")
);
