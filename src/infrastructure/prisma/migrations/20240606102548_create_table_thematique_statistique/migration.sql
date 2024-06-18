-- CreateTable
CREATE TABLE "ThematiqueStatistique" (
    "thematiqueId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "completion_pourcentage_1_20" INTEGER NOT NULL DEFAULT 0,
    "completion_pourcentage_21_40" INTEGER NOT NULL DEFAULT 0,
    "completion_pourcentage_41_60" INTEGER NOT NULL DEFAULT 0,
    "completion_pourcentage_61_80" INTEGER NOT NULL DEFAULT 0,
    "completion_pourcentage_81_99" INTEGER NOT NULL DEFAULT 0,
    "completion_pourcentage_100" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ThematiqueStatistique_pkey" PRIMARY KEY ("thematiqueId")
);
