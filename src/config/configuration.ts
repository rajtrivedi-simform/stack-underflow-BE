export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    corsOrigins: process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) ?? [],
  },
  database: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    ttlSeconds: parseInt(process.env.REDIS_TTL_SECONDS ?? '300', 10),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL ?? 'gpt-4o',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS ?? '4096', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL ?? 'info',
    dir: process.env.LOG_DIR ?? './logs',
  },
  data: {
    profileTtlDays: parseInt(process.env.PROFILE_TTL_DAYS ?? '90', 10),
  },
});
