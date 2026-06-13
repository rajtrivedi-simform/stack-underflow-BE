import Joi from 'joi';

export const aiSchemeDetailSchema = Joi.object({
  explanation: Joi.string().required(),
  eligibilityCriteria: Joi.array().items(Joi.string()).required(),
  eligibilityStatus: Joi.string().valid('ELIGIBLE', 'PARTIAL', 'INELIGIBLE').required(),
  eligibilityReason: Joi.string().required(),
  legalWorkarounds: Joi.array().items(Joi.string()).required(),
  similarSchemes: Joi.array().items(Joi.string()).required(),
  sourceUrls: Joi.array().items(Joi.string()).required(),
});

export interface AiSchemeDetail {
  explanation: string;
  eligibilityCriteria: string[];
  eligibilityStatus: 'ELIGIBLE' | 'PARTIAL' | 'INELIGIBLE';
  eligibilityReason: string;
  legalWorkarounds: string[];
  similarSchemes: string[];
  sourceUrls: string[];
}
