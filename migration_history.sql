-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'EXPERT', 'ADMIN');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('ONE_ON_ONE', 'GROUP', 'WEBINAR');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SessionCategory" AS ENUM ('DESIGN', 'DEVELOPMENT', 'MARKETING', 'BUSINESS', 'OTHER');

-- CreateEnum
CREATE TYPE "PayoutMethod" AS ENUM ('SEPA', 'PAYPAL', 'WISE', 'OTHER');

-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('EINZELUNTERNEHMEN', 'FREIBERUFLER', 'GMBH', 'UG', 'AUSLAND');

-- CreateEnum
CREATE TYPE "ReferralType" AS ENUM ('USER_INVITE', 'EXPERT_INVITE');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('PDF', 'VIDEO', 'IMAGE', 'DOCUMENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetTokenExp" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isCommunityMember" BOOLEAN NOT NULL DEFAULT false,
    "customer_id" TEXT,
    "subscription_id" TEXT,
    "price_id" TEXT,
    "current_period_end" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "expertise" TEXT[],
    "yearsOfExperience" INTEGER,
    "languages" TEXT[],
    "socialLinks" JSONB,
    "hourlyRate" DOUBLE PRECISION,
    "cancellationPolicy" TEXT,
    "payoutMethod" "PayoutMethod",
    "bankAccountHolder" TEXT,
    "iban" TEXT,
    "bic" TEXT,
    "vatId" TEXT,
    "taxId" TEXT,
    "companyType" "CompanyType",
    "companyName" TEXT,
    "registrationNumber" TEXT,
    "ustIdNr" TEXT,
    "steuernummer" TEXT,
    "businessAddress" JSONB,
    "isVerifiedBusiness" BOOLEAN NOT NULL DEFAULT false,
    "businessDocuments" JSONB,
    "isVerifiedExpert" BOOLEAN NOT NULL DEFAULT false,
    "verificationDate" TIMESTAMP(3),
    "expertCategories" "SessionCategory"[],
    "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "responseRate" DOUBLE PRECISION,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "referralEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "referredById" TEXT,
    "totalFavorites" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "ExpertSession" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "SessionCategory" NOT NULL,
    "sessionType" "SessionType" NOT NULL,
    "minParticipants" INTEGER NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "timeZone" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "tags" TEXT[],
    "isCircleCommunity" BOOLEAN NOT NULL DEFAULT false,
    "coverImage" TEXT NOT NULL,
    "galleryImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "additionalBenefits" TEXT,
    "prerequisites" TEXT[],
    "learningOutcomes" TEXT[],
    "targetAudience" TEXT[],
    "expertiseLevel" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'English',
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "availableSpots" INTEGER NOT NULL DEFAULT 0,
    "bookedSpots" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastBookingDate" TIMESTAMP(3),
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "earlyBirdDiscount" DOUBLE PRECISION,
    "earlyBirdEndDate" TIMESTAMP(3),
    "groupDiscountPercentage" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "cancellationPolicy" TEXT,
    "accessDurationDays" INTEGER NOT NULL DEFAULT 7,
    "totalFavorites" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExpertSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Benefit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Benefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "expertSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "numParticipants" INTEGER NOT NULL DEFAULT 1,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3),
    "total" DOUBLE PRECISION NOT NULL,
    "includeRecording" BOOLEAN NOT NULL DEFAULT false,
    "recordingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "refundStatus" "RefundStatus",
    "cancellationReason" TEXT,
    "joinUrl" TEXT,
    "feedback" TEXT,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "remindersSent" JSONB,
    "notes" TEXT,
    "originalPrice" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION,
    "discountCode" TEXT,
    "paymentDeadline" TIMESTAMP(3),
    "lastReminderSent" TIMESTAMP(3),
    "reminderCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "expertSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "title" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "expertResponse" TEXT,
    "responseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpertSessionAddon" (
    "id" TEXT NOT NULL,
    "expertSessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "maxQuantity" INTEGER,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpertSessionAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingAddon" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "addonId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BookingAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "imageUrl" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordingDetails" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "url" TEXT,
    "duration" INTEGER,
    "format" TEXT,
    "size" INTEGER,
    "uploadedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "RecordingDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionMaterial" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MaterialType" NOT NULL,
    "url" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "size" INTEGER,

    CONSTRAINT "SessionMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionNote" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SessionNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ReferralType" NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 100,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ReferralCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralUse" (
    "id" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reward" DOUBLE PRECISION,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "ReferralUse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringSchedule" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "RecurringSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BenefitToExpertSession" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "User"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_customer_id_key" ON "User"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_subscription_id_key" ON "User"("subscription_id");

-- CreateIndex
CREATE INDEX "User_companyType_idx" ON "User"("companyType");

-- CreateIndex
CREATE INDEX "User_isVerifiedExpert_idx" ON "User"("isVerifiedExpert");

-- CreateIndex
CREATE INDEX "User_role_isVerifiedExpert_idx" ON "User"("role", "isVerifiedExpert");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_name_key" ON "ApiKey"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_email_key" ON "Invitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "ExpertSession_expertId_status_date_idx" ON "ExpertSession"("expertId", "status", "date");

-- CreateIndex
CREATE INDEX "ExpertSession_category_expertiseLevel_status_idx" ON "ExpertSession"("category", "expertiseLevel", "status");

-- CreateIndex
CREATE INDEX "ExpertSession_date_startTime_status_idx" ON "ExpertSession"("date", "startTime", "status");

-- CreateIndex
CREATE INDEX "ExpertSession_price_sessionType_idx" ON "ExpertSession"("price", "sessionType");

-- CreateIndex
CREATE INDEX "ExpertSession_isFeatured_idx" ON "ExpertSession"("isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "Benefit_name_key" ON "Benefit"("name");

-- CreateIndex
CREATE INDEX "Booking_expertSessionId_status_idx" ON "Booking"("expertSessionId", "status");

-- CreateIndex
CREATE INDEX "Booking_userId_status_createdAt_idx" ON "Booking"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Review_expertSessionId_idx" ON "Review"("expertSessionId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_expertSessionId_key" ON "Review"("userId", "expertSessionId");

-- CreateIndex
CREATE INDEX "ExpertSessionAddon_expertSessionId_isActive_idx" ON "ExpertSessionAddon"("expertSessionId", "isActive");

-- CreateIndex
CREATE INDEX "BookingAddon_bookingId_idx" ON "BookingAddon"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingAddon_bookingId_addonId_key" ON "BookingAddon"("bookingId", "addonId");

-- CreateIndex
CREATE UNIQUE INDEX "Availability_userId_dayOfWeek_startTime_endTime_key" ON "Availability"("userId", "dayOfWeek", "startTime", "endTime");

-- CreateIndex
CREATE UNIQUE INDEX "RecordingDetails_sessionId_key" ON "RecordingDetails"("sessionId");

-- CreateIndex
CREATE INDEX "SessionMaterial_sessionId_idx" ON "SessionMaterial"("sessionId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SessionNote_sessionId_type_idx" ON "SessionNote"("sessionId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralCode_code_key" ON "ReferralCode"("code");

-- CreateIndex
CREATE INDEX "ReferralCode_code_isActive_idx" ON "ReferralCode"("code", "isActive");

-- CreateIndex
CREATE INDEX "ReferralCode_userId_type_idx" ON "ReferralCode"("userId", "type");

-- CreateIndex
CREATE INDEX "ReferralUse_status_usedAt_idx" ON "ReferralUse"("status", "usedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralUse_referralId_referredUserId_key" ON "ReferralUse"("referralId", "referredUserId");

-- CreateIndex
CREATE UNIQUE INDEX "RecurringSchedule_sessionId_key" ON "RecurringSchedule"("sessionId");

-- CreateIndex
CREATE INDEX "user_favorites_userId_status_idx" ON "user_favorites"("userId", "status");

-- CreateIndex
CREATE INDEX "user_favorites_sessionId_status_idx" ON "user_favorites"("sessionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_favorites_userId_sessionId_key" ON "user_favorites"("userId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "_BenefitToExpertSession_AB_unique" ON "_BenefitToExpertSession"("A", "B");

-- CreateIndex
CREATE INDEX "_BenefitToExpertSession_B_index" ON "_BenefitToExpertSession"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertSession" ADD CONSTRAINT "ExpertSession_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_expertSessionId_fkey" FOREIGN KEY ("expertSessionId") REFERENCES "ExpertSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_expertSessionId_fkey" FOREIGN KEY ("expertSessionId") REFERENCES "ExpertSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertSessionAddon" ADD CONSTRAINT "ExpertSessionAddon_expertSessionId_fkey" FOREIGN KEY ("expertSessionId") REFERENCES "ExpertSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingAddon" ADD CONSTRAINT "BookingAddon_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingAddon" ADD CONSTRAINT "BookingAddon_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "ExpertSessionAddon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordingDetails" ADD CONSTRAINT "RecordingDetails_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExpertSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionMaterial" ADD CONSTRAINT "SessionMaterial_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExpertSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionNote" ADD CONSTRAINT "SessionNote_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExpertSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralUse" ADD CONSTRAINT "ReferralUse_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "ReferralCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralUse" ADD CONSTRAINT "ReferralUse_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringSchedule" ADD CONSTRAINT "RecurringSchedule_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExpertSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExpertSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BenefitToExpertSession" ADD CONSTRAINT "_BenefitToExpertSession_A_fkey" FOREIGN KEY ("A") REFERENCES "Benefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BenefitToExpertSession" ADD CONSTRAINT "_BenefitToExpertSession_B_fkey" FOREIGN KEY ("B") REFERENCES "ExpertSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

