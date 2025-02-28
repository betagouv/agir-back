-- CreateTable
CREATE TABLE "KYCCopy" (
    "code_kyc" TEXT NOT NULL,
    "cms_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "thematique" TEXT NOT NULL,
    "derniere_mise_a_jour" TIMESTAMPTZ(3) NOT NULL,
    "type_question" TEXT NOT NULL,
    "reponse_texte" TEXT,
    "reponse_numeric" TEXT,
    "reponse_unique_code" TEXT,
    "reponse_multiple_code" TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- CreateIndex
CREATE UNIQUE INDEX "KYCCopy_user_id_code_kyc_key" ON "KYCCopy"("user_id", "code_kyc");
