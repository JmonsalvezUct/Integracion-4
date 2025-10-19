/*
  Warnings:

  - A unique constraint covering the columns `[name,projectId]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectId` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Tag_name_key";

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "projectId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_projectId_key" ON "Tag"("name", "projectId");

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
