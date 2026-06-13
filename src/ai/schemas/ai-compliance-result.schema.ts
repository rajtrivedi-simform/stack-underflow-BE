import { z } from 'zod';

export const aiComplianceResultSchema = z.object({
  overallScore: z.number(),
  results: z.array(
    z.object({
      complianceRequirementId: z.string(),
      status: z.string(),
      currentTier: z.string().nullable().optional(),
      requiredTier: z.string().nullable().optional(),
      penalty: z.string().nullable().optional(),
      fixSteps: z.array(z.string()),
      missingActions: z.array(z.string()),
    }),
  ),
});

export type AiComplianceResult = z.infer<typeof aiComplianceResultSchema>;
