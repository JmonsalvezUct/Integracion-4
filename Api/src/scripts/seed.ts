import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding...');

  // Crear varios proyectos de prueba
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'FastPlanner - Desarrollo',
        description: 'Proyecto principal de la aplicación',
      }
    }),
    prisma.project.create({
      data: {
        name: 'Documentación API',
        description: 'Documentar todos los endpoints',
      }
    }),
    prisma.project.create({
      data: {
        name: 'Testing',
        description: 'Crear tests unitarios',
      }
    })
  ]);

  console.log('✅ Proyectos creados:', projects.length);
  projects.forEach(project => {
    console.log(`   - ${project.name} (ID: ${project.id})`);
  });
}

main()
  .catch((error) => {
    console.error('❌ Error en seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });