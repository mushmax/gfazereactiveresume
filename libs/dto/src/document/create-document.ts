import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  filename: z.string().min(1, "Filename is required"),
  type: z.enum(["RESUME", "COVER_LETTER", "RESIGNATION_LETTER", "WEBSITE"]),
  fileUrl: z.string().url("Invalid file URL"),
  fileSize: z.number().int().positive().optional(),
  mimeType: z.string().optional(),
});

export type CreateDocumentDto = z.infer<typeof createDocumentSchema>;

export type CreateDocument = z.infer<typeof createDocumentSchema>;

export {};
