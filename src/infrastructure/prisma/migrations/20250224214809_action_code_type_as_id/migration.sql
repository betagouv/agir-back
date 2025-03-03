/*
  Warnings:

  - Made the column `type_code_id` on table `Action` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Action" ALTER COLUMN "type_code_id" SET NOT NULL,
ADD CONSTRAINT "Action_pkey" PRIMARY KEY ("type_code_id");

-- DropIndex
DROP INDEX "Action_type_code_id_key";
