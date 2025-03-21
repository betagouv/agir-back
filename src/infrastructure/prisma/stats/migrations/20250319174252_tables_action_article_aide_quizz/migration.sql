-- CreateTable
CREATE TABLE "ActionCopy" (
    "type_code_id" TEXT NOT NULL,
    "code_action" TEXT NOT NULL,
    "cms_id" TEXT NOT NULL,
    "type_action" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "thematique" TEXT NOT NULL,
    "vue_le" TIMESTAMPTZ(3),
    "faite_le" TIMESTAMPTZ(3)
);

-- CreateTable
CREATE TABLE "ArticleCopy" (
    "cms_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "thematique" TEXT NOT NULL,
    "lu_le" TIMESTAMPTZ(3),
    "like_level" INTEGER,
    "est_favoris" BOOLEAN
);

-- CreateTable
CREATE TABLE "AideCopy" (
    "cms_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "thematique" TEXT NOT NULL,
    "vue_le" TIMESTAMPTZ(3),
    "clicked_infos" BOOLEAN,
    "clicked_demande" BOOLEAN
);

-- CreateTable
CREATE TABLE "QuizzCopy" (
    "cms_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "thematique" TEXT NOT NULL,
    "bon_premier_coup" BOOLEAN,
    "date_premier_coup" TIMESTAMPTZ(3),
    "like_level" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "ActionCopy_user_id_type_code_id_key" ON "ActionCopy"("user_id", "type_code_id");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleCopy_user_id_cms_id_key" ON "ArticleCopy"("user_id", "cms_id");

-- CreateIndex
CREATE UNIQUE INDEX "AideCopy_user_id_cms_id_key" ON "AideCopy"("user_id", "cms_id");

-- CreateIndex
CREATE UNIQUE INDEX "QuizzCopy_user_id_cms_id_key" ON "QuizzCopy"("user_id", "cms_id");
