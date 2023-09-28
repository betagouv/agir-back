-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "passwordSalt" TEXT DEFAULT 'salt';
