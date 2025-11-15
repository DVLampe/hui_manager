-- DropForeignKey
ALTER TABLE "public"."HuiGroup" DROP CONSTRAINT "HuiGroup_ownerId_fkey";

-- AlterTable
ALTER TABLE "public"."HuiGroup" ADD COLUMN     "bankAccountName" TEXT,
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "ownerGuestName" TEXT,
ADD COLUMN     "qrCodeUrl" TEXT,
ALTER COLUMN "ownerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."HuiGroup" ADD CONSTRAINT "HuiGroup_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
