/*
  Warnings:

  - You are about to drop the column `prevent_sendcode_before` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `sent_code_count` on the `Utilisateur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Utilisateur" RENAME COLUMN "sent_code_count" TO "sent_email_count";
ALTER TABLE "Utilisateur" RENAME COLUMN "prevent_sendcode_before" TO "prevent_sendemail_before";
