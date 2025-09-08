-- CreateTable
CREATE TABLE "OfflineCounter" (
    "id" TEXT NOT NULL,
    "id_cms" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "code" TEXT,
    "nombre_vues" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfflineCounter_pkey" PRIMARY KEY ("id")
);
