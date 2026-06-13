import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  CORS_ORIGINS: Joi.string().default('http://localhost:4200'),

  DATABASE_URL: Joi.string().uri().required(),

  REDIS_URL: Joi.string().default('redis://localhost:6379'),
  REDIS_TTL_SECONDS: Joi.number().default(300),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  OPENAI_API_KEY: Joi.string().required(),
  OPENAI_MODEL: Joi.string().default('gpt-4o'),
  OPENAI_MAX_TOKENS: Joi.number().default(4096),

  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug', 'verbose').default('info'),
  LOG_DIR: Joi.string().default('./logs'),

  PROFILE_TTL_DAYS: Joi.number().default(90),
});
