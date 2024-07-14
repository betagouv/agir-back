-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "code_postal_classement" TEXT,
ADD COLUMN     "commune_classement" TEXT,
ADD COLUMN     "points_classement" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rank" INTEGER,
ADD COLUMN     "rank_commune" INTEGER;
