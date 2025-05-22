-- CreateTable
CREATE TABLE "Visites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "heure_premiere_visite_du_jour" TIMESTAMPTZ(3),

    CONSTRAINT "Visites_pkey" PRIMARY KEY ("id")
);
