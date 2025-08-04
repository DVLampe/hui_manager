/*
  Warnings:

  - You are about to drop the column `cycle` on the `Payment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."HuiMember" DROP CONSTRAINT "HuiMember_userId_fkey";

-- AlterTable
ALTER TABLE "public"."HuiMember" ADD COLUMN     "guestName" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "cycle";

-- AddForeignKey
ALTER TABLE "public"."HuiMember" ADD CONSTRAINT "HuiMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
