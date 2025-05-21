-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type_notification" TEXT NOT NULL,
    "canal_notification" TEXT NOT NULL,
    "date_notification" TIMESTAMPTZ(3),

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);
