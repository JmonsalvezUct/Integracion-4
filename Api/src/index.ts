import "dotenv/config";
import express from "express";
import { prisma } from "./lib/prisma";
import tasksRoutes from "./modules/tasks/tasks.routes"; 

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.get("/test", async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});


app.use("/api/tasks", tasksRoutes);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
