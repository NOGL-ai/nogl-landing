-- CreateEnum
CREATE TYPE "public"."DocFeedbackRating" AS ENUM ('UP', 'DOWN');

-- CreateTable
CREATE TABLE "public"."DocFeedback" (
    "id" TEXT NOT NULL,
    "docPath" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "rating" "public"."DocFeedbackRating" NOT NULL,
    "comment" TEXT,
    "userId" TEXT,
    "ipHash" VARCHAR(64),
    "userAgent" VARCHAR(512),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocFeedback_docPath_createdAt_idx" ON "public"."DocFeedback"("docPath", "createdAt");

-- CreateIndex
CREATE INDEX "DocFeedback_docPath_locale_rating_idx" ON "public"."DocFeedback"("docPath", "locale", "rating");
