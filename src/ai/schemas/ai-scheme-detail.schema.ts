import { z } from 'zod';

export const aiSchemeDetailSchema = z.object({
  explanation: z.string(),
  eligibilityCriteria: z.array(z.string()),
  eligibilityStatus: z.enum(['ELIGIBLE', 'PARTIAL', 'INELIGIBLE']),
  eligibilityReason: z.string(),
  legalWorkarounds: z.array(z.string()),
  similarSchemes: z.array(z.string()),
  sourceUrls: z.array(z.string()),
});

export type AiSchemeDetail = z.infer<typeof aiSchemeDetailSchema>;
