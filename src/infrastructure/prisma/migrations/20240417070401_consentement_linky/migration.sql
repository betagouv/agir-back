-- CreateTable
CREATE TABLE "LinkyConsentement" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "date_consentement" TEXT NOT NULL,
    "date_fin_consentement" TEXT NOT NULL,
    "mention_usage_donnees" TEXT NOT NULL,
    "type_donnees" TEXT NOT NULL,
    "texte_signature" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "prm" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "LinkyConsentement_pkey" PRIMARY KEY ("id")
);
