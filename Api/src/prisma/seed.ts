import {prisma}  from "../app/loaders/prisma.js";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Seeding database...");

  // Roles de proyecto
  const adminRole = await prisma.projectRole.create({ data: { role: "Admin" } });
  const memberRole = await prisma.projectRole.create({ data: { role: "Member" } });

  // Estados
  await prisma.status.createMany({
    data: [{ status: "To Do" }, { status: "In Progress" }, { status: "Done" }],
    skipDuplicates: true,
  });

  // Prioridades
  await prisma.priority.createMany({
    data: [{ priority: "Low" }, { priority: "Medium" }, { priority: "High" }],
    skipDuplicates: true,
  });

  // Tipos de adjuntos
  await prisma.attachmentType.createMany({
    data: [{ type: "Image" }, { type: "Document" }, { type: "Link" }],
    skipDuplicates: true,
  });

  // Tipos de notificación
  await prisma.notificationType.createMany({
    data: [{ type: "TaskAssigned" }, { type: "ProjectUpdated" }],
    skipDuplicates: true,
  });

  // Acciones de historial
  await prisma.action.createMany({
    data: [{ action: "Created" }, { action: "Updated" }, { action: "Deleted" }],
    skipDuplicates: true,
  });

  // Usuario de prueba
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: passwordHash,
    },
  });

  // Proyecto inicial
  const project = await prisma.project.create({
    data: {
      name: "Proyecto Demo",
      description: "Proyecto de ejemplo para testing",
    },
  });

  // Relación usuario-proyecto con rol
  await prisma.userProject.create({
    data: {
      userId: user.id,
      projectId: project.id,
      roleId: adminRole.id,
    },
  });

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
