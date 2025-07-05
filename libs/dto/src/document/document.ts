import { z } from "zod";

export const documentSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1),
  filename: z.string().min(1),
  type: z.enum(["RESUME", "COVER_LETTER", "RESIGNATION_LETTER", "WEBSITE"]),
  fileUrl: z.string().url(),
  fileSize: z.number().int().positive().optional(),
  mimeType: z.string().optional(),
  userId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DocumentDto = z.infer<typeof documentSchema>;

export type Document = z.infer<typeof documentSchema>;

export {};
