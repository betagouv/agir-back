-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "brevo_created_at" TIMESTAMPTZ(3),
ADD COLUMN     "brevo_updated_at" TIMESTAMPTZ(3);
