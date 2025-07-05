import { z } from "zod";

export const updateDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  type: z.enum(["RESUME", "COVER_LETTER", "RESIGNATION_LETTER", "WEBSITE"]).optional(),
});

export type UpdateDocumentDto = z.infer<typeof updateDocumentSchema>;

export type UpdateDocument = z.infer<typeof updateDocumentSchema>;

export {};
