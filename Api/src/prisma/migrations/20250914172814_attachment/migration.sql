/*
  Warnings:

  - You are about to drop the column `typeId` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the `AttachmentType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Attachment" DROP CONSTRAINT "Attachment_typeId_fkey";

-- AlterTable
ALTER TABLE "public"."Attachment" DROP COLUMN "typeId",
DROP COLUMN "url";

-- DropTable
DROP TABLE "public"."AttachmentType";
