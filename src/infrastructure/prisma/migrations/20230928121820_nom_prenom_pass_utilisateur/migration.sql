-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "nom" TEXT NOT NULL DEFAULT 'nom',
ADD COLUMN     "passwordHash" TEXT DEFAULT 'hash',
ADD COLUMN     "prenom" TEXT DEFAULT 'prenom';
