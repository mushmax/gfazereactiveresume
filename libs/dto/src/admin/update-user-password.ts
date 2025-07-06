import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const adminUpdateUserPasswordSchema = z.object({
  newPassword: z.string().min(6),
});

export class AdminUpdateUserPasswordDto extends createZodDto(adminUpdateUserPasswordSchema) {}
