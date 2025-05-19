/*
  Warnings:

  - You are about to alter the column `amount` on the `HuiGroup` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[userId,groupId]` on the table `HuiMember` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `totalDue` to the `HuiMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPaid` to the `HuiMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cycle` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dueDate` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HuiGroup" ADD COLUMN     "currentCycle" SMALLINT NOT NULL DEFAULT 1,
ADD COLUMN     "cycle" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "nextPaymentDate" TIMESTAMP(3),
ADD COLUMN     "rules" JSONB,
ADD COLUMN     "totalMembers" SMALLINT NOT NULL DEFAULT 0,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "HuiMember" ADD COLUMN     "lastPaymentDate" TIMESTAMP(3),
ADD COLUMN     "nextPaymentDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "position" SMALLINT,
ADD COLUMN     "totalDue" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "totalPaid" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "cycle" SMALLINT NOT NULL,
ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "groupId" TEXT NOT NULL,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "receipt" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- CreateTable
CREATE TABLE "PaymentHistory" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "PaymentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_key_key" ON "SystemSettings"("key");

-- CreateIndex
CREATE INDEX "HuiGroup_status_idx" ON "HuiGroup"("status");

-- CreateIndex
CREATE INDEX "HuiGroup_managerId_idx" ON "HuiGroup"("managerId");

-- CreateIndex
CREATE INDEX "HuiGroup_startDate_idx" ON "HuiGroup"("startDate");

-- CreateIndex
CREATE INDEX "HuiGroup_endDate_idx" ON "HuiGroup"("endDate");

-- CreateIndex
CREATE INDEX "HuiMember_userId_idx" ON "HuiMember"("userId");

-- CreateIndex
CREATE INDEX "HuiMember_groupId_idx" ON "HuiMember"("groupId");

-- CreateIndex
CREATE INDEX "HuiMember_status_idx" ON "HuiMember"("status");

-- CreateIndex
CREATE UNIQUE INDEX "HuiMember_userId_groupId_key" ON "HuiMember"("userId", "groupId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_memberId_idx" ON "Payment"("memberId");

-- CreateIndex
CREATE INDEX "Payment_groupId_idx" ON "Payment"("groupId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_dueDate_idx" ON "Payment"("dueDate");

-- CreateIndex
CREATE INDEX "Payment_paidAt_idx" ON "Payment"("paidAt");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "HuiGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentHistory" ADD CONSTRAINT "PaymentHistory_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentHistory" ADD CONSTRAINT "PaymentHistory_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemSettings" ADD CONSTRAINT "SystemSettings_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
