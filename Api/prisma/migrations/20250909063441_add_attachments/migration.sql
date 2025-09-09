/*
  Warnings:

  - You are about to drop the column `typeId` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `assigneeId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `creatorId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `priorityId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `statusId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `Action` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AttachmentType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChangeHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NotificationType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Priority` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Status` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserProject` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `filename` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimetype` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Attachment" DROP CONSTRAINT "Attachment_taskId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Attachment" DROP CONSTRAINT "Attachment_typeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChangeHistory" DROP CONSTRAINT "ChangeHistory_actionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChangeHistory" DROP CONSTRAINT "ChangeHistory_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChangeHistory" DROP CONSTRAINT "ChangeHistory_taskId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChangeHistory" DROP CONSTRAINT "ChangeHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_typeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_priorityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_statusId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserProject" DROP CONSTRAINT "UserProject_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserProject" DROP CONSTRAINT "UserProject_roleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserProject" DROP CONSTRAINT "UserProject_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Attachment" DROP COLUMN "typeId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "mimetype" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Task" DROP COLUMN "assigneeId",
DROP COLUMN "creatorId",
DROP COLUMN "dueDate",
DROP COLUMN "priorityId",
DROP COLUMN "statusId",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "public"."Action";

-- DropTable
DROP TABLE "public"."AttachmentType";

-- DropTable
DROP TABLE "public"."ChangeHistory";

-- DropTable
DROP TABLE "public"."Notification";

-- DropTable
DROP TABLE "public"."NotificationType";

-- DropTable
DROP TABLE "public"."Priority";

-- DropTable
DROP TABLE "public"."ProjectRole";

-- DropTable
DROP TABLE "public"."Status";

-- DropTable
DROP TABLE "public"."User";

-- DropTable
DROP TABLE "public"."UserProject";

-- CreateIndex
CREATE INDEX "Attachment_taskId_idx" ON "public"."Attachment"("taskId");

-- CreateIndex
CREATE INDEX "Project_name_idx" ON "public"."Project"("name");

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "public"."Task"("projectId");

-- CreateIndex
CREATE INDEX "Task_title_idx" ON "public"."Task"("title");

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
