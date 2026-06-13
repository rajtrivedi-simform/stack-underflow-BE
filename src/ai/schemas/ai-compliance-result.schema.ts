import Joi from 'joi';

export const aiComplianceResultSchema = Joi.object({
  overallScore: Joi.number().required(),
  results: Joi.array()
    .items(
      Joi.object({
        complianceRequirementId: Joi.string().required(),
        status: Joi.string().required(),
        currentTier: Joi.string().allow(null).optional(),
        requiredTier: Joi.string().allow(null).optional(),
        penalty: Joi.string().allow(null).optional(),
        fixSteps: Joi.array().items(Joi.string()).required(),
        missingActions: Joi.array().items(Joi.string()).required(),
      }),
    )
    .required(),
});

export interface AiComplianceResult {
  overallScore: number;
  results: Array<{
    complianceRequirementId: string;
    status: string;
    currentTier?: string | null;
    requiredTier?: string | null;
    penalty?: string | null;
    fixSteps: string[];
    missingActions: string[];
  }>;
}
