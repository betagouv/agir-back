/*
  Warnings:

  - The primary key for the `OIDC_STATE` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `OIDC_STATE` table. All the data in the column will be lost.
  - Added the required column `loginId` to the `OIDC_STATE` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OIDC_STATE" DROP CONSTRAINT "OIDC_STATE_pkey",
DROP COLUMN "id",
ADD COLUMN     "loginId" TEXT NOT NULL,
ADD CONSTRAINT "OIDC_STATE_pkey" PRIMARY KEY ("loginId");
