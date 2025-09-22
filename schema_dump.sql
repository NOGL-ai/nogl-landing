generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider          = "postgresql"
  url               = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}

model User {
  id                    String            @id @default(cuid())
  name                  String?
  email                 String            @unique
  emailVerified         DateTime?
  image                 String?
  password              String?
  passwordResetToken    String?           @unique
  passwordResetTokenExp DateTime?
  role                  UserRole          @default(USER)
  isCommunityMember     Boolean           @default(false)
  customerId            String?           @unique @map("customer_id")
  subscriptionId        String?           @unique @map("subscription_id")
  priceId               String?           @map("price_id")
  currentPeriodEnd      DateTime?         @map("current_period_end")
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  onboardingCompleted   Boolean           @default(false)
  bio                   String?
  expertise             String[]
  yearsOfExperience     Int?
  languages             String[]
  socialLinks           Json?
  hourlyRate            Float?
  cancellationPolicy    String?
  payoutMethod          PayoutMethod?
  bankAccountHolder     String?
  iban                  String?
  bic                   String?
  vatId                 String?
  taxId                 String?
  companyType           CompanyType?
  companyName           String?
  registrationNumber    String?
  ustIdNr               String?
  steuernummer          String?
  businessAddress       Json?
  isVerifiedBusiness    Boolean           @default(false)
  businessDocuments     Json?
  isVerifiedExpert      Boolean           @default(false)
  verificationDate      DateTime?
  expertCategories      SessionCategory[]
  totalEarnings         Float             @default(0)
  rating                Float?
  responseRate          Float?
  totalSessions         Int               @default(0)
  totalReferrals        Int               @default(0)
  referralEarnings      Float             @default(0)
  referredById          String?
  totalFavorites        Int               @default(0)
  accounts              Account[]
  apiKeys               ApiKey[]
  availability          Availability[]
  bookings              Booking[]
  certificates          Certificate[]
  expertSessions        ExpertSession[]   @relation("UserSessionsHosted")
  invitations           Invitation[]
  referralCodes         ReferralCode[]    @relation("UserReferrals")
  referralUses          ReferralUse[]     @relation("UserReferralUses")
  reviews               Review[]
  sessions              Session[]
  referredBy            User?             @relation("UserReferredBy", fields: [referredById], references: [id])
  referredUsers         User[]            @relation("UserReferredBy")
  favorites             UserFavorite[]    @relation("UserFavorites")

  @@index([companyType])
  @@index([isVerifiedExpert])
  @@index([role, isVerifiedExpert])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ApiKey {
  id        String   @id @default(cuid())
  key       String
  name      String   @unique
  userId    String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Invitation {
  id        String   @id @default(cuid())
  email     String   @unique
  role      UserRole @default(USER)
  token     String   @unique
  createdAt DateTime @default(now())
  expiresAt DateTime
  accepted  Boolean  @default(false)
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model ExpertSession {
  id                      String               @id @default(uuid())
  title                   String
  category                SessionCategory
  sessionType             SessionType
  minParticipants         Int
  maxParticipants         Int
  date                    DateTime
  startTime               DateTime
  timeZone                String
  duration                Int
  price                   Float
  description             String
  expertId                String
  tags                    String[]
  isCircleCommunity       Boolean              @default(false)
  coverImage              String
  galleryImages           String[]             @default([])
  createdAt               DateTime             @default(now())
  updatedAt               DateTime             @updatedAt
  additionalBenefits      String?
  prerequisites           String[]
  learningOutcomes        String[]
  targetAudience          String[]
  expertiseLevel          String
  language                String               @default("English")
  status                  SessionStatus        @default(SCHEDULED)
  availableSpots          Int                  @default(0)
  bookedSpots             Int                  @default(0)
  averageRating           Float?
  totalReviews            Int                  @default(0)
  viewCount               Int                  @default(0)
  lastBookingDate         DateTime?
  isFeatured              Boolean              @default(false)
  earlyBirdDiscount       Float?
  earlyBirdEndDate        DateTime?
  groupDiscountPercentage Float                @default(15)
  cancellationPolicy      String?
  accessDurationDays      Int                  @default(7)
  totalFavorites          Int                  @default(0)
  bookings                Booking[]
  expert                  User                 @relation("UserSessionsHosted", fields: [expertId], references: [id])
  addons                  ExpertSessionAddon[]
  recording               RecordingDetails?
  recurringSchedule       RecurringSchedule?
  reviews                 Review[]
  materials               SessionMaterial[]
  notes                   SessionNote[]
  favoritedBy             UserFavorite[]       @relation("SessionFavorites")
  benefits                Benefit[]            @relation("BenefitToExpertSession")

  @@index([expertId, status, date])
  @@index([category, expertiseLevel, status])
  @@index([date, startTime, status])
  @@index([price, sessionType])
  @@index([isFeatured])
}

model Benefit {
  id        String          @id @default(cuid())
  name      String          @unique
  icon      String?
  isDefault Boolean         @default(false)
  sessions  ExpertSession[] @relation("BenefitToExpertSession")
}

model Booking {
  id                 String         @id @default(cuid())
  expertSessionId    String
  userId             String
  numParticipants    Int            @default(1)
  status             BookingStatus  @default(PENDING)
  expiresAt          DateTime?
  total              Float
  includeRecording   Boolean        @default(false)
  recordingCount     Int            @default(0)
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt
  paymentStatus      PaymentStatus  @default(PENDING)
  paymentMethod      String?
  refundStatus       RefundStatus?
  cancellationReason String?
  joinUrl            String?
  feedback           String?
  attended           Boolean        @default(false)
  remindersSent      Json?
  notes              String?
  originalPrice      Float
  discountAmount     Float?
  discountCode       String?
  paymentDeadline    DateTime?
  lastReminderSent   DateTime?
  reminderCount      Int            @default(0)
  expertSession      ExpertSession  @relation(fields: [expertSessionId], references: [id])
  user               User           @relation(fields: [userId], references: [id])
  addons             BookingAddon[]

  @@index([expertSessionId, status])
  @@index([userId, status, createdAt])
}

model Review {
  id              String        @id @default(cuid())
  expertSessionId String
  userId          String
  rating          Int
  comment         String
  title           String?
  isVerified      Boolean       @default(false)
  helpfulCount    Int           @default(0)
  expertResponse  String?
  responseDate    DateTime?
  createdAt       DateTime      @default(now())
  expertSession   ExpertSession @relation(fields: [expertSessionId], references: [id], onDelete: Cascade)
  user            User          @relation(fields: [userId], references: [id])

  @@unique([userId, expertSessionId])
  @@index([expertSessionId])
  @@index([rating])
}

model ExpertSessionAddon {
  id              String         @id @default(cuid())
  expertSessionId String
  name            String
  description     String?
  price           Float
  maxQuantity     Int?
  isRequired      Boolean        @default(false)
  isActive        Boolean        @default(true)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  bookings        BookingAddon[]
  expertSession   ExpertSession  @relation(fields: [expertSessionId], references: [id])

  @@index([expertSessionId, isActive])
}

model BookingAddon {
  id         String             @id @default(cuid())
  bookingId  String
  addonId    String
  quantity   Int                @default(1)
  unitPrice  Float
  totalPrice Float
  addon      ExpertSessionAddon @relation(fields: [addonId], references: [id])
  booking    Booking            @relation(fields: [bookingId], references: [id])

  @@unique([bookingId, addonId])
  @@index([bookingId])
}

model Certificate {
  id         String    @id @default(cuid())
  name       String
  issuer     String
  issueDate  DateTime
  expiryDate DateTime?
  imageUrl   String?
  userId     String
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Availability {
  id        String @id @default(cuid())
  userId    String
  dayOfWeek Int
  startTime String
  endTime   String
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, dayOfWeek, startTime, endTime])
}

model RecordingDetails {
  id         String        @id @default(cuid())
  sessionId  String        @unique
  url        String?
  duration   Int?
  format     String?
  size       Int?
  uploadedAt DateTime?
  expiresAt  DateTime?
  session    ExpertSession @relation(fields: [sessionId], references: [id])
}

model SessionMaterial {
  id            String        @id @default(cuid())
  sessionId     String
  name          String
  type          MaterialType
  url           String
  isRequired    Boolean       @default(false)
  description   String?
  downloadCount Int           @default(0)
  uploadedAt    DateTime      @default(now())
  size          Int?
  session       ExpertSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId])
}

model AuditLog {
  id         String   @id @default(cuid())
  entityType String
  entityId   String
  action     String
  userId     String
  changes    Json
  createdAt  DateTime @default(now())

  @@index([entityType, entityId])
  @@index([userId, createdAt])
}

model SessionNote {
  id        String        @id @default(cuid())
  sessionId String
  content   String
  type      String
  isDefault Boolean       @default(false)
  session   ExpertSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId, type])
}

model ReferralCode {
  id           String        @id @default(cuid())
  code         String        @unique
  userId       String
  type         ReferralType
  maxUses      Int           @default(100)
  expiresAt    DateTime?
  createdAt    DateTime      @default(now())
  isActive     Boolean       @default(true)
  referrer     User          @relation("UserReferrals", fields: [userId], references: [id])
  referralUses ReferralUse[]

  @@index([code, isActive])
  @@index([userId, type])
}

model ReferralUse {
  id             String         @id @default(cuid())
  referralId     String
  referredUserId String
  usedAt         DateTime       @default(now())
  reward         Float?
  status         ReferralStatus @default(PENDING)
  referralCode   ReferralCode   @relation(fields: [referralId], references: [id])
  referredUser   User           @relation("UserReferralUses", fields: [referredUserId], references: [id])

  @@unique([referralId, referredUserId])
  @@index([status, usedAt])
}

model RecurringSchedule {
  id        String        @id @default(cuid())
  sessionId String        @unique
  frequency String
  interval  Int           @default(1)
  endDate   DateTime?
  session   ExpertSession @relation(fields: [sessionId], references: [id])
}

model UserFavorite {
  id        String        @id @default(cuid())
  userId    String
  sessionId String
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  status    Boolean       @default(true)
  session   ExpertSession @relation("SessionFavorites", fields: [sessionId], references: [id], onDelete: Cascade)
  user      User          @relation("UserFavorites", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, sessionId])
  @@index([userId, status])
  @@index([sessionId, status])
  @@map("user_favorites")
}

enum UserRole {
  USER
  EXPERT
  ADMIN
}

enum SessionType {
  ONE_ON_ONE
  GROUP
  WEBINAR
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  EXPIRED
}

enum SessionCategory {
  DESIGN
  DEVELOPMENT
  MARKETING
  BUSINESS
  OTHER
}

enum PayoutMethod {
  SEPA
  PAYPAL
  WISE
  OTHER
}

enum CompanyType {
  EINZELUNTERNEHMEN
  FREIBERUFLER
  GMBH
  UG
  AUSLAND
}

enum ReferralType {
  USER_INVITE
  EXPERT_INVITE
}

enum ReferralStatus {
  PENDING
  APPROVED
  REJECTED
  PAID
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum RefundStatus {
  PENDING
  PROCESSED
  REJECTED
}

enum SessionStatus {
  SCHEDULED
  ONGOING
  COMPLETED
  CANCELLED
}

enum MaterialType {
  PDF
  VIDEO
  IMAGE
  DOCUMENT
}


