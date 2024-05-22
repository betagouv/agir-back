-- CreateTable
CREATE TABLE "KycStatistique" (
    "kycId" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "reponse" TEXT NOT NULL,

    CONSTRAINT "KycStatistique_pkey" PRIMARY KEY ("utilisateurId","kycId")
);
