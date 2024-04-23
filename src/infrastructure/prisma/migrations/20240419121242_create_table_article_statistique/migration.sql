-- CreateTable
CREATE TABLE "ArticleStatistique" (
    "articleId" TEXT NOT NULL,
    "rating" DECIMAL(65,30),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ArticleStatistique_pkey" PRIMARY KEY ("articleId")
);
