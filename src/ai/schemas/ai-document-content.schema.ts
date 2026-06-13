import { z } from 'zod';

const sectionSchema = z.object({
  title: z.string(),
  content: z.string(),
  requiredFields: z.array(z.string()).optional(),
});

export const aiDocumentContentSchema = z.object({
  sections: z.array(sectionSchema),
});

export type AiDocumentContent = z.infer<typeof aiDocumentContentSchema>;
