  import type { Response } from "express";
  import type { AuthRequest } from "../../middlewares/auth.middleware.js";
  import { usersService } from "./users.service.js";
  import { UpdateUserDTO } from "./users.validators.js";

  export const getCurrentUser = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "No autorizado" });
    try {
      const user = await usersService.getUserById(req.user.id);
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener el usuario" });
    }
  };

  export const updateCurrentUser = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "No autorizado" });

    try {
      const dto = UpdateUserDTO.parse(req.body);
      const updated = await usersService.updateUser(req.user.id, dto);
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Error en los datos enviados" });
    }
  };