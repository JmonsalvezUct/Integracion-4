import {prisma}  from "../../app/loaders/prisma.js";

type CreateTaskDTO = {
  title: string;
  description?: string;
  projectId: number;
  creatorId: number;
  assigneeId?: number;
  status?: string;   // 'pending' | 'in_progress' | 'done' | 'archived'
  priority?: string; // 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string;  // ISO
};

export async function createTaskSvc(data: CreateTaskDTO) {
  const statusName = data.status ?? "pending";
  const priorityName = data.priority ?? "medium";

  const [status, priority] = await Promise.all([
    prisma.status.findUniqueOrThrow({ where: { status: statusName } }),
    prisma.priority.findUniqueOrThrow({ where: { priority: priorityName } }),
  ]);

  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      project: { connect: { id: data.projectId } },
      creator: { connect: { id: data.creatorId } },
      ...(data.assigneeId ? { assignee: { connect: { id: data.assigneeId } } } : {}),
      status: { connect: { id: status.id } },
      priority: { connect: { id: priority.id } },
      ...(data.dueDate ? { dueDate: new Date(data.dueDate) } : {}),
    },
  });
}
