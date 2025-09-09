/*
  Warnings:

  - You are about to drop the `Action` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Attachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AttachmentType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChangeHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NotificationType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Priority` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Status` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserProject` table. If the table is not empty, all the data it contains will be lost.

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

-- DropTable
DROP TABLE "public"."Action";

-- DropTable
DROP TABLE "public"."Attachment";

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
DROP TABLE "public"."Project";

-- DropTable
DROP TABLE "public"."ProjectRole";

-- DropTable
DROP TABLE "public"."Status";

-- DropTable
DROP TABLE "public"."Task";

-- DropTable
DROP TABLE "public"."User";

-- DropTable
DROP TABLE "public"."UserProject";

-- CreateTable
CREATE TABLE "public"."Proyecto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tarea" (
    "id" TEXT NOT NULL,
    "proyectoId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "fechaLimite" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Adjunto" (
    "id" TEXT NOT NULL,
    "tareaId" TEXT NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tamanoBytes" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Adjunto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Tarea" ADD CONSTRAINT "Tarea_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "public"."Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Adjunto" ADD CONSTRAINT "Adjunto_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "public"."Tarea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
