-- AlterTable
ALTER TABLE "public"."ChatMessage" ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "fileType" TEXT,
ADD COLUMN     "fileUrl" TEXT,
ALTER COLUMN "content" DROP NOT NULL;
