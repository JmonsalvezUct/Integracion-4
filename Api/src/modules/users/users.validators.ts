import { z } from "zod";

export const UpdateUserDTO = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  profilePicture: z.string().url("Debe ser una URL válida").optional(),
});
