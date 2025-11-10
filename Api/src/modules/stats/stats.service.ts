
import { prisma } from '../../app/loaders/prisma.js';
import { ActionType } from '@prisma/client';

export const statsService = {
  /**
   * Obtiene estadísticas de desempeño individual para un usuario en un periodo
   * @param userId ID del usuario
   * @param from fecha inicio (formato YYYY-MM-DD, opcional)
   * @param to fecha fin (formato YYYY-MM-DD, opcional)
   * @returns Estadísticas de desempeño individual incluyendo tareas completadas y tiempos
   */
  async getUserStats(userId: number, from?: string, to?: string) {
    // Validación de fechas
    const dateFilter: any = {};
    if (from) {
      const fromDate = new Date(from);
      if (isNaN(fromDate.getTime())) {
        throw new Error('Formato de fecha "from" inválido. Use YYYY-MM-DD');
      }
      dateFilter.gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      if (isNaN(toDate.getTime())) {
        throw new Error('Formato de fecha "to" inválido. Use YYYY-MM-DD');
      }
      dateFilter.lte = toDate;
    }    
    
    // Buscar cambios de estado a completado en el historial
    const taskCompletionHistory = await prisma.changeHistory.findMany({
      where: {
        action: ActionType.STATUS_CHANGED,
        description: {
          contains: 'completed',
          mode: 'insensitive'
        },
        userId,
        ...(from || to ? { createdAt: dateFilter } : {}),
      },
      select: {
        taskId: true,
        createdAt: true,
        task: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            status: true,
            dueDate: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Filtrar tareas únicas y agregar fecha de completado
    const completedTasks = taskCompletionHistory
      .filter(h => h.task !== null)
      .map(h => ({
        ...h.task!,
        completedAt: h.createdAt
      }));

    // Horas trabajadas y fechas trabajadas
		const timeEntries = await prisma.taskTime.findMany({
			where: {
				userId,
				...(from || to ? { date: dateFilter } : {}),
			},
			select: {
				durationMinutes: true,
				date: true,
			},
			orderBy: { date: 'asc' },
		});
    
		const totalMinutes = timeEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
		const workedDates = [...new Set(timeEntries.map(e => e.date?.toISOString().slice(0, 10)))];

    // Burndown: tareas completadas por fecha usando el momento en que se marcaron como completadas.
    const burndown = completedTasks.reduce((acc, t) => {
      const date = t.completedAt.toISOString().slice(0, 10);
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Burndown de tiempo empleado por fecha
    const timeBurndown = timeEntries.reduce((acc, entry) => {
      if (entry.date) {
        const date = entry.date.toISOString().slice(0, 10);
        acc[date] = (acc[date] || 0) + entry.durationMinutes;
      }
      return acc;
    }, {} as Record<string, number>);

    // Total de tareas asignadas al usuario en el periodo
    const assignedTasksCount = await prisma.task.count({
      where: {
        assigneeId: userId,
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


  async getGroupStats(projectId: number, from?: string, to?: string) {
    const dateFilter: any = {};
    if (from) {
      const fromDate = new Date(from);
      if (isNaN(fromDate.getTime())) {
        throw new Error('Formato de fecha "from" inválido');
      }
      dateFilter.gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      if (isNaN(toDate.getTime())) {
        throw new Error('Formato de fecha "to" inválido');
      }
      dateFilter.lte = toDate;
    }

    // === 1. Total de tareas del proyecto ===
    const totalTasks = await prisma.task.count({
      where: {
        projectId,
        ...(from || to ? { createdAt: dateFilter } : {})
      }
    });

    // === 2. Tareas completadas en el período ===
    const completedTasks = await prisma.changeHistory.findMany({
      where: {
        projectId,
        action: ActionType.STATUS_CHANGED,
        description: { contains: 'completed', mode: 'insensitive' },
        ...(from || to ? { createdAt: dateFilter } : {})
      },
      select: {
        createdAt: true,
        taskId: true,
        task: {
          select: {
            id: true,
            title: true,
            assignee: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const uniqueCompleted = new Map<number, { id: number; title: string; completedAt: Date; assignee?: any }>();
    for (const h of completedTasks) {
      if (h.task) {
        uniqueCompleted.set(h.task.id, {
          id: h.task.id,
          title: h.task.title,
          completedAt: h.createdAt,
          assignee: h.task.assignee
        });
      }
    }

    // === 3. Tiempo total registrado por miembros ===
    const timeEntries = await prisma.taskTime.findMany({
      where: {
        task: { projectId },
        ...(from || to ? { date: dateFilter } : {})
      },
      select: {
        durationMinutes: true,
        date: true,
        user: { select: { id: true, name: true } }
      },
      orderBy: { date: 'asc' }
    });

    const totalMinutes = timeEntries.reduce((sum, t) => sum + t.durationMinutes, 0);
    const workedDates = [...new Set(timeEntries.map(t => t.date.toISOString().slice(0, 10)))];

    // === 4. Burndown de tareas (completadas por día) ===
    const burndown = completedTasks.reduce((acc, t) => {
      const date = t.createdAt.toISOString().slice(0, 10);
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // === 5. Burndown de tiempo (minutos registrados por día) ===
    const timeBurndown = timeEntries.reduce((acc, e) => {
      const date = e.date.toISOString().slice(0, 10);
      acc[date] = (acc[date] || 0) + e.durationMinutes;
      return acc;
    }, {} as Record<string, number>);

    // === 6. Participación por usuario (tiempo total y tareas completadas) ===
    const userSummary: Record<number, { name: string; minutes: number; completedTasks: number }> = {};
    for (const entry of timeEntries) {
      if (!entry.user) continue;
      const uid = entry.user.id;
      if (!userSummary[uid]) {
        userSummary[uid] = { name: entry.user.name, minutes: 0, completedTasks: 0 };
      }
      userSummary[uid].minutes += entry.durationMinutes;
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

    // === 7. Totales ===
    const completedCount = uniqueCompleted.size;
    const totalHours = totalMinutes / 60;
    const avgMinutesPerTask = completedCount ? totalMinutes / completedCount : 0;

    return {
      projectId,
      totalTasks,
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
        hours: data.minutes / 60
      })),
    };
  },

};
