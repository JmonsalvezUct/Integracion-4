import { z } from "zod";

export const CreateInvitationDTO = z.object({
    email: z.string().email(),
    role: z.enum(["admin","developer","guest"]).optional().default("developer"),
});

export type CreateInvitationDTO = z.infer<typeof CreateInvitationDTO>;
