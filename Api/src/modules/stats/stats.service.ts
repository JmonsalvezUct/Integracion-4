import { ActionType } from '@prisma/client';
import { prisma } from '../../app/loaders/prisma.js';

export const statsService = {

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

    // === 1. Traer todas las tareas del proyecto con su historial ===
    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        ...(from || to ? { createdAt: dateFilter } : {}),
      },
      include: {
        assignee: { select: { id: true, name: true } },
        history: {
          orderBy: { createdAt: 'asc' },
          select: { description: true, createdAt: true },
        },
      },
    });

    // === 2. Determinar tareas completadas (último cambio = completed) ===
    const completedTasks = tasks
      .filter(task => {
        const lastChange = task.history[task.history.length - 1];
        return lastChange && lastChange.description.toLowerCase().includes('completed');
      })
      .map(task => {
        const lastChange = task.history[task.history.length - 1];
        return {
          id: task.id,
          title: task.title,
          completedAt: lastChange!.createdAt,
          assignee: task.assignee,
        };
      });

    // === 3. Obtener tiempos del proyecto ===
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

    // === 4. Burndown general (tareas completadas por día) ===
    const burndown = completedTasks.reduce((acc, t) => {
      const date = t.completedAt.toISOString().slice(0, 10);
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // === 5. Burndown de tiempo (minutos por día) ===
    const timeBurndown = timeEntries.reduce((acc, e) => {
      const date = e.date.toISOString().slice(0, 10);
      acc[date] = (acc[date] || 0) + e.durationMinutes;
      return acc;
    }, {} as Record<string, number>);

    // === 6. Resumen por usuario ===
    const userSummary: Record<number, { name: string; minutes: number; completedTasks: number }> = {};

    for (const e of timeEntries) {
      if (!e.user) continue;
      const uid = e.user.id;
      if (!userSummary[uid]) userSummary[uid] = { name: e.user.name, minutes: 0, completedTasks: 0 };
      userSummary[uid].minutes += e.durationMinutes;
    }

    for (const t of completedTasks) {
      if (t.assignee) {
        const uid = t.assignee.id;
        if (!userSummary[uid]) userSummary[uid] = { name: t.assignee.name, minutes: 0, completedTasks: 0 };
        userSummary[uid].completedTasks += 1;
      }
    }

    const completedCount = completedTasks.length;
    const totalHours = totalMinutes / 60;
    const avgMinutesPerTask = completedCount ? totalMinutes / completedCount : 0;

    return {
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
