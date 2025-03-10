-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "consigne" TEXT NOT NULL DEFAULT 'Réalisez cette action dans les prochaines semaines et partagez vos retours',
ADD COLUMN     "label_compteur" TEXT NOT NULL DEFAULT '**453 actions** réalisées par la communauté';
