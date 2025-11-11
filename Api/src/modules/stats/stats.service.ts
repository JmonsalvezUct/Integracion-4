import { prisma } from '../../app/loaders/prisma.js';
import { ActionType } from '@prisma/client';

export const statsService = {

  /**
   * Estadísticas de desempeño individual considerando projectId
   */
  async getUserStats(userId: number, projectId: number, from?: string, to?: string) {
    const dateFilter: any = {};
    if (from) {
      const fromDate = new Date(from);
      if (isNaN(fromDate.getTime())) throw new Error('Formato de fecha "from" inválido. Use YYYY-MM-DD');
      dateFilter.gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      if (isNaN(toDate.getTime())) throw new Error('Formato de fecha "to" inválido. Use YYYY-MM-DD');
      dateFilter.lte = toDate;
    }

    // === 1. Tareas completadas del usuario dentro del proyecto ===
    const taskCompletionHistory = await prisma.changeHistory.findMany({
      where: {
        action: ActionType.STATUS_CHANGED,
        description: { contains: 'completed', mode: 'insensitive' },
        userId,
        projectId, // 🔹 filtro por proyecto
        ...(from || to ? { createdAt: dateFilter } : {}),
      },
      select: {
        taskId: true,
        createdAt: true,
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
            projectId: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const completedTasks = taskCompletionHistory
      .filter(h => h.task?.projectId === projectId) // 🔹 redundancia de seguridad
      .map(h => ({ ...h.task!, completedAt: h.createdAt }));

    // === 2. Tiempo registrado por el usuario dentro del proyecto ===
    const timeEntries = await prisma.taskTime.findMany({
      where: {
        userId,
        task: { projectId }, // 🔹 solo tareas de ese proyecto
        ...(from || to ? { date: dateFilter } : {}),
      },
      select: { durationMinutes: true, date: true },
      orderBy: { date: 'asc' },
    });

    const totalMinutes = timeEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
    const workedDates = [...new Set(timeEntries.map(e => e.date.toISOString().slice(0, 10)))];

    // === 3. Burndown (tareas completadas por día) ===
    const burndown = completedTasks.reduce((acc, t) => {
      const date = t.completedAt.toISOString().slice(0, 10);
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // === 4. Burndown de tiempo (minutos por día) ===
    const timeBurndown = timeEntries.reduce((acc, e) => {
      const date = e.date.toISOString().slice(0, 10);
      acc[date] = (acc[date] || 0) + e.durationMinutes;
      return acc;
    }, {} as Record<string, number>);

    // === 5. Total de tareas asignadas al usuario en el proyecto ===
    const assignedTasksCount = await prisma.task.count({
      where: {
        assigneeId: userId,
        projectId, // 🔹 filtro obligatorio
        ...(from || to ? { createdAt: dateFilter } : {}),
      },
    });

    return {
      projectId,
      completedTasks,
      completedTasksCount: completedTasks.length,
      assignedTasksCount,
      totalMinutes,
      totalHours: totalMinutes / 60,
      workedDates,
      burndown,
      timeBurndown,
    };
  },


  /**
   * Estadísticas grupales del proyecto
   */
  async getGroupStats(projectId: number, from?: string, to?: string) {
    const dateFilter: any = {};
    if (from) {
      const fromDate = new Date(from);
      if (isNaN(fromDate.getTime())) throw new Error('Formato de fecha "from" inválido');
      dateFilter.gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      if (isNaN(toDate.getTime())) throw new Error('Formato de fecha "to" inválido');
      dateFilter.lte = toDate;
    }

    // === 1. Tareas completadas en el proyecto ===
    const completedTasks = await prisma.changeHistory.findMany({
      where: {
        projectId,
        action: ActionType.STATUS_CHANGED,
        description: { contains: 'completed', mode: 'insensitive' },
        ...(from || to ? { createdAt: dateFilter } : {}),
      },
      select: {
        createdAt: true,
        taskId: true,
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
            status:true,
            dueDate: true,
            assignee: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const uniqueCompleted = new Map<number, { id: number; title: string; completedAt: Date; assignee?: any }>();
    for (const h of completedTasks) {
      if (h.task?.projectId === projectId) {
        uniqueCompleted.set(h.task.id, {
          id: h.task.id,
          title: h.task.title,
          completedAt: h.createdAt,
          assignee: h.task.assignee,
        });
      }
    }

    // === 2. Tiempo registrado en el proyecto ===
    const timeEntries = await prisma.taskTime.findMany({
      where: {
        task: { projectId },
        ...(from || to ? { date: dateFilter } : {}),
      },
      select: {
        durationMinutes: true,
        date: true,
        user: { select: { id: true, name: true } },
      },
      orderBy: { date: 'asc' },
    });

    const totalMinutes = timeEntries.reduce((sum, t) => sum + t.durationMinutes, 0);
    const workedDates = [...new Set(timeEntries.map(t => t.date.toISOString().slice(0, 10)))];

    // === 3. Burndown general del proyecto ===
    const burndown = Array.from(uniqueCompleted.values()).reduce((acc, t) => {
      const date = t.completedAt.toISOString().slice(0, 10);
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timeBurndown = timeEntries.reduce((acc, e) => {
      const date = e.date.toISOString().slice(0, 10);
      acc[date] = (acc[date] || 0) + e.durationMinutes;
      return acc;
    }, {} as Record<string, number>);

    // === 4. Participación por usuario ===
    const userSummary: Record<number, { name: string; minutes: number; completedTasks: number }> = {};
    for (const e of timeEntries) {
      if (!e.user) continue;
      const uid = e.user.id;
      if (!userSummary[uid]) {
        userSummary[uid] = { name: e.user.name, minutes: 0, completedTasks: 0 };
      }
      userSummary[uid].minutes += e.durationMinutes;
    }

    for (const t of uniqueCompleted.values()) {
      if (t.assignee) {
        const uid = t.assignee.id;
        if (!userSummary[uid]) {
          userSummary[uid] = { name: t.assignee.name, minutes: 0, completedTasks: 0 };
        }
        userSummary[uid].completedTasks += 1;
      }
    }

    console.log(uniqueCompleted)

    const completedCount = uniqueCompleted.size;
    const totalHours = totalMinutes / 60;
    const avgMinutesPerTask = completedCount ? totalMinutes / completedCount : 0;

    return {
      projectId,
      completedCount,
      totalMinutes,
      totalHours,
      avgMinutesPerTask,
      workedDates,
      burndown,
      timeBurndown,
      teamMembers: Object.entries(userSummary).map(([id, data]) => ({
        userId: Number(id),
        ...data,
        hours: data.minutes / 60,
      })),
    };
  },
};
