import Joi from 'joi';

const sectionSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  requiredFields: Joi.array().items(Joi.string()).optional(),
});

export const aiDocumentContentSchema = Joi.object({
  sections: Joi.array().items(sectionSchema).required(),
});

export interface AiDocumentContent {
  sections: Array<{
    title: string;
    content: string;
    requiredFields?: string[];
  }>;
}
