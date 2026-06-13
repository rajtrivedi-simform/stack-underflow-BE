import Joi from 'joi';

const gapBridgeStepSchema = Joi.object({
  condition: Joi.string().required(),
  steps: Joi.array().items(Joi.string()).required(),
  effort: Joi.string().valid('instant', 'easy', 'moderate', 'complex').required(),
  cost: Joi.string().required(),
});

export const aiMatchResultSchema = Joi.object({
  matches: Joi.array()
    .items(
      Joi.object({
        schemeId: Joi.string().required(),
        status: Joi.string().required(),
        matchScore: Joi.number().required(),
        confidenceScore: Joi.number().required(),
        explanation: Joi.string().required(),
        metCriteria: Joi.array().items(Joi.string()).required(),
        unmetCriteria: Joi.array().items(Joi.string()).required(),
        gapBridgeSteps: Joi.array().items(gapBridgeStepSchema).required(),
        remediationCost: Joi.string().optional(),
        remediationEffort: Joi.string().optional(),
        unlocksOtherSchemes: Joi.array().items(Joi.string()).optional(),
      }),
    )
    .required(),
});

export interface AiMatchResult {
  matches: Array<{
    schemeId: string;
    status: string;
    matchScore: number;
    confidenceScore: number;
    explanation: string;
    metCriteria: string[];
    unmetCriteria: string[];
    gapBridgeSteps: Array<{
      condition: string;
      steps: string[];
      effort: 'instant' | 'easy' | 'moderate' | 'complex';
      cost: string;
    }>;
    remediationCost?: string;
    remediationEffort?: string;
    unlocksOtherSchemes?: string[];
  }>;
}
