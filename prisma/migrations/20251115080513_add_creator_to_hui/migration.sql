-- AlterTable
ALTER TABLE "public"."HuiGroup" ADD COLUMN     "creatorId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."HuiGroup" ADD CONSTRAINT "HuiGroup_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
