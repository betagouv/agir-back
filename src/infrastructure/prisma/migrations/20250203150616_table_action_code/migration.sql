/*
  Warnings:

  - The primary key for the `Action` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[cms_id]` on the table `Action` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Action` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Action" DROP CONSTRAINT "Action_pkey",
ADD COLUMN     "code" TEXT NOT NULL,
ADD CONSTRAINT "Action_pkey" PRIMARY KEY ("code");

-- CreateIndex
CREATE UNIQUE INDEX "Action_cms_id_key" ON "Action"("cms_id");
