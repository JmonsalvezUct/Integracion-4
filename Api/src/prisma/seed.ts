import { PrismaClient, ProjectRoleType, StatusType, PriorityType, ActionType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Limpiar base de datos
  await prisma.changeHistory.deleteMany();
  await prisma.taskTime.deleteMany();
  await prisma.taskTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.task.deleteMany();
  await prisma.userProject.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuarios
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@test.com',
      password: await bcrypt.hash('12345678', 10),
    },
  });

  const developer1 = await prisma.user.create({
    data: {
      name: 'Developer One',
      email: 'dev1@test.com',
      password: await bcrypt.hash('12345678', 10),
    },
  });

  const developer2 = await prisma.user.create({
    data: {
      name: 'Developer Two',
      email: 'dev2@test.com',
      password: await bcrypt.hash('12345678', 10),
    },
  });

  // Crear proyecto
  const project = await prisma.project.create({
    data: {
      name: 'Test Project',
      description: 'A test project for statistics',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-12-31'),
    },
  });

  // Asignar usuarios al proyecto
  await prisma.userProject.createMany({
    data: [
      {
        userId: admin.id,
        projectId: project.id,
        role: ProjectRoleType.admin,
      },
      {
        userId: developer1.id,
        projectId: project.id,
        role: ProjectRoleType.developer,
      },
      {
        userId: developer2.id,
        projectId: project.id,
        role: ProjectRoleType.developer,
      },
    ],
  });

  // Crear tags
  const tag1 = await prisma.tag.create({
    data: {
      name: 'Frontend',
      color: '#ff0000',
      projectId: project.id,
    },
  });

  const tag2 = await prisma.tag.create({
    data: {
      name: 'Backend',
      color: '#00ff00',
      projectId: project.id,
    },
  });

  // Crear tareas y registrar cambios
  // Tarea 1: Completada rápidamente
  const task1 = await prisma.task.create({
    data: {
      title: 'Task 1',
      description: 'Quick task',
      creatorId: admin.id,
      assigneeId: developer1.id,
      projectId: project.id,
      status: StatusType.created,
      priority: PriorityType.high,
      tags: {
        create: [{ tagId: tag1.id }],
      },
    },
  });

  await prisma.changeHistory.createMany({
    data: [
      {
        action: ActionType.CREATED,
        description: 'Task created',
        userId: admin.id,
        taskId: task1.id,
        projectId: project.id,
        createdAt: new Date('2025-10-15T10:00:00Z'),
      },
      {
        action: ActionType.STATUS_CHANGED,
        description: 'Status changed to completed',
        userId: developer1.id,
        taskId: task1.id,
        projectId: project.id,
        createdAt: new Date('2025-10-15T14:00:00Z'),
      },
    ],
  });

  // Tarea 2: En progreso por más tiempo
  const task2 = await prisma.task.create({
    data: {
      title: 'Task 2',
      description: 'Longer task',
      creatorId: admin.id,
      assigneeId: developer1.id,
      projectId: project.id,
      status: StatusType.completed,
      priority: PriorityType.medium,
      tags: {
        create: [{ tagId: tag2.id }],
      },
    },
  });

  await prisma.changeHistory.createMany({
    data: [
      {
        action: ActionType.CREATED,
        description: 'Task created',
        userId: admin.id,
        taskId: task2.id,
        projectId: project.id,
        createdAt: new Date('2025-10-16T09:00:00Z'),
      },
      {
        action: ActionType.STATUS_CHANGED,
        description: 'Status changed to in_progress',
        userId: developer1.id,
        taskId: task2.id,
        projectId: project.id,
        createdAt: new Date('2025-10-16T11:00:00Z'),
      },
      {
        action: ActionType.STATUS_CHANGED,
        description: 'Status changed to completed',
        userId: developer1.id,
        taskId: task2.id,
        projectId: project.id,
        createdAt: new Date('2025-10-17T16:00:00Z'),
      },
    ],
  });

  // Tarea 3: Aún en progreso
  const task3 = await prisma.task.create({
    data: {
      title: 'Task 3',
      description: 'Ongoing task',
      creatorId: admin.id,
      assigneeId: developer1.id,
      projectId: project.id,
      status: StatusType.in_progress,
      priority: PriorityType.medium,
    },
  });

  await prisma.changeHistory.createMany({
    data: [
      {
        action: ActionType.CREATED,
        description: 'Task created',
        userId: admin.id,
        taskId: task3.id,
        projectId: project.id,
        createdAt: new Date('2025-10-18T10:00:00Z'),
      },
      {
        action: ActionType.STATUS_CHANGED,
        description: 'Status changed to in_progress',
        userId: developer1.id,
        taskId: task3.id,
        projectId: project.id,
        createdAt: new Date('2025-10-18T11:00:00Z'),
      },
    ],
  });

  // Registrar tiempos de trabajo
  await prisma.taskTime.createMany({
    data: [
      // Tiempos para Task 1
      {
        taskId: task1.id,
        userId: developer1.id,
        durationMinutes: 120, // 2 horas
        date: new Date('2025-10-15T10:30:00Z'),
        description: 'Initial work',
      },
      {
        taskId: task1.id,
        userId: developer1.id,
        durationMinutes: 60, // 1 hora
        date: new Date('2025-10-15T13:30:00Z'),
        description: 'Finishing touches',
      },
      // Tiempos para Task 2
      {
        taskId: task2.id,
        userId: developer1.id,
        durationMinutes: 180, // 3 horas
        date: new Date('2025-10-16T11:30:00Z'),
        description: 'First session',
      },
      {
        taskId: task2.id,
        userId: developer1.id,
        durationMinutes: 240, // 4 horas
        date: new Date('2025-10-17T10:30:00Z'),
        description: 'Second session',
      },
      // Tiempos para Task 3
      {
        taskId: task3.id,
        userId: developer1.id,
        durationMinutes: 150, // 2.5 horas
        date: new Date('2025-10-18T11:30:00Z'),
        description: 'Ongoing work',
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
