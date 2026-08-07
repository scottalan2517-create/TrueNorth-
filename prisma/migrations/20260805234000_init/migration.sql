-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('STARTER', 'COMPLETE');

-- CreateEnum
CREATE TYPE "DebtType" AS ENUM ('CREDIT_CARD', 'STUDENT_LOAN', 'AUTO_LOAN', 'MORTGAGE', 'PERSONAL_LOAN', 'OTHER');

-- CreateEnum
CREATE TYPE "BudgetGroup" AS ENUM ('ESSENTIALS', 'LIFESTYLE', 'SAVINGS_AND_DEBT');

-- CreateEnum
CREATE TYPE "GoalKind" AS ENUM ('EMERGENCY_FUND', 'DEBT_PAYOFF', 'SAVINGS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PriorityStage" AS ENUM ('STABILIZE_AND_ATTACK_DEBT', 'SURVIVAL', 'PAY_DEBT', 'STABILIZE', 'INVEST');

-- CreateEnum
CREATE TYPE "PayoffStrategy" AS ENUM ('AVALANCHE', 'SNOWBALL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "onboardedAt" TIMESTAMP(3),
    "tier" "Tier",
    "tierPurchasedAt" TIMESTAMP(3),
    "plusActive" BOOLEAN NOT NULL DEFAULT false,
    "plusRenewsAt" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monthlyTakeHomeIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyEssentialSpend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "highInterestAprCutoff" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "defaultConsistencyPct" DOUBLE PRECISION NOT NULL DEFAULT 85,
    "payoffStrategy" "PayoffStrategy" NOT NULL DEFAULT 'AVALANCHE',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetWorthSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cash" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "investments" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "retirement" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "realEstate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherAssets" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditCardDebt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "studentLoanDebt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mortgageDebt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "autoLoanDebt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherDebt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NetWorthSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebtAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DebtType" NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "apr" DOUBLE PRECISION NOT NULL,
    "minPayment" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "paidOffAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebtAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetCategory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" "BudgetGroup" NOT NULL,
    "monthlyPlanned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetActual" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "month" VARCHAR(7) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BudgetActual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "GoalKind" NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "currentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "targetDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoneyDateLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priorityStage" "PriorityStage" NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoneyDateLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialProfile_userId_key" ON "FinancialProfile"("userId");

-- CreateIndex
CREATE INDEX "NetWorthSnapshot_userId_date_idx" ON "NetWorthSnapshot"("userId", "date");

-- CreateIndex
CREATE INDEX "DebtAccount_userId_idx" ON "DebtAccount"("userId");

-- CreateIndex
CREATE INDEX "BudgetCategory_userId_idx" ON "BudgetCategory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetActual_categoryId_month_key" ON "BudgetActual"("categoryId", "month");

-- CreateIndex
CREATE INDEX "Goal_userId_idx" ON "Goal"("userId");

-- CreateIndex
CREATE INDEX "MoneyDateLog_userId_date_idx" ON "MoneyDateLog"("userId", "date");

-- AddForeignKey
ALTER TABLE "FinancialProfile" ADD CONSTRAINT "FinancialProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NetWorthSnapshot" ADD CONSTRAINT "NetWorthSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtAccount" ADD CONSTRAINT "DebtAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetCategory" ADD CONSTRAINT "BudgetCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetActual" ADD CONSTRAINT "BudgetActual_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BudgetCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyDateLog" ADD CONSTRAINT "MoneyDateLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
