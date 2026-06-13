import Joi from 'joi';

export const aiComplianceResultSchema = Joi.object({
  overallScore: Joi.number().required(),
  results: Joi.array()
    .items(
      Joi.object({
        complianceRequirementId: Joi.string().required(),
        status: Joi.string().required(),
        isMandatory: Joi.boolean().optional(),
        currentTier: Joi.string().allow(null).optional(),
        requiredTier: Joi.string().allow(null).optional(),
        penalty: Joi.string().allow(null).optional(),
        fixSteps: Joi.array().items(Joi.string()).required(),
        missingActions: Joi.array().items(Joi.string()).required(),
      }),
    )
    .required(),
  suggestedCompliances: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        category: Joi.string().required(),
        isMandatory: Joi.boolean().optional(),
        status: Joi.string().required(),
        penalty: Joi.string().allow(null).optional(),
        fixSteps: Joi.array().items(Joi.string()).required(),
        missingActions: Joi.array().items(Joi.string()).required(),
      }),
    )
    .required(),
});

export interface AiSuggestedCompliance {
  name: string;
  category: string;
  isMandatory?: boolean | null;
  status: string;
  penalty?: string | null;
  fixSteps: string[];
  missingActions: string[];
}

export interface AiComplianceResult {
  overallScore: number;
  results: Array<{
    complianceRequirementId: string;
    status: string;
    isMandatory?: boolean | null;
    currentTier?: string | null;
    requiredTier?: string | null;
    penalty?: string | null;
    fixSteps: string[];
    missingActions: string[];
  }>;
  suggestedCompliances: AiSuggestedCompliance[];
}
