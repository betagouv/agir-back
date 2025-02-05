-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "besoins" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "kyc_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "lvo_action" TEXT,
ADD COLUMN     "lvo_objet" TEXT,
ADD COLUMN     "pourquoi" TEXT,
ADD COLUMN     "quizz_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "recette_categorie" TEXT,
ADD COLUMN     "sous_titre" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'classique';
