/*
  Warnings:

  - The primary key for the `OIDC_STATE` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `loginId` on the `OIDC_STATE` table. All the data in the column will be lost.
  - Made the column `state` on table `OIDC_STATE` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "OIDC_STATE" DROP CONSTRAINT "OIDC_STATE_pkey",
DROP COLUMN "loginId",
ALTER COLUMN "state" SET NOT NULL,
ADD CONSTRAINT "OIDC_STATE_pkey" PRIMARY KEY ("state");
