/*
  Warnings:

  - You are about to drop the `Priority` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Status` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ProjectRoleType" AS ENUM ('admin', 'developer', 'guest');

-- CreateEnum
CREATE TYPE "public"."PriorityType" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "public"."StatusType" AS ENUM ('created', 'in_progress', 'completed', 'archived');

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_priorityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_statusId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserProject" DROP CONSTRAINT "UserProject_roleId_fkey";

-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "priority" "public"."PriorityType" NOT NULL DEFAULT 'medium',
ADD COLUMN     "status" "public"."StatusType" NOT NULL DEFAULT 'created';

-- AlterTable
ALTER TABLE "public"."UserProject" ADD COLUMN     "role" "public"."ProjectRoleType" NOT NULL DEFAULT 'developer';

-- DropTable
DROP TABLE "public"."Priority";

-- DropTable
DROP TABLE "public"."ProjectRole";

-- DropTable
DROP TABLE "public"."Status";
