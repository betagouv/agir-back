-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "thematique_history" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "thematiques" JSONB NOT NULL DEFAULT '{}';
