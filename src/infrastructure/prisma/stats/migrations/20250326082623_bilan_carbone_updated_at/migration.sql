/*
  Warnings:

  - Added the required column `updated_at` to the `BilanCarbone` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BilanCarbone" ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL;
