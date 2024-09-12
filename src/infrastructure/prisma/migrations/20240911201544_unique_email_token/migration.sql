/*
  Warnings:

  - A unique constraint covering the columns `[unsubscribe_mail_token]` on the table `Utilisateur` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_unsubscribe_mail_token_key" ON "Utilisateur"("unsubscribe_mail_token");
