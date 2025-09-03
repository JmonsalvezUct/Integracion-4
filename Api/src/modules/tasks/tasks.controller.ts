import { Request, Response } from "express";
import { createTaskSvc } from "./tasks.service";

export async function postTask(req: Request, res: Response) {
  try {
    const task = await createTaskSvc(req.body);
    return res.status(201).json(task);
  } catch (e: any) {
    return res.status(400).json({ message: e?.message ?? "Bad Request" });
  }
}
