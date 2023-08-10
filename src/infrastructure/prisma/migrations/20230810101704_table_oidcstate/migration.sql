-- CreateTable
CREATE TABLE "OIDC_STATE" (
    "id" TEXT NOT NULL,
    "state" TEXT,
    "nonce" TEXT,
    "idtoken" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OIDC_STATE_pkey" PRIMARY KEY ("id")
);
