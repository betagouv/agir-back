-- AlterTable
ALTER TABLE "BilanCarbone" ADD COLUMN     "pourcentage_progression_alimenation" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pourcentage_progression_consommation" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pourcentage_progression_logement" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pourcentage_progression_total" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pourcentage_progression_transport" INTEGER NOT NULL DEFAULT 0;
