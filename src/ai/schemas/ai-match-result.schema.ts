import { z } from 'zod';

const gapBridgeStepSchema = z.object({
  condition: z.string(),
  steps: z.array(z.string()),
  effort: z.enum(['instant', 'easy', 'moderate', 'complex']),
  cost: z.string(),
});

export const aiMatchResultSchema = z.object({
  matches: z.array(
    z.object({
      schemeId: z.string(),
      status: z.string(),
      matchScore: z.number(),
      confidenceScore: z.number(),
      explanation: z.string(),
      metCriteria: z.array(z.string()),
      unmetCriteria: z.array(z.string()),
      gapBridgeSteps: z.array(gapBridgeStepSchema),
      remediationCost: z.string().optional(),
      remediationEffort: z.string().optional(),
      unlocksOtherSchemes: z.array(z.string()).optional(),
    }),
  ),
});

export type AiMatchResult = z.infer<typeof aiMatchResultSchema>;
