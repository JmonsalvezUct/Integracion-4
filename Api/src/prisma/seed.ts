import { PrismaClient, ProjectRoleType, StatusType, PriorityType, ActionType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Función para generar fechas aleatorias dentro de un rango
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Función para obtener un elemento aleatorio de un array
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

// Función para obtener múltiples elementos aleatorios de un array
function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function main() {
  console.log('🧹 Limpiando base de datos...');
  // Limpiar base de datos
  await prisma.changeHistory.deleteMany();
  await prisma.taskTime.deleteMany();
  await prisma.taskTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.task.deleteMany();
  await prisma.userProject.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuarios usando bucles - 15 usuarios
  console.log('👥 Creando usuarios...');
  const usersData = [
    { name: 'Admin User', email: 'admin@test.com', password: '12345678' },
    { name: 'Developer One', email: 'dev1@test.com', password: '12345678' },
    { name: 'Developer Two', email: 'dev2@test.com', password: '12345678' },
    { name: 'Senior Developer', email: 'senior@test.com', password: '12345678' },
    { name: 'Junior Developer', email: 'junior@test.com', password: '12345678' },
    { name: 'Tester One', email: 'tester1@test.com', password: '12345678' },
    { name: 'Tester Two', email: 'tester2@test.com', password: '12345678' },
    { name: 'Designer One', email: 'designer1@test.com', password: '12345678' },
    { name: 'Designer Two', email: 'designer2@test.com', password: '12345678' },
    { name: 'Project Manager', email: 'pm@test.com', password: '12345678' },
    { name: 'Product Owner', email: 'po@test.com', password: '12345678' },
    { name: 'DevOps Engineer', email: 'devops@test.com', password: '12345678' },
    { name: 'Frontend Lead', email: 'frontend@test.com', password: '12345678' },
    { name: 'Backend Lead', email: 'backend@test.com', password: '12345678' },
    { name: 'QA Lead', email: 'qa@test.com', password: '12345678' },
  ];

  const users = [];
  for (const userData of usersData) {
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: await bcrypt.hash(userData.password, 10),
      },
    });
    users.push(user);
  }

  // Crear proyectos usando bucles - 8 proyectos
  console.log('🏗️ Creando proyectos...');
  const projectsData = [
    {
      name: 'E-commerce Platform',
      description: 'Development of a full e-commerce solution with payment integration',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
    },
    {
      name: 'Mobile Banking App',
      description: 'Secure mobile banking application with biometric authentication',
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-11-30'),
    },
    {
      name: 'Healthcare Management System',
      description: 'Comprehensive system for patient records and appointment scheduling',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-10-31'),
    },
    {
      name: 'Learning Management System',
      description: 'Online platform for course management and student tracking',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-09-30'),
    },
    {
      name: 'IoT Smart Home',
      description: 'Internet of Things platform for smart home automation',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2025-12-15'),
    },
    {
      name: 'Social Media Analytics',
      description: 'Analytics dashboard for social media performance metrics',
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-08-31'),
    },
    {
      name: 'Inventory Management',
      description: 'Real-time inventory tracking and management system',
      startDate: new Date('2025-03-15'),
      endDate: new Date('2025-07-31'),
    },
    {
      name: 'CRM System',
      description: 'Customer relationship management with sales pipeline',
      startDate: new Date('2025-02-15'),
      endDate: new Date('2025-06-30'),
    },
  ];

  const projects = [];
  for (const projectData of projectsData) {
    const project = await prisma.project.create({
      data: projectData,
    });
    projects.push(project);
  }

  // Asignar usuarios a proyectos usando bucles anidados
  console.log('🔗 Asignando usuarios a proyectos...');
  const roles = [ProjectRoleType.admin, ProjectRoleType.developer, ProjectRoleType.guest];
  
  for (const project of projects) {
    // Cada proyecto tiene entre 5-10 usuarios asignados
    const projectUsers = getRandomElements(users, 5 + Math.floor(Math.random() * 6));
    
    for (let i = 0; i < projectUsers.length; i++) {
      const role = i === 0 ? ProjectRoleType.admin : getRandomElement(roles);
      await prisma.userProject.create({
        data: {
          userId: projectUsers[i]!.id,
          projectId: project.id,
          role: role,
        },
      });
    }
  }

  // Crear tags para cada proyecto usando bucles anidados
  console.log('🏷️ Creando tags...');
  const tagsData = [
    { name: 'Frontend', color: '#ff4444' },
    { name: 'Backend', color: '#44ff44' },
    { name: 'Database', color: '#4444ff' },
    { name: 'UI/UX', color: '#ffff44' },
    { name: 'Testing', color: '#ff44ff' },
    { name: 'Bug', color: '#ff8844' },
    { name: 'Feature', color: '#44ff99' },
    { name: 'Documentation', color: '#9966cc' },
    { name: 'Security', color: '#ff3366' },
    { name: 'Performance', color: '#33ccff' },
    { name: 'Mobile', color: '#ffcc00' },
    { name: 'API', color: '#00cc99' },
    { name: 'DevOps', color: '#666699' },
    { name: 'Hotfix', color: '#ff6666' },
    { name: 'Enhancement', color: '#66ff66' },
  ];

  const allTags = [];
  for (const project of projects) {
    // Cada proyecto tiene 8-12 tags
    const projectTagsCount = 8 + Math.floor(Math.random() * 5);
    const projectTags = getRandomElements(tagsData, projectTagsCount);
    
    for (const tagData of projectTags) {
      const tag = await prisma.tag.create({
        data: {
          ...tagData,
          projectId: project.id,
        },
      });
      allTags.push(tag);
    }
  }

  // Crear tareas usando bucles - 200 tareas en total
  console.log('📝 Creando tareas...');
  const taskTitles = [
    'Implement user authentication system',
    'Design responsive landing page',
    'Setup PostgreSQL database schema',
    'Write comprehensive unit tests',
    'Fix login page validation bug',
    'Optimize application performance',
    'Integrate Stripe payment gateway',
    'Create admin dashboard',
    'Implement mobile responsive design',
    'Write API documentation',
    'Deploy to production server',
    'Setup CI/CD pipeline',
    'Implement real-time notifications',
    'Design user profile page',
    'Add two-factor authentication',
    'Optimize database queries',
    'Create data migration scripts',
    'Implement search functionality',
    'Setup error logging system',
    'Design email templates',
    'Implement file upload feature',
    'Create analytics dashboard',
    'Setup backup system',
    'Implement dark mode',
    'Optimize images and assets',
    'Create user onboarding flow',
    'Implement social media sharing',
    'Setup monitoring and alerts',
    'Design mobile app icons',
    'Implement push notifications',
  ];

  const statuses = [StatusType.created, StatusType.in_progress, StatusType.completed, StatusType.archived];
  const priorities = [PriorityType.low, PriorityType.medium, PriorityType.high];

  const allTasks = [];
  for (const project of projects) {
    // Cada proyecto tiene 20-35 tareas
    const tasksCount = 20 + Math.floor(Math.random() * 16);
    const projectUsers = await prisma.userProject.findMany({
      where: { projectId: project.id },
      include: { user: true },
    });

    for (let i = 0; i < tasksCount; i++) {
      const creator = getRandomElement(projectUsers).user;
      const assignee = getRandomElement(projectUsers).user;
      const status = getRandomElement(statuses);
      const priority = getRandomElement(priorities);
      const createdAt = randomDate(project.startDate!, new Date(project.endDate!.getTime() - 7 * 24 * 60 * 60 * 1000));

      const task = await prisma.task.create({
        data: {
          title: `${getRandomElement(taskTitles)} - ${project.name.substring(0, 15)}`,
          description: `Task description for ${project.name}. This involves implementing features and fixing issues.`,
          creatorId: creator.id,
          assigneeId: assignee.id,
          projectId: project.id,
          status: status,
          priority: priority,
          createdAt: createdAt,
        },
      });
      allTasks.push(task);

      // Asignar 1-4 tags aleatorios a cada tarea
      const projectTags = allTags.filter(tag => tag.projectId === project.id);
      const taskTags = getRandomElements(projectTags, 1 + Math.floor(Math.random() * 4));
      
      for (const tag of taskTags) {
        await prisma.taskTag.create({
          data: {
            taskId: task.id,
            tagId: tag.id,
          },
        });
      }

      // Crear historial de cambios para cada tarea
      const changeHistory = [];
      changeHistory.push({
        action: ActionType.CREATED,
        description: 'Task created',
        userId: creator.id,
        taskId: task.id,
        projectId: project.id,
        createdAt: createdAt,
      });

      // Si la tarea no está en "created", agregar cambios de estado
      if (status !== StatusType.created) {
        const statusChangeDate = randomDate(createdAt, new Date());
        changeHistory.push({
          action: ActionType.STATUS_CHANGED,
          description: `Status changed to ${status}`,
          userId: assignee.id,
          taskId: task.id,
          projectId: project.id,
          createdAt: statusChangeDate,
        });
      }

      // 30% de probabilidad de tener cambios adicionales
      if (Math.random() < 0.3) {
        changeHistory.push({
          action: getRandomElement([ActionType.STATUS_CHANGED]),
          description: ' se cambia a estado "completed"',
          userId: getRandomElement(projectUsers).user.id,
          taskId: task.id,
          projectId: project.id,
          createdAt: randomDate(createdAt, new Date()),
        });
      }

      await prisma.changeHistory.createMany({
        data: changeHistory,
      });

      // Crear tiempos de trabajo para cada tarea
      const timeEntries = [];
      const timeEntriesCount = 1 + Math.floor(Math.random() * 4); // 1-4 entradas de tiempo por tarea
      
      for (let j = 0; j < timeEntriesCount; j++) {
        timeEntries.push({
          taskId: task.id,
          userId: assignee.id,
          durationMinutes: 30 + Math.floor(Math.random() * 480), // 30 min - 8 horas
          date: randomDate(createdAt, new Date()),
          description: `Work session ${j + 1} on ${task.title.substring(0, 30)}`,
        });
      }

      await prisma.taskTime.createMany({
        data: timeEntries,
      });
    }
  }

  console.log('✅ Base de datos poblada exitosamente!');
  console.log(`📊 Estadísticas:`);
  console.log(`   👥 Usuarios: ${users.length}`);
  console.log(`   🏗️ Proyectos: ${projects.length}`);
  console.log(`   🏷️ Tags: ${allTags.length}`);
  console.log(`   📝 Tareas: ${allTasks.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });