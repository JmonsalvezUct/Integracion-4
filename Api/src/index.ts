import "dotenv/config";
import express from 'express';
import tasksRouter from "./modules/tasks/task.routes.js";
import { prisma } from "./lib/prisma";

const app = express();
const port = process.env.PORT ?? 3000;


app.use(express.json());


app.get("/", (req, res) => {
  res.send("Hello World!");
});


app.get("/test", async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});


app.use("/api", tasksRouter); 



app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
