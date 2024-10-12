/*
  Warnings:

  - You are about to drop the column `fileId` on the `Job` table. All the data in the column will be lost.
  - Added the required column `type` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('PRODUCTS_CSV');

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_fileId_fkey";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "fileId",
ADD COLUMN     "requestFileId" TEXT,
ADD COLUMN     "resultFileId" TEXT,
ADD COLUMN     "type" "JobType" NOT NULL;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_requestFileId_fkey" FOREIGN KEY ("requestFileId") REFERENCES "UploadedFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_resultFileId_fkey" FOREIGN KEY ("resultFileId") REFERENCES "UploadedFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
