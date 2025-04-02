-- AlterTable
ALTER TABLE "Aide" ADD COLUMN     "partenaires_supp_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Partenaire" ADD COLUMN     "code_commune" TEXT,
ADD COLUMN     "code_epci" TEXT;
