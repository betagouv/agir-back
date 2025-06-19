/*
  Warnings:

  - You are about to drop the column `actions_alimentation_rejetees` on the `Personnalisation` table. All the data in the column will be lost.
  - You are about to drop the column `actions_consommation_rejetees` on the `Personnalisation` table. All the data in the column will be lost.
  - You are about to drop the column `actions_logement_rejetees` on the `Personnalisation` table. All the data in the column will be lost.
  - You are about to drop the column `actions_transport_rejetees` on the `Personnalisation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Personnalisation" DROP COLUMN "actions_alimentation_rejetees",
DROP COLUMN "actions_consommation_rejetees",
DROP COLUMN "actions_logement_rejetees",
DROP COLUMN "actions_transport_rejetees";
