-- CreateTable
CREATE TABLE "Personnalisation" (
    "user_id" TEXT NOT NULL,
    "perso_alimentation_done_once" BOOLEAN NOT NULL DEFAULT false,
    "perso_transport_done_once" BOOLEAN NOT NULL DEFAULT false,
    "perso_logement_done_once" BOOLEAN NOT NULL DEFAULT false,
    "perso_consommation_done_once" BOOLEAN NOT NULL DEFAULT false,
    "tags_exclusion" TEXT[],
    "actions_rejetees_all" TEXT[],
    "actions_alimentation_rejetees" TEXT[],
    "actions_logement_rejetees" TEXT[],
    "actions_transport_rejetees" TEXT[],
    "actions_consommation_rejetees" TEXT[],

    CONSTRAINT "Personnalisation_pkey" PRIMARY KEY ("user_id")
);
