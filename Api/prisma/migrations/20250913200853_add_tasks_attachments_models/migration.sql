/*
  Warnings:

  - You are about to drop the column `url` on the `Attachment` table. All the data in the column will be lost.
  - Added the required column `originalName` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Task_title_idx";

-- AlterTable
ALTER TABLE "public"."Attachment" DROP COLUMN "url",
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "status" TEXT DEFAULT 'PENDING';
