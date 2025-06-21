/*
  Warnings:

  - You are about to drop the column `memberId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `potTakerId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `scheduleStatus` on the `Payment` table. All the data in the column will be lost.
  - Changed the type of `status` on the `PaymentHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MemberContributionStatus" AS ENUM ('CHUA_DONG', 'DA_DONG', 'MIEN_DONG', 'TRE_HAN', 'CHO_XAC_NHAN');

-- AlterEnum
ALTER TYPE "PaymentType" ADD VALUE 'PERIOD_SETTLEMENT';

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_memberId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_potTakerId_fkey";

-- DropIndex
DROP INDEX "Payment_huiGroupId_idx";

-- DropIndex
DROP INDEX "Payment_potTakerId_idx";

-- DropIndex
DROP INDEX "Payment_scheduleStatus_idx";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "memberId",
DROP COLUMN "potTakerId",
DROP COLUMN "scheduleStatus",
ADD COLUMN     "potTakerMemberId" TEXT;

-- AlterTable
ALTER TABLE "PaymentHistory" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "MemberPeriodContribution" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amountContributed" DECIMAL(10,2) NOT NULL,
    "status" "MemberContributionStatus" NOT NULL DEFAULT 'CHUA_DONG',
    "notes" TEXT,
    "contributionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberPeriodContribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemberPeriodContribution_memberId_idx" ON "MemberPeriodContribution"("memberId");

-- CreateIndex
CREATE INDEX "MemberPeriodContribution_status_idx" ON "MemberPeriodContribution"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MemberPeriodContribution_paymentId_memberId_key" ON "MemberPeriodContribution"("paymentId", "memberId");

-- CreateIndex
CREATE INDEX "unique_period_in_group" ON "Payment"("huiGroupId", "period");

-- CreateIndex
CREATE INDEX "Payment_potTakerMemberId_idx" ON "Payment"("potTakerMemberId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_potTakerMemberId_fkey" FOREIGN KEY ("potTakerMemberId") REFERENCES "HuiMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberPeriodContribution" ADD CONSTRAINT "MemberPeriodContribution_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberPeriodContribution" ADD CONSTRAINT "MemberPeriodContribution_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "HuiMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
