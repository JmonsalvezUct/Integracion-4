/*
  Warnings:

  - Added the required column `filename` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimetype` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Attachment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "mimetype" TEXT NOT NULL,
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;
