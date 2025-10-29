
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

    return {
      completedTasks,
      completedTasksCount: completedTasks.length,
      totalMinutes,
      totalHours: totalMinutes / 60,
      workedDates,
      burndown,
      timeBurndown,
    };
	},
};
