/*
  Warnings:

  - You are about to drop the column `status` on the `MemberPeriodContribution` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "MemberPeriodContribution_status_idx";

-- AlterTable
ALTER TABLE "MemberPeriodContribution" DROP COLUMN "status";

-- DropEnum
DROP TYPE "MemberContributionStatus";
