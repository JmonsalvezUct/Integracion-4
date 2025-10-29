
import { prisma } from "../app/loaders/prisma.js";
import bcrypt from "bcrypt";
import { ProjectRoleType, StatusType, PriorityType } from "@prisma/client";

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.notificationType.createMany({
    data: [{ type: "TaskAssigned" }, { type: "ProjectUpdated" }],
    skipDuplicates: true,
  });


  // Create many users
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const passwordHash = await bcrypt.hash(`password${i}`, 10);
    users.push(await prisma.user.create({
      data: {
        name: `User${i}`,
        email: `user${i}@example.com`,
        password: passwordHash,
      },
    }));
  }

  // Create many projects
  const projects = [];
  for (let i = 1; i <= 5; i++) {
    projects.push(await prisma.project.create({
      data: {
        name: `Project${i}`,
        description: `Description for project ${i}`,
      },
    }));
  }

  // Assign users to projects with different roles
  for (let i = 0; i < projects.length; i++) {
    // First user is always admin
    await prisma.userProject.create({
      data: {
        userId: users[0]?.id!,
        projectId: projects[i]?.id!,
        role: ProjectRoleType.admin,
      },
    });
    // Other users get random roles
    for (let j = 1; j < users.length; j++) {
      const roles = [ProjectRoleType.developer, ProjectRoleType.guest];
      await prisma.userProject.create({
        data: {
          userId: users[j]?.id!,
          projectId: projects[i]?.id!,
          role: roles[Math.floor(Math.random() * roles.length)],
        },
      });
    }
  }

  // Create many tasks for each project
  for (const project of projects) {
    for (let t = 1; t <= 20; t++) {
      await prisma.task.create({
        data: {
          title: `Task ${t} for ${project.name}`,
          description: `Description for task ${t}`,
          creatorId: users[Math.floor(Math.random() * users.length)]?.id!,
          assigneeId: users[Math.floor(Math.random() * users.length)]?.id!,
          projectId: project.id!,
          status: [StatusType.created, StatusType.in_progress, StatusType.completed, StatusType.archived][Math.floor(Math.random() * 4)],
          priority: [PriorityType.high, PriorityType.medium, PriorityType.low][Math.floor(Math.random() * 3)],
        },
      });
    }
  }

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
