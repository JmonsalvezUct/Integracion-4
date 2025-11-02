-- CreateTable
CREATE TABLE "TaskTime" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskTime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskTime_taskId_idx" ON "TaskTime"("taskId");

-- CreateIndex
CREATE INDEX "TaskTime_userId_idx" ON "TaskTime"("userId");

-- AddForeignKey
ALTER TABLE "TaskTime" ADD CONSTRAINT "TaskTime_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTime" ADD CONSTRAINT "TaskTime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
