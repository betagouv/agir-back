-- AlterTable
ALTER TABLE "Interaction" ADD COLUMN     "thematique_gamification_titre" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "InteractionDefinition" ADD COLUMN     "thematique_gamification_titre" TEXT NOT NULL DEFAULT '';
