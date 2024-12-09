-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "contenu" TEXT,
ADD COLUMN     "partenaire_logo_url" TEXT,
ADD COLUMN     "partenaire_url" TEXT,
ADD COLUMN     "sources" JSONB DEFAULT '[]';
